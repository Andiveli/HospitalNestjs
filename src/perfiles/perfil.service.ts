import { Injectable } from '@nestjs/common';
import { CreateMedicoResponseDto } from 'src/medicos/dto/medico-response.dto';
import { MedicosService } from 'src/medicos/medicos.service';
import { PerfilPaciente } from 'src/pacientes/dto/perfil.dto';
import { PacientesService } from 'src/pacientes/pacientes.service';

export interface AdminProfile {
    rol: string;
    permisos: string;
    panel: string;
}

export interface PerfilResponse {
    userId: number;
    email: string;
    roles: string[];
    perfiles: Record<
        string,
        PerfilPaciente | CreateMedicoResponseDto | AdminProfile
    >;
}

export abstract class PerfilStrategy {
    abstract obtenerPerfil(
        userId: number,
    ): Promise<PerfilPaciente | CreateMedicoResponseDto | AdminProfile | null>;
}

@Injectable()
export class PacientePerfilStrategy extends PerfilStrategy {
    constructor(private pacientesService: PacientesService) {
        super();
    }

    async obtenerPerfil(userId: number): Promise<PerfilPaciente | null> {
        return await this.pacientesService.getInfo(userId);
    }
}

@Injectable()
export class MedicoPerfilStrategy extends PerfilStrategy {
    constructor(private medicoService: MedicosService) {
        super();
    }
    async obtenerPerfil(
        userId: number,
    ): Promise<CreateMedicoResponseDto | null> {
        return await this.medicoService.myInfo(userId);
    }
}

@Injectable()
export class AdminPerfilStrategy extends PerfilStrategy {
    obtenerPerfil(_userId: number): Promise<AdminProfile> {
        return Promise.resolve({
            rol: 'Administrador',
            permisos: 'acceso_total',
            panel: 'admin',
        });
    }
}
