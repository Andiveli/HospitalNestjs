import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';
import { CitaEntity } from './entities/cita.entity';
import { EstadoCitaEntity } from './entities/estado-cita.entity';
import { RegistroAtencionEntity } from './entities/registro-atencion.entity';
import { HistoriaClinicaEntity } from './entities/historia-clinica.entity';
import { CitaRepository } from './repositories/cita.repository';
import { MedicoEntity } from '../medicos/medicos.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            CitaEntity,
            EstadoCitaEntity,
            RegistroAtencionEntity,
            HistoriaClinicaEntity,
            MedicoEntity,
            PacientesEntity,
        ]),
    ],
    controllers: [CitasController],
    providers: [CitasService, CitaRepository],
    exports: [CitasService, CitaRepository],
})
export class CitasModule {}
