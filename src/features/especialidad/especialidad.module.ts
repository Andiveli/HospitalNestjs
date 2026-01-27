import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecialidadEntity } from './especialidad.entity';
import { MedicoEspecialidadEntity } from './medico-especialidad.entity';
import { EspecialidadController } from './especialidad.controller';
import { EspecialidadService } from './especialidad.service';
import { EspecialidadRepository } from './repositories/especialidad.repository';

/**
 * Módulo para gestión de especialidades médicas
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            EspecialidadEntity,
            MedicoEspecialidadEntity,
        ]),
    ],
    controllers: [EspecialidadController],
    providers: [EspecialidadService, EspecialidadRepository],
    exports: [
        EspecialidadService,
        EspecialidadRepository,
        TypeOrmModule.forFeature([
            EspecialidadEntity,
            MedicoEspecialidadEntity,
        ]),
    ],
})
export class EspecialidadModule {}
