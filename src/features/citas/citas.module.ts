import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaAtencionEntity } from '../horario/dia-atencion.entity';
import { ExcepcionHorarioEntity } from '../horario/excepcion-horario.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { MedicoEntity } from '../medicos/medicos.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { RecetasModule } from '../recetas/recetas.module';
import { RecetaMedicaEntity } from '../recetas/entities/receta-medica.entity';
import { RecetaMedicamentoEntity } from '../recetas/entities/receta-medicamento.entity';
import { CitasService } from './citas.service';
import {
    CitasController,
    CitasMedicoController,
    CitasPacienteController,
    RegistroAtencionController,
} from './controllers';
import { CitaEntity } from './entities/cita.entity';
import { EstadoCitaEntity } from './entities/estado-cita.entity';
import { HistoriaClinicaEntity } from './entities/historia-clinica.entity';
import { RegistroAtencionEntity } from './entities/registro-atencion.entity';
import { CitaActualizacionJob } from './jobs/cita-actualizacion.job';
import { CitaRepository } from './repositories/cita.repository';
import { CitaActualizacionService } from './services/cita-actualizacion.service';
import { CitasCacheService } from './services/citas-cache.service';
import { RegistroAtencionService } from './services/registro-atencion.service';

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
            RecetaMedicaEntity,
            RecetaMedicamentoEntity,
        ]),
        RecetasModule,
    ],
    controllers: [
        CitasController,
        CitasPacienteController,
        CitasMedicoController,
        RegistroAtencionController,
    ],
    providers: [
        CitasService,
        CitaRepository,
        CitaActualizacionService,
        CitaActualizacionJob,
        CitasCacheService,
        RegistroAtencionService,
    ],
    exports: [CitasService, CitaRepository],
})
export class CitasModule {}
