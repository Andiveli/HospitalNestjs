import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriasClinicasController } from './historias-clinicas.controller';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';
import { CitaEntity } from '../citas/entities/cita.entity';
import { DocumentsEntity } from '../documents/documents.entity';
import { RecetasModule } from '../recetas/recetas.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PacientesEntity,
            HistoriaClinicaEntity,
            CitaEntity,
            DocumentsEntity,
        ]),
        RecetasModule,
    ],
    controllers: [HistoriasClinicasController],
    providers: [HistoriasClinicasService],
})
export class HistoriasClinicasModule {}
