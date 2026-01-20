import { Module } from '@nestjs/common';
import { PacientesModule } from 'src/pacientes/pacientes.module';
import { PerfilContext } from './perfil.context';
import { MedicosModule } from 'src/medicos/medicos.module';
import {
    PacientePerfilStrategy,
    MedicoPerfilStrategy,
    AdminPerfilStrategy,
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
