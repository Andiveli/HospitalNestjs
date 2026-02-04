import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacienteEnfermedadController } from './paciente-enfermedad.controller';
import { PacienteEnfermedadService } from './paciente-enfermedad.service';
import { PacienteEnfermedadEntity } from './paciente-enfermedad.entity';

/**
 * Módulo de Paciente-Enfermedad
 * Gestiona la asociación entre pacientes y enfermedades del catálogo
 *
 * Funcionalidades:
 * - Asociar enfermedades a pacientes (con tipo y detalles)
 * - Consultar enfermedades de un paciente
 * - Consultar pacientes con una enfermedad específica
 * - Actualizar/eliminar relaciones
 *
 * Solo médicos pueden modificar estas relaciones
 */
@Module({
    imports: [TypeOrmModule.forFeature([PacienteEnfermedadEntity])],
    controllers: [PacienteEnfermedadController],
    providers: [PacienteEnfermedadService],
    exports: [PacienteEnfermedadService],
})
export class PacienteEnfermedadModule {}
