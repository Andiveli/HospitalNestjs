import { Module } from '@nestjs/common';
import { MedicosModule } from '../medicos/medicos.module';
import { PacientesModule } from '../pacientes/pacientes.module';
import { PerfilContext } from './perfil.context';
import {
    AdminPerfilStrategy,
    MedicoPerfilStrategy,
    PacientePerfilStrategy,
} from './perfil.service';

@Module({
    imports: [PacientesModule, MedicosModule],
    providers: [
        PerfilContext,
        PacientePerfilStrategy,
        MedicoPerfilStrategy,
        AdminPerfilStrategy,
    ],
    exports: [PerfilContext],
})
export class PerfilesModule {}
