import { Injectable } from '@nestjs/common';
import { PacientesService } from 'src/pacientes/pacientes.service';
import { PeopleEntity } from 'src/people/people.entity';
import { Rol } from 'src/roles/roles.enum';
import {
    PerfilStrategy,
    PacientePerfilStrategy,
    MedicoPerfilStrategy,
    AdminPerfilStrategy,
    PerfilResponse,
} from './perfil.service';
import { MedicosService } from 'src/medicos/medicos.service';

@Injectable()
export class PerfilContext {
    private strategies = new Map<string, PerfilStrategy>();

    constructor(
        private pacientesService: PacientesService,
        private medicoServices: MedicosService,
    ) {
        this.strategies.set(
            Rol.Paciente,
            new PacientePerfilStrategy(this.pacientesService),
        );
        this.strategies.set(
            Rol.Medico,
            new MedicoPerfilStrategy(this.medicoServices),
        );
        this.strategies.set(Rol.Admin, new AdminPerfilStrategy());
    }

    async obtenerPerfilesCompletos(
        usuario: PeopleEntity,
    ): Promise<PerfilResponse> {
        const roles = usuario.roles?.map((rol) => rol.nombre) || [];
        const perfiles: PerfilResponse['perfiles'] = {};

        for (const rol of roles) {
            const strategy = this.strategies.get(rol);
            if (strategy) {
                const perfilData = await strategy.obtenerPerfil(usuario.id);
                if (perfilData) {
                    perfiles[rol] = perfilData;
                }
            }
        }

        return {
            userId: usuario.id,
            email: usuario.email,
            roles: roles,
            perfiles,
        };
    }
}
