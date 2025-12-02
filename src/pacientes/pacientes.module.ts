import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesEntity } from './pacientes.entity';
import { PeopleEntity } from 'src/people/people.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PacientesEntity, PeopleEntity])],
    controllers: [PacientesController],
    providers: [PacientesService],
    exports: [TypeOrmModule],
})
export class PacientesModule {}
