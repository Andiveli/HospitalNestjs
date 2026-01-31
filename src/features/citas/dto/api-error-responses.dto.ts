import { ApiProperty } from '@nestjs/swagger';

/**
 * Error response DTOs for Swagger documentation
 * These DTOs define the structure of error responses for all API endpoints
 */

/**
 * 400 Bad Request Error Response
 */
export class BadRequestErrorResponseDto {
    @ApiProperty({
        example: 400,
        description: 'HTTP status code',
    })
    statusCode!: 400;

    @ApiProperty({
        example: 'Bad Request',
        description: 'Error type',
    })
    error!: 'Bad Request';

    @ApiProperty({
        example: 'Datos inválidos o fecha en el pasado',
        description: 'Human-readable error message',
    })
    message!: string;
}

/**
 * 401 Unauthorized Error Response
 */
export class UnauthorizedErrorResponseDto {
    @ApiProperty({
        example: 401,
        description: 'HTTP status code',
    })
    statusCode!: 401;

    @ApiProperty({
        example: 'Unauthorized',
        description: 'Error type',
    })
    error!: 'Unauthorized';

    @ApiProperty({
        example: 'No autorizado - Token JWT inválido o ausente',
        description: 'Human-readable error message',
    })
    message!: string;
}

/**
 * 403 Forbidden Error Response
 */
export class ForbiddenErrorResponseDto {
    @ApiProperty({
        example: 403,
        description: 'HTTP status code',
    })
    statusCode!: 403;

    @ApiProperty({
        example: 'Forbidden',
        description: 'Error type',
    })
    error!: 'Forbidden';

    @ApiProperty({
        example: 'No tienes permiso para acceder a esta cita',
        description: 'Human-readable error message',
    })
    message!: string;
}

/**
 * 404 Not Found Error Response
 */
export class NotFoundErrorResponseDto {
    @ApiProperty({
        example: 404,
        description: 'HTTP status code',
    })
    statusCode!: 404;

    @ApiProperty({
        example: 'Not Found',
        description: 'Error type',
    })
    error!: 'Not Found';

    @ApiProperty({
        example: 'Cita con ID 999 no encontrada',
        description: 'Human-readable error message',
    })
    message!: string;
}

/**
 * 409 Conflict Error Response
 */
export class ConflictErrorResponseDto {
    @ApiProperty({
        example: 409,
        description: 'HTTP status code',
    })
    statusCode!: 409;

    @ApiProperty({
        example: 'Conflict',
        description: 'Error type',
    })
    error!: 'Conflict';

    @ApiProperty({
        example:
            'El médico ya tiene una cita agendada en ese horario. Por favor selecciona otro horario disponible.',
        description: 'Human-readable error message',
    })
    message!: string;
}

/**
 * 500 Internal Server Error Response
 */
export class InternalServerErrorResponseDto {
    @ApiProperty({
        example: 500,
        description: 'HTTP status code',
    })
    statusCode!: 500;

    @ApiProperty({
        example: 'Internal Server Error',
        description: 'Error type',
    })
    error!: 'Internal Server Error';

    @ApiProperty({
        example: 'Error interno del servidor',
        description: 'Human-readable error message',
    })
    message!: string;
}
