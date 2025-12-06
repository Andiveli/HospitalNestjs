import { Module } from '@nestjs/common';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesEntity } from './pacientes.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { PaisEntity } from 'src/paises/paises.entity';
import { EstiloVidaEntity } from 'src/estilo-vida/estilo-vida.entity';
import { GrupoSanguineoEntity } from 'src/sangre/sangre.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PacientesEntity,
            PeopleEntity,
            PaisEntity,
            EstiloVidaEntity,
            GrupoSanguineoEntity,
        ]),
    ],
    controllers: [PacientesController],
    providers: [PacientesService],
    exports: [TypeOrmModule, PacientesService],
})
export class PacientesModule {}
