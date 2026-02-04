import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicoInfoDto, PacienteInfoDto } from './cita-response.dto';

/**
 * DTO con información de un medicamento recetado
 */
export class MedicamentoRecetaDetalleDto {
    @ApiProperty({
        description: 'ID del medicamento',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del medicamento',
        example: 'Paracetamol',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Principio activo',
        example: 'Paracetamol',
    })
    principioActivo!: string;

    @ApiPropertyOptional({
        description: 'Concentración del medicamento',
        example: '500mg',
    })
    concentracion?: string;

    @ApiProperty({
        description: 'Presentación del medicamento',
        example: 'Tabletas',
    })
    presentacion!: string;

    @ApiProperty({
        description: 'Duración del tratamiento',
        example: '7 días',
    })
    duracion!: string;

    @ApiProperty({
        description: 'Frecuencia de administración',
        example: 'Cada 8 horas',
    })
    frecuencia!: string;

    @ApiProperty({
        description: 'Cantidad recetada',
        example: 21,
    })
    cantidad!: number;

    @ApiProperty({
        description: 'Vía de administración',
        example: 'Oral',
    })
    viaAdministracion!: string;

    @ApiProperty({
        description: 'Unidad de medida',
        example: 'Tabletas',
    })
    unidadMedida!: string;

    @ApiPropertyOptional({
        description: 'Indicaciones especiales',
        example: 'Tomar después de las comidas',
    })
    indicaciones?: string;
}

/**
 * DTO con información de la receta médica
 */
export class RecetaDetalleDto {
    @ApiProperty({
        description: 'ID de la receta (registro_atencion_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación de la receta',
        example: '2026-02-15T10:30:00.000Z',
    })
    fechaHoraCreacion!: Date;

    @ApiPropertyOptional({
        description: 'Observaciones de la receta',
        example: 'Tomar los medicamentos después de las comidas',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Medicamentos recetados',
        type: [MedicamentoRecetaDetalleDto],
    })
    medicamentos!: MedicamentoRecetaDetalleDto[];
}

export class CitaDetalladaResponseDto {
    @ApiProperty({
        description: 'ID único de la cita',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación de la cita',
        example: '2026-01-27T14:30:00.000Z',
    })
    fechaHoraCreacion!: Date;

    @ApiProperty({
        description: 'Fecha y hora de inicio de la cita',
        example: '2026-02-15T10:00:00.000Z',
    })
    fechaHoraInicio!: Date;

    @ApiProperty({
        description: 'Fecha y hora de fin de la cita',
        example: '2026-02-15T10:30:00.000Z',
    })
    fechaHoraFin!: Date;

    @ApiProperty({
        description: 'Indica si la cita es telefónica',
        example: false,
    })
    telefonica!: boolean;

    @ApiProperty({
        description: 'Estado actual de la cita',
        example: 'atendida',
    })
    estado!: string;

    @ApiProperty({
        description: 'Información del médico asignado',
        type: MedicoInfoDto,
        example: {
            id: 11,
            nombre: 'Juan',
            apellido: 'Pérez',
            especialidad: 'Cardiología',
        },
    })
    medico!: MedicoInfoDto;

    @ApiProperty({
        description: 'Información del paciente',
        type: PacienteInfoDto,
        example: {
            id: 5,
            nombre: 'María',
            apellido: 'González',
        },
    })
    paciente!: PacienteInfoDto;

    @ApiPropertyOptional({
        description: 'Motivo de la cita (solo disponible si fue atendida)',
        example: 'Dolor de pecho y fatiga',
    })
    motivoCita?: string;

    @ApiPropertyOptional({
        description:
            'Diagnóstico realizado por el médico (solo si fue atendida)',
        example: 'Hipertensión arterial leve',
    })
    diagnostico?: string;

    @ApiPropertyOptional({
        description: 'Observaciones del médico (solo si fue atendida)',
        example:
            'Paciente muestra signos de estrés. Recomendar cambios en estilo de vida.',
    })
    observaciones?: string;

    @ApiPropertyOptional({
        description: 'Indica si tiene receta médica',
        example: true,
    })
    tieneReceta?: boolean;

    @ApiPropertyOptional({
        description: 'Indica si tiene derivaciones',
        example: false,
    })
    tieneDerivaciones?: boolean;

    @ApiPropertyOptional({
        description: 'Receta médica completa (solo si existe)',
        type: RecetaDetalleDto,
    })
    receta?: RecetaDetalleDto;
}
