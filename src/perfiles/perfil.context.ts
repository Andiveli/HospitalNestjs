import { Injectable, Logger } from '@nestjs/common';
import { PeopleEntity } from 'src/people/people.entity';
import { Rol } from 'src/roles/roles.enum';
import {
    PerfilStrategy,
    PacientePerfilStrategy,
    MedicoPerfilStrategy,
    AdminPerfilStrategy,
    PerfilResponse,
} from './perfil.service';

@Injectable()
export class PerfilContext {
    private readonly logger = new Logger(PerfilContext.name);
    private strategies = new Map<string, PerfilStrategy>();

    constructor(
        private pacienteStrategy: PacientePerfilStrategy,
        private medicoStrategy: MedicoPerfilStrategy,
        private adminStrategy: AdminPerfilStrategy,
    ) {
        this.strategies.set(Rol.Paciente, this.pacienteStrategy);
        this.strategies.set(Rol.Medico, this.medicoStrategy);
        this.strategies.set(Rol.Admin, this.adminStrategy);
    }

    async obtenerPerfilesCompletos(
        usuario: PeopleEntity,
    ): Promise<PerfilResponse> {
        const roles = usuario.roles?.map((rol) => rol.nombre) || [];
        const perfiles: PerfilResponse['perfiles'] = {};

        for (const rol of roles) {
            const strategy = this.strategies.get(rol);
            if (strategy) {
                try {
                    const perfilData = await strategy.obtenerPerfil(usuario.id);
                    if (perfilData) {
                        perfiles[rol] = perfilData;
                    }
                } catch (error) {
                    this.logger.error(
                        `Error obteniendo perfil para rol ${rol}, userId ${usuario.id}`,
                        error,
                    );
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
