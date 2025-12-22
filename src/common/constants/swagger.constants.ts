import { Type } from '@nestjs/common';

// Base response types dinámicos
interface BaseResponseType<T = any> {
    status: number;
    description: string;
    type?: Type<T> | [Type<T>];
}

export const SWAGGER_RESPONSES = {
    // Éxitos
    OK: <T = any>(type?: Type<T>): BaseResponseType<T> => ({
        status: 200,
        description: 'Operación exitosa',
        ...(type && { type }),
    }),

    CREATED: <T = any>(type?: Type<T>): BaseResponseType<T> => ({
        status: 201,
        description: 'Recurso creado exitosamente',
        ...(type && { type }),
    }),

    ACCEPTED: {
        status: 202,
        description: 'Solicitud aceptada para procesamiento',
    },
    NO_CONTENT: { status: 204, description: 'Recurso eliminado exitosamente' },

    // Errores de cliente
    BAD_REQUEST: {
        status: 400,
        description: 'Solicitud inválida - Datos incorrectos',
    },
    UNAUTHORIZED: {
        status: 401,
        description: 'No autorizado - Token inválido o ausente',
    },
    FORBIDDEN: {
        status: 403,
        description: 'Acceso prohibido - Permisos insuficientes',
    },
    NOT_FOUND: { status: 404, description: 'Recurso no encontrado' },
    CONFLICT: {
        status: 409,
        description: 'Conflicto de datos - Recurso ya existe',
    },
    UNPROCESSABLE_ENTITY: {
        status: 422,
        description: 'Entidad no procesable - Validación de negocio',
    },

    // Errores de servidor
    INTERNAL_SERVER_ERROR: {
        status: 500,
        description: 'Error interno del servidor',
    },
    SERVICE_UNAVAILABLE: {
        status: 503,
        description: 'Servicio no disponible temporalmente',
    },
} as const;
