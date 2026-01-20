import { Module } from '@nestjs/common';
import { MedicosController } from './medicos.controller';
import { MedicosService } from './medicos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoEntity } from './medicos.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { RolesEntity } from 'src/roles/roles.entity';
import { EspecialidadEntity } from 'src/especialidad/especialidad.entity';
import { MedicoEspecialidadEntity } from 'src/especialidad/medico-especialidad.entity';
import { HorarioMedicoEntity } from 'src/horario/horario-medico.entity';
import { DiaAtencionEntity } from 'src/horario/dia-atencion.entity';
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
