import { Module } from '@nestjs/common';
import { PacientesModule } from 'src/pacientes/pacientes.module';
import { PerfilContext } from './perfil.context';

@Module({
    imports: [PacientesModule],
    providers: [PerfilContext],
    exports: [PerfilContext],
})
export class PerfilesModule {}
