export interface AuthInterface {
    nombre: string;
    apellido: string;
    email: string;
    password: string;
    confirmado?: boolean;
    rol?: string;
    token?: string | null;
}
