import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnfermedadesController } from './enfermedades.controller';
import { EnfermedadesService } from './enfermedades.service';
import { EnfermedadesEntity } from './enfermedades.entity';

/**
 * Módulo de Enfermedades
 * Gestiona el catálogo de enfermedades médicas del sistema
 *
 * Funcionalidades:
 * - CRUD de enfermedades (solo administradores)
 * - Consulta de catálogo (todos los usuarios autenticados)
 * - Integración con el módulo de paciente-enfermedad
 */
@Module({
    imports: [TypeOrmModule.forFeature([EnfermedadesEntity])],
    controllers: [EnfermedadesController],
    providers: [EnfermedadesService],
    exports: [EnfermedadesService],
})
export class EnfermedadesModule {}
