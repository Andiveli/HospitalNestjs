import { GeneroEntity } from 'src/generos/generos.entity';
import { RolesEntity } from 'src/roles/roles.entity';

export interface AuthInterface {
    cedula: string;
    primerNombre: string;
    segundoNombre?: string;
    primerApellido: string;
    segundoApellido?: string;
    email: string;
    passwordHash: string;
    verificado?: boolean;
    token?: string | null;
    tokenExpiracion?: Date | null;
    genero: GeneroEntity;
    roles?: RolesEntity[];
    estadoId?: number | null;
}
