import { GeneroEntity } from 'src/generos/generos.entity';
import { RolesEntity } from 'src/roles/roles.entity';

/**
 * Interfaz que define la estructura de datos para autenticación de usuarios
 * Contiene toda la información necesaria para crear y gestionar usuarios en el sistema
 */
export interface AuthInterface {
    /** Cédula de identidad del usuario */
    cedula: string;
    /** Primer nombre del usuario (requerido) */
    primerNombre: string;
    /** Segundo nombre del usuario (opcional) */
    segundoNombre?: string;
    /** Primer apellido del usuario (requerido) */
    primerApellido: string;
    /** Segundo apellido del usuario (opcional) */
    segundoApellido?: string;
    /** Email único del usuario */
    email: string;
    /** Contraseña hasheada del usuario */
    passwordHash: string;
    /** Indica si el usuario ha verificado su email */
    verificado?: boolean;
    /** Token de verificación/recuperación de contraseña */
    token?: string | null;
    /** Fecha de expiración del token */
    tokenExpiracion?: Date | null;
    /** Género asociado al usuario */
    genero: GeneroEntity;
    /** Roles asignados al usuario (permisos) */
    roles?: RolesEntity[];
    /** ID del estado del usuario (activo/inactivo) */
    estadoId?: number | null;
}
