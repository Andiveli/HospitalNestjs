import { Module } from '@nestjs/common';
import { MedicosController } from './medicos.controller';
import { MedicosService } from './medicos.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoEntity } from './medicos.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { EspecialidadModule } from 'src/especialidad/especialidad.module';
import { HorarioModule } from 'src/horario/horario.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([MedicoEntity, PeopleEntity]),
        EspecialidadModule,
        HorarioModule,
    ],
    controllers: [MedicosController],
    providers: [MedicosService],
    exports: [MedicosService],
})
export class MedicosModule {}
