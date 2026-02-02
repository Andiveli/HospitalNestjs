import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO con información del médico en el registro de atención
 */
export class MedicoRegistroInfoDto {
    @ApiProperty({
        description: 'ID del médico',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Pérez',
    })
    nombreCompleto!: string;

    @ApiPropertyOptional({
        description: 'Especialidad del médico',
        example: 'Medicina General',
    })
    especialidad?: string;
}

/**
 * DTO con información del paciente en el registro de atención
 */
export class PacienteRegistroInfoDto {
    @ApiProperty({
        description: 'ID del paciente',
        example: 10,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre completo del paciente',
        example: 'María García',
    })
    nombreCompleto!: string;
}

/**
 * DTO con información de la historia clínica
 */
export class HistoriaClinicaInfoDto {
    @ApiProperty({
        description: 'ID de la historia clínica (paciente_id)',
        example: 10,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha de apertura de la historia',
        example: '2024-01-15T10:30:00.000Z',
    })
    fechaHoraApertura!: string;
}

/**
 * DTO con información de medicamentos recetados
 */
export class MedicamentoRegistroInfoDto {
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
 * DTO con información de la receta médica creada
 */
export class RecetaRegistroInfoDto {
    @ApiProperty({
        description: 'ID de la receta (registro_atencion_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación de la receta',
        example: '2024-01-20T14:30:00.000Z',
    })
    fechaHoraCreacion!: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la receta',
        example: 'Tomar los medicamentos después de las comidas',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Medicamentos recetados',
        type: [MedicamentoRegistroInfoDto],
    })
    medicamentos!: MedicamentoRegistroInfoDto[];
}

/**
 * DTO de respuesta al crear un registro de atención
 */
export class RegistroAtencionCreadoResponseDto {
    @ApiProperty({
        description: 'ID del registro de atención (cita_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Diagnóstico médico',
        example: 'Gripe viral con fiebre moderada',
    })
    diagnostico!: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la atención',
        example: 'Paciente refiere dolor de cabeza persistente',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Fecha y hora de creación',
        example: '2024-01-20T14:30:00.000Z',
    })
    fechaHoraCreacion!: string;

    @ApiProperty({
        description: 'Información del médico',
        type: MedicoRegistroInfoDto,
    })
    medico!: MedicoRegistroInfoDto;

    @ApiProperty({
        description: 'Información del paciente',
        type: PacienteRegistroInfoDto,
    })
    paciente!: PacienteRegistroInfoDto;

    @ApiProperty({
        description: 'Información de la historia clínica',
        type: HistoriaClinicaInfoDto,
    })
    historiaClinica!: HistoriaClinicaInfoDto;

    @ApiPropertyOptional({
        description: 'Información de la receta médica (si se creó)',
        type: RecetaRegistroInfoDto,
    })
    receta?: RecetaRegistroInfoDto;
}

/**
 * DTO para la respuesta API del endpoint de creación
 */
export class CrearRegistroAtencionApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Registro de atención creado exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos del registro de atención creado',
        type: RegistroAtencionCreadoResponseDto,
    })
    data!: RegistroAtencionCreadoResponseDto;
}
