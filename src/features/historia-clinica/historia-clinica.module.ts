import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';
import { RegistroAtencionEntity } from '../citas/entities/registro-atencion.entity';
import { CitaEntity } from '../citas/entities/cita.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { PeopleEntity } from '../people/people.entity';
import { MedicoEntity } from '../medicos/medicos.entity';
import { DocumentsEntity } from '../documents/documents.entity';
import { TipoDocumentoEntity } from '../documents/tipo-documento.entity';
import { PacienteEnfermedadEntity } from '../paciente-enfermedad/paciente-enfermedad.entity';
import { EnfermedadesEntity } from '../enfermedades/enfermedades.entity';
import { TiposEnfermedadEntity } from '../tipo-enfermedad/tipo-enfermedad.entity';
import { RecetaMedicaEntity } from '../recetas/entities/receta-medica.entity';
import { RecetaMedicamentoEntity } from '../recetas/entities/receta-medicamento.entity';
import { MedicamentoEntity } from '../recetas/entities/medicamento.entity';
import { EspecialidadEntity } from '../especialidad/especialidad.entity';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaRepository } from './repositories/historia-clinica.repository';

/**
 * Módulo de Historia Clínica
 * Gestiona el acceso a la información médica completa del paciente
 *
 * Este módulo es independiente del módulo de Citas para evitar
 * dependencias circulares. Solo importa las entidades necesarias
 * directamente a través de TypeORM.
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Entidades principales de historia clínica
            HistoriaClinicaEntity,
            RegistroAtencionEntity,
            CitaEntity,
            // Paciente y datos relacionados
            PacientesEntity,
            PeopleEntity,
            // Médico
            MedicoEntity,
            EspecialidadEntity,
            // Documentos
            DocumentsEntity,
            TipoDocumentoEntity,
            // Enfermedades
            PacienteEnfermedadEntity,
            EnfermedadesEntity,
            TiposEnfermedadEntity,
            // Recetas y medicamentos
            RecetaMedicaEntity,
            RecetaMedicamentoEntity,
            MedicamentoEntity,
        ]),
    ],
    controllers: [HistoriaClinicaController],
    providers: [HistoriaClinicaService, HistoriaClinicaRepository],
    exports: [HistoriaClinicaService, HistoriaClinicaRepository],
})
export class HistoriaClinicaModule {}
