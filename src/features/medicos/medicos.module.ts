import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
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
        ]),
    ],
    controllers: [MedicosController],
    providers: [MedicosService, MedicoRepository],
    exports: [MedicosService, MedicoRepository],
})
export class MedicosModule {}
