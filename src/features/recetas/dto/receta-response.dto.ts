import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Información del médico en la receta
 */
export class MedicoRecetaInfoDto {
    @ApiProperty({
        description: 'ID del médico',
        example: 11,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del médico',
        example: 'Juan',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Apellido del médico',
        example: 'Pérez',
    })
    apellido!: string;
}

/**
 * Información del medicamento recetado
 */
export class MedicamentoInfoDto {
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
 * DTO para la respuesta de una receta médica
 */
export class RecetaResponseDto {
    @ApiProperty({
        description: 'ID del registro de atención asociado',
        example: 1,
    })
    registroAtencionId!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación de la receta',
        example: '2026-01-27T14:30:00.000Z',
    })
    fechaHoraCreacion!: Date;

    @ApiProperty({
        description: 'Información del médico que emitió la receta',
        type: MedicoRecetaInfoDto,
    })
    medico!: MedicoRecetaInfoDto;

    @ApiPropertyOptional({
        description: 'Observaciones generales de la receta',
        example: 'Paciente con alergia a la penicilina',
        required: false,
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Lista de medicamentos recetados',
        type: [MedicamentoInfoDto],
    })
    medicamentos!: MedicamentoInfoDto[];
}

/**
 * DTO para la respuesta de recetas de una cita
 */
export class RecetasCitaResponseDto {
    @ApiProperty({
        description: 'ID de la cita',
        example: 1,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Indica si la cita tiene receta médica',
        example: true,
    })
    tieneReceta!: boolean;

    @ApiProperty({
        description: 'Receta médica asociada',
        type: RecetaResponseDto,
        required: false,
    })
    receta?: RecetaResponseDto;
}
