import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Información básica del paciente en la historia clínica
 */
export class PacienteHistoriaDto {
    @ApiProperty({
        description: 'ID del paciente',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre completo del paciente',
        example: 'María González',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Fecha de nacimiento',
        example: '1990-05-15',
    })
    fechaNacimiento!: Date;

    @ApiProperty({
        description: 'Género',
        example: 'Femenino',
    })
    genero!: string;

    @ApiPropertyOptional({
        description: 'Tipo de sangre',
        example: 'O+',
        required: false,
    })
    tipoSangre?: string;

    @ApiPropertyOptional({
        description: 'Estado de vida',
        example: 'Sedentario',
        required: false,
    })
    estadoVida?: string;

    @ApiPropertyOptional({
        description: 'Estilo de vida',
        example: 'No fumador',
        required: false,
    })
    estiloVida?: string;
}

/**
 * Enfermedad/condición del paciente
 */
export class EnfermedadHistoriaDto {
    @ApiProperty({
        description: 'Nombre de la enfermedad',
        example: 'Diabetes Mellitus Tipo 2',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Tipo de enfermedad',
        example: 'Endocrinológica',
    })
    tipo!: string;

    @ApiPropertyOptional({
        description: 'Observaciones sobre la enfermedad',
        example: 'Controlada con medicación',
        required: false,
    })
    observaciones?: string;
}

/**
 * Medicamento en una receta de la historia
 */
export class MedicamentoHistoriaDto {
    @ApiProperty({
        description: 'Nombre del medicamento',
        example: 'Metformina',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Duración del tratamiento',
        example: '30 días',
    })
    duracion!: string;

    @ApiProperty({
        description: 'Frecuencia de administración',
        example: '2 veces al día',
    })
    frecuencia!: string;

    @ApiProperty({
        description: 'Cantidad',
        example: 1,
    })
    cantidad!: number;

    @ApiProperty({
        description: 'Vía de administración',
        example: 'Oral',
    })
    viaAdministracion!: string;
}

/**
 * Receta médica en la historia clínica
 */
export class RecetaHistoriaDto {
    @ApiProperty({
        description: 'ID de la receta',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha de emisión',
        example: '2026-01-27T14:30:00.000Z',
    })
    fechaEmision!: Date;

    @ApiProperty({
        description: 'Nombre del médico',
        example: 'Dr. Juan Pérez',
    })
    medicoNombre!: string;

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Endocrinología',
    })
    medicoEspecialidad!: string;

    @ApiProperty({
        description: 'Diagnóstico de la atención',
        example: 'Diabetes Mellitus Tipo 2 - Control rutinario',
    })
    diagnostico!: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la receta',
        example: 'Continuar con dieta hipocalórica',
        required: false,
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Medicamentos recetados',
        type: [MedicamentoHistoriaDto],
    })
    medicamentos!: MedicamentoHistoriaDto[];
}

/**
 * Cita médica en la historia clínica
 */
export class CitaHistoriaDto {
    @ApiProperty({
        description: 'ID de la cita',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha de la cita',
        example: '2026-01-27T10:00:00.000Z',
    })
    fecha!: Date;

    @ApiProperty({
        description: 'Estado de la cita',
        example: 'Atendida',
    })
    estado!: string;

    @ApiProperty({
        description: 'Nombre del médico',
        example: 'Dr. Juan Pérez',
    })
    medicoNombre!: string;

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Endocrinología',
    })
    medicoEspecialidad!: string;

    @ApiPropertyOptional({
        description: 'Diagnóstico de la atención',
        example: 'Control de diabetes - Estable',
        required: false,
    })
    diagnostico?: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la atención',
        example: 'Paciente adherente al tratamiento',
        required: false,
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Indica si tiene receta médica',
        example: true,
    })
    tieneReceta!: boolean;

    @ApiPropertyOptional({
        description: 'Receta médica asociada',
        type: RecetaHistoriaDto,
        required: false,
    })
    receta?: RecetaHistoriaDto;
}

/**
 * Documento médico en la historia clínica
 */
export class DocumentoHistoriaDto {
    @ApiProperty({
        description: 'ID del documento',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Título del documento',
        example: 'Laboratorio - Enero 2026',
    })
    titulo!: string;

    @ApiProperty({
        description: 'Tipo de documento',
        example: 'Laboratorio',
    })
    tipo!: string;

    @ApiProperty({
        description: 'Fecha de subida',
        example: '2026-01-27T14:30:00.000Z',
    })
    fechaSubida!: Date;
}

/**
 * Resumen estadístico de la historia clínica
 */
export class ResumenHistoriaDto {
    @ApiProperty({
        description: 'Total de citas médicas',
        example: 15,
    })
    totalCitas!: number;

    @ApiProperty({
        description: 'Total de recetas médicas',
        example: 8,
    })
    totalRecetas!: number;

    @ApiProperty({
        description: 'Total de documentos médicos',
        example: 12,
    })
    totalDocumentos!: number;

    @ApiProperty({
        description: 'Total de enfermedades registradas',
        example: 2,
    })
    totalEnfermedades!: number;

    @ApiPropertyOptional({
        description: 'Fecha de la última atención',
        example: '2026-01-27T10:00:00.000Z',
        required: false,
    })
    ultimaAtencion?: Date;

    @ApiPropertyOptional({
        description: 'Fecha de la próxima cita programada',
        example: '2026-02-27T10:00:00.000Z',
        required: false,
    })
    proximaCita?: Date;
}

/**
 * DTO principal de la historia clínica completa
 */
export class HistoriaClinicaResponseDto {
    @ApiProperty({
        description: 'ID de la historia clínica',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Información del paciente',
        type: PacienteHistoriaDto,
    })
    paciente!: PacienteHistoriaDto;

    @ApiProperty({
        description: 'Enfermedades/condiciones del paciente',
        type: [EnfermedadHistoriaDto],
    })
    enfermedades!: EnfermedadHistoriaDto[];

    @ApiProperty({
        description: 'Historial de citas médicas (últimas 20)',
        type: [CitaHistoriaDto],
    })
    citas!: CitaHistoriaDto[];

    @ApiProperty({
        description: 'Documentos médicos (últimos 10)',
        type: [DocumentoHistoriaDto],
    })
    documentos!: DocumentoHistoriaDto[];

    @ApiProperty({
        description: 'Resumen estadístico',
        type: ResumenHistoriaDto,
    })
    resumen!: ResumenHistoriaDto;
}
