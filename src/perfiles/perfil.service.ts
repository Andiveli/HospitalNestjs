import { PacientesService } from 'src/pacientes/pacientes.service';

export interface PerfilResponse {
    userId: number;
    email: string;
    roles: string[];
    perfiles: {
        paciente?: any;
        medico?: any;
        admin?: any;
    };
}

export abstract class PerfilStrategy {
    abstract obtenerPerfil(userId: number): Promise<any>;
}

export class PacientePerfilStrategy extends PerfilStrategy {
    constructor(private pacientesService: PacientesService) {
        super();
    }

    async obtenerPerfil(userId: number): Promise<any> {
        try {
            return await this.pacientesService.getInfo(userId);
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

export class MedicoPerfilStrategy extends PerfilStrategy {
    obtenerPerfil(_userId: number): Promise<any> {
        //Logica del medico
        return Promise.resolve(null);
    }
}

export class AdminPerfilStrategy extends PerfilStrategy {
    obtenerPerfil(_userId: number): Promise<any> {
        return Promise.resolve({
            rol: 'Administrador',
            permisos: 'acceso_total',
            panel: 'admin',
        });
    }
}
