import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitaEntity } from '../citas/entities/cita.entity';
import { EstadoCitaEntity } from '../citas/entities/estado-cita.entity';
import { EspecialidadEntity } from '../especialidad/especialidad.entity';
import { MedicoEspecialidadEntity } from '../especialidad/medico-especialidad.entity';
import { DiaAtencionEntity } from '../horario/dia-atencion.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { PeopleEntity } from '../people/people.entity';
import { RolesEntity } from '../roles/roles.entity';
import { MedicosController } from './medicos.controller';
import { MedicoEntity } from './medicos.entity';
import { MedicosService } from './medicos.service';
import { MedicoRepository } from './repositories/medico.repository';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            MedicoEntity,
            PeopleEntity,
            RolesEntity,
            EspecialidadEntity,
            MedicoEspecialidadEntity,
            HorarioMedicoEntity,
            DiaAtencionEntity,
            CitaEntity,
            EstadoCitaEntity,
        ]),
    ],
    controllers: [MedicosController],
    providers: [MedicosService, MedicoRepository],
    exports: [MedicosService, MedicoRepository],
})
export class MedicosModule {}
