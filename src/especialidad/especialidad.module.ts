import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadEntity } from './especialidad.entity';
import { MedicoEspecialidadEntity } from './medico-especialidad.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EspecialidadEntity,
            MedicoEspecialidadEntity,
        ]),
    ],
    controllers: [],
    providers: [],
    exports: [
        TypeOrmModule.forFeature([
            EspecialidadEntity,
            MedicoEspecialidadEntity,
        ]),
    ],
})
export class EspecialidadModule {}
