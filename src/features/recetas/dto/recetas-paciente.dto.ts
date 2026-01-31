import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Información del médico en la receta del paciente
 */
export class MedicoRecetaPacienteDto {
    @ApiProperty({
        description: 'ID del médico',
        example: 11,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Pérez',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Cardiología',
    })
    especialidad!: string;
}

/**
 * Información del medicamento en la receta del paciente
 */
export class MedicamentoRecetaPacienteDto {
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

    @ApiProperty({
        description: 'Concentración',
        example: '500mg',
        required: false,
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
        description: 'Cantidad a administrar',
        example: 1,
    })
    cantidad!: number;

    @ApiProperty({
        description: 'Vía de administración',
        example: 'Oral',
    })
    viaAdministracion!: string;

    @ApiProperty({
        description: 'Unidad de medida',
        example: 'Tableta',
    })
    unidadMedida!: string;

    @ApiProperty({
        description: 'Indicaciones adicionales',
        example: 'Tomar después de las comidas',
        required: false,
    })
    indicaciones?: string;
}

/**
 * Receta médica completa para el paciente
 */
export class RecetaPacienteDto {
    @ApiProperty({
        description: 'ID de la receta (mismo que registro_atencion_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación de la receta',
        example: '2026-01-27T14:30:00.000Z',
    })
    fechaHoraCreacion!: Date;

    @ApiProperty({
        description: 'Información del médico que emitió la receta',
        type: MedicoRecetaPacienteDto,
    })
    medico!: MedicoRecetaPacienteDto;

    @ApiProperty({
        description: 'Diagnóstico de la atención médica',
        example: 'Hipertensión arterial esencial',
    })
    diagnostico!: string;

    @ApiPropertyOptional({
        description: 'Observaciones del médico sobre la atención',
        example:
            'Paciente con antecedentes familiares de enfermedad cardiovascular',
        required: false,
    })
    observacionesAtencion?: string;

    @ApiPropertyOptional({
        description: 'Observaciones específicas de la receta',
        example: 'Evitar consumo de alcohol durante el tratamiento',
        required: false,
    })
    observacionesReceta?: string;

    @ApiProperty({
        description: 'Lista de medicamentos recetados',
        type: [MedicamentoRecetaPacienteDto],
    })
    medicamentos!: MedicamentoRecetaPacienteDto[];
}

/**
 * DTO para la respuesta de listado de recetas del paciente
 */
export class RecetasPacienteResponseDto {
    @ApiProperty({
        description: 'ID del paciente',
        example: 5,
    })
    pacienteId!: number;

    @ApiProperty({
        description: 'Cantidad total de recetas',
        example: 3,
    })
    totalRecetas!: number;

    @ApiProperty({
        description:
            'Lista de recetas médicas ordenadas por fecha (más recientes primero)',
        type: [RecetaPacienteDto],
    })
    recetas!: RecetaPacienteDto[];
}
