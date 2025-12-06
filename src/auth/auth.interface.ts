export interface AuthInterface {
    cedula: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    email: string;
    passwordHash: string;
    verificado?: boolean;
    token?: string;
    tokenExpiracion?: Date;
    generoId?: number | null;
    estadoId?: number | null;
}
