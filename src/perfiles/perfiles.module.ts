import { Module } from '@nestjs/common';
import { PacientesModule } from 'src/pacientes/pacientes.module';
import { PerfilContext } from './perfil.context';
import { MedicosModule } from 'src/medicos/medicos.module';

@Module({
    imports: [PacientesModule, MedicosModule],
    providers: [PerfilContext],
    exports: [PerfilContext],
})
export class PerfilesModule {}
