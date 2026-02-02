import {
    PipeTransform,
    Injectable,
    ArgumentMetadata,
    BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { WsException } from '@nestjs/websockets';

/**
 * Pipe de validación para mensajes WebSocket
 *
 * Funciona igual que el ValidationPipe de NestJS pero lanza WsException
 * en lugar de BadRequestException para que el cliente WebSocket reciba
 * el error correctamente.
 *
 * @example
 * // En el gateway, aplicar a nivel de método o parámetro
 * @SubscribeMessage('room:join')
 * async handleJoinRoom(
 *     @MessageBody(new WsValidationPipe()) data: JoinRoomDto,
 *     @ConnectedSocket() client: Socket,
 * ): Promise<void> { ... }
 *
 * // O aplicar a nivel de gateway con UseFilters y UsePipes
 * @UsePipes(new WsValidationPipe())
 * @WebSocketGateway({ namespace: '/videollamadas' })
 * export class VideoLlamadaGateway { ... }
 */
@Injectable()
export class WsValidationPipe implements PipeTransform {
    /**
     * @param whitelist - Si true, elimina propiedades no definidas en el DTO
     * @param forbidNonWhitelisted - Si true, lanza error si hay propiedades extra
     * @param transform - Si true, transforma el objeto plano a instancia de clase
     */
    constructor(
        private readonly options: {
            whitelist?: boolean;
            forbidNonWhitelisted?: boolean;
            transform?: boolean;
        } = {
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        },
    ) {}

    /**
     * Detecta si el valor es un Socket de socket.io
     * Los sockets tienen propiedades características como 'nsp', 'client', 'handshake'
     */
    private isSocket(value: unknown): boolean {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        const obj = value as Record<string, unknown>;
        return (
            'nsp' in obj && 'client' in obj && 'handshake' in obj && 'id' in obj
        );
    }

    async transform(
        value: unknown,
        metadata: ArgumentMetadata,
    ): Promise<unknown> {
        // Ignorar objetos Socket - no deben ser validados
        if (this.isSocket(value)) {
            return value;
        }

        const { metatype } = metadata;

        // Si no hay metatype o es un tipo primitivo, no validar
        if (!metatype || this.isPrimitive(metatype)) {
            return value;
        }

        // Transformar el objeto plano a instancia de clase
        const object = plainToInstance(metatype, value, {
            enableImplicitConversion: true,
        });

        // Validar el objeto
        const errors = await validate(object, {
            whitelist: this.options.whitelist,
            forbidNonWhitelisted: this.options.forbidNonWhitelisted,
        });

        if (errors.length > 0) {
            const formattedErrors = this.formatErrors(errors);
            throw new WsException({
                status: 'error',
                code: 'VALIDATION_ERROR',
                message: 'Error de validación en mensaje WebSocket',
                errors: formattedErrors,
            });
        }

        // Retornar el objeto transformado si transform está habilitado
        return this.options.transform ? object : value;
    }

    /**
     * Verifica si el metatype es un tipo primitivo
     */
    private isPrimitive(
        metatype: new (...args: unknown[]) => unknown,
    ): boolean {
        const types: (new (...args: unknown[]) => unknown)[] = [
            String,
            Boolean,
            Number,
            Array,
            Object,
        ];
        return types.includes(metatype);
    }

    /**
     * Formatea los errores de validación de class-validator
     * a un formato más amigable para el cliente
     */
    private formatErrors(
        errors: ValidationError[],
    ): Array<{ field: string; constraints: string[] }> {
        return errors.map((error) => ({
            field: error.property,
            constraints: error.constraints
                ? Object.values(error.constraints)
                : [],
        }));
    }
}

/**
 * Versión del pipe que lanza BadRequestException en lugar de WsException
 * Útil si el gateway también maneja endpoints HTTP híbridos
 */
@Injectable()
export class WsValidationPipeHttp implements PipeTransform {
    async transform(
        value: unknown,
        metadata: ArgumentMetadata,
    ): Promise<unknown> {
        const { metatype } = metadata;

        if (!metatype || this.isPrimitive(metatype)) {
            return value;
        }

        const object = plainToInstance(metatype, value, {
            enableImplicitConversion: true,
        });

        const errors = await validate(object, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });

        if (errors.length > 0) {
            const messages = errors.map((error) => ({
                field: error.property,
                constraints: error.constraints
                    ? Object.values(error.constraints)
                    : [],
            }));

            throw new BadRequestException({
                message: 'Validation failed',
                errors: messages,
            });
        }

        return object;
    }

    private isPrimitive(
        metatype: new (...args: unknown[]) => unknown,
    ): boolean {
        const types: (new (...args: unknown[]) => unknown)[] = [
            String,
            Boolean,
            Number,
            Array,
            Object,
        ];
        return types.includes(metatype);
    }
}
