import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { CitaEntity } from './entities/cita.entity';
import { EstadoCitaEntity } from './entities/estado-cita.entity';
import { RegistroAtencionEntity } from './entities/registro-atencion.entity';
import { HistoriaClinicaEntity } from './entities/historia-clinica.entity';
import { CitaRepository } from './repositories/cita.repository';
import { CitaActualizacionService } from './services/cita-actualizacion.service';
import { CitaActualizacionJob } from './jobs/cita-actualizacion.job';
import { MedicoEntity } from '../medicos/medicos.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { DiaAtencionEntity } from '../horario/dia-atencion.entity';
import { ExcepcionHorarioEntity } from '../horario/excepcion-horario.entity';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([
            CitaEntity,
            EstadoCitaEntity,
            RegistroAtencionEntity,
            HistoriaClinicaEntity,
            MedicoEntity,
            PacientesEntity,
            HorarioMedicoEntity,
            DiaAtencionEntity,
            ExcepcionHorarioEntity,
        ]),
    ],
    controllers: [CitasController],
    providers: [
        CitasService,
        CitaRepository,
        CitaActualizacionService,
        CitaActualizacionJob,
    ],
    exports: [CitasService, CitaRepository],
})
export class CitasModule {}
