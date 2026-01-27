import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from 'src/common/common.module';
import { EstiloVidaEntity } from '../estilo-vida/estilo-vida.entity';
import { PaisEntity } from '../paises/paises.entity';
import { PeopleEntity } from '../people/people.entity';
import { GrupoSanguineoEntity } from '../sangre/sangre.entity';
import { PacientesController } from './pacientes.controller';
import { PacientesEntity } from './pacientes.entity';
import { PacientesService } from './pacientes.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PacientesEntity,
            PeopleEntity,
            PaisEntity,
            EstiloVidaEntity,
            GrupoSanguineoEntity,
        ]),
        CommonModule,
    ],
    controllers: [PacientesController],
    providers: [PacientesService],
    exports: [TypeOrmModule, PacientesService],
})
export class PacientesModule {}
