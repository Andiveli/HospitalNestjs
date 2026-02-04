import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaAtencionEntity } from './dia-atencion.entity';
import { ExcepcionHorarioEntity } from './excepcion-horario.entity';
import { HorarioMedicoEntity } from './horario-medico.entity';
import { MedicoEntity } from '../medicos/medicos.entity';
import { ExcepcionesHorarioController } from './controllers/excepciones-horario.controller';
import { ExcepcionesHorarioService } from './services/excepciones-horario.service';
import { ExcepcionesHorarioRepository } from './repositories/excepciones-horario.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            DiaAtencionEntity,
            HorarioMedicoEntity,
            ExcepcionHorarioEntity,
            MedicoEntity,
        ]),
    ],
    controllers: [ExcepcionesHorarioController],
    providers: [ExcepcionesHorarioService, ExcepcionesHorarioRepository],
    exports: [
        TypeOrmModule.forFeature([
            DiaAtencionEntity,
            HorarioMedicoEntity,
            ExcepcionHorarioEntity,
        ]),
    ],
})
export class HorarioModule {}
