import { PerfilMedico } from 'src/medicos/dto/addmedico.dto';
import { MedicosService } from 'src/medicos/medicos.service';
import { PerfilPaciente } from 'src/pacientes/dto/perfil.dto';
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

    async obtenerPerfil(userId: number): Promise<PerfilPaciente | null> {
        try {
            return await this.pacientesService.getInfo(userId);
        } catch (error) {
            console.log(error);
            return null;
        }
    }
}

export class MedicoPerfilStrategy extends PerfilStrategy {
    constructor(private medicoService: MedicosService) {
        super();
    }
    async obtenerPerfil(userId: number): Promise<PerfilMedico | null> {
        try {
            return await this.medicoService.myInfo(userId);
        } catch (error) {
            console.log(error);
            return null;
        }
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
