import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

/**
 * Estructura del error WebSocket
 */
interface WsErrorResponse {
    status: 'error';
    code: string;
    message: string;
    errors?: unknown;
    timestamp: string;
}

/**
 * Filtro de excepciones para WebSocket Gateway
 *
 * Captura todas las excepciones en handlers WebSocket y las formatea
 * de manera consistente antes de enviarlas al cliente.
 *
 * NOTA: No extendemos BaseWsExceptionFilter porque este intenta acceder
 * a this.server que no está disponible cuando se instancia el filtro
 * directamente con `new WsExceptionFilter()`.
 *
 * @example
 * // Aplicar a nivel de gateway
 * @UseFilters(new WsExceptionFilter())
 * @WebSocketGateway({ namespace: '/videollamadas' })
 * export class VideoLlamadaGateway { ... }
 *
 * // O aplicar a nivel de handler específico
 * @UseFilters(new WsExceptionFilter())
 * @SubscribeMessage('room:join')
 * async handleJoinRoom(...) { ... }
 */
@Catch()
export class WsExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(WsExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient<Socket>();
        const data: unknown = host.switchToWs().getData();

        const errorResponse = this.formatError(exception);

        this.logger.error(
            `WebSocket Error: ${errorResponse.message}`,
            JSON.stringify({
                socketId: client.id,
                data,
                error: errorResponse,
            }),
        );

        // Emitir error al cliente en un evento genérico 'exception'
        client.emit('exception', errorResponse);
    }

    /**
     * Formatea diferentes tipos de excepciones a una estructura consistente
     */
    private formatError(exception: unknown): WsErrorResponse {
        const timestamp = new Date().toISOString();

        // WsException con payload estructurado
        if (exception instanceof WsException) {
            const error = exception.getError();

            if (typeof error === 'object' && error !== null) {
                const errorObj = error as Record<string, unknown>;
                return {
                    status: 'error',
                    code: (errorObj.code as string) || 'WS_EXCEPTION',
                    message:
                        (errorObj.message as string) || 'Error en WebSocket',
                    errors: errorObj.errors,
                    timestamp,
                };
            }

            return {
                status: 'error',
                code: 'WS_EXCEPTION',
                message: String(error),
                timestamp,
            };
        }

        // Error estándar de JavaScript
        if (exception instanceof Error) {
            return {
                status: 'error',
                code: 'INTERNAL_ERROR',
                message: exception.message,
                timestamp,
            };
        }

        // Error desconocido
        return {
            status: 'error',
            code: 'UNKNOWN_ERROR',
            message: 'Error desconocido en WebSocket',
            timestamp,
        };
    }
}

/**
 * Filtro de excepciones que solo captura WsException
 * Útil cuando quieres manejar otros tipos de errores de forma diferente
 */
@Catch(WsException)
export class WsOnlyExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(WsOnlyExceptionFilter.name);

    catch(exception: WsException, host: ArgumentsHost): void {
        const client = host.switchToWs().getClient<Socket>();
        const error = exception.getError();

        const errorResponse: WsErrorResponse = {
            status: 'error',
            code: 'WS_EXCEPTION',
            message: typeof error === 'string' ? error : 'Error en WebSocket',
            timestamp: new Date().toISOString(),
        };

        if (typeof error === 'object' && error !== null) {
            const errorObj = error as Record<string, unknown>;
            errorResponse.code = (errorObj.code as string) || 'WS_EXCEPTION';
            errorResponse.message =
                (errorObj.message as string) || 'Error en WebSocket';
            errorResponse.errors = errorObj.errors;
        }

        this.logger.warn(`WebSocket Exception: ${errorResponse.message}`);
        client.emit('exception', errorResponse);
    }
}
