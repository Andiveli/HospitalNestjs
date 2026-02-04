import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Información básica del paciente para la historia clínica
 */
export class PacienteHistoriaDto {
    @ApiProperty({
        description: 'ID del paciente (usuario_id)',
        example: 10,
    })
    id!: number;

    @ApiProperty({
        description: 'Cédula del paciente',
        example: '0912345678',
    })
    cedula!: string;

    @ApiProperty({
        description: 'Nombre completo del paciente',
        example: 'María José García López',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Email del paciente',
        example: 'maria.garcia@email.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Fecha de nacimiento',
        example: '1990-05-15',
    })
    fechaNacimiento!: string;

    @ApiProperty({
        description: 'Edad del paciente',
        example: 34,
    })
    edad!: number;

    @ApiProperty({
        description: 'Género del paciente',
        example: 'Femenino',
    })
    genero!: string;

    @ApiProperty({
        description: 'País de origen',
        example: 'Ecuador',
    })
    pais!: string;

    @ApiPropertyOptional({
        description: 'Lugar de residencia',
        example: 'Quito, Pichincha',
    })
    lugarResidencia?: string;

    @ApiPropertyOptional({
        description: 'Número de celular',
        example: '0987654321',
    })
    numeroCelular?: string;

    @ApiProperty({
        description: 'Grupo sanguíneo',
        example: 'O+',
    })
    grupoSanguineo!: string;

    @ApiProperty({
        description: 'Estilo de vida',
        example: 'Activo',
    })
    estiloVida!: string;
}

/**
 * Información de enfermedad/antecedente del paciente
 */
export class EnfermedadPacienteHistoriaDto {
    @ApiProperty({
        description: 'ID de la enfermedad',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre de la enfermedad',
        example: 'Diabetes Tipo 2',
    })
    nombre!: string;

    @ApiPropertyOptional({
        description: 'Descripción de la enfermedad',
        example: 'Enfermedad metabólica crónica',
        nullable: true,
    })
    descripcion!: string | null;

    @ApiProperty({
        description: 'Tipo de enfermedad (antecedente, alergia, etc.)',
        example: 'Antecedente familiar',
    })
    tipoEnfermedad!: string;

    @ApiPropertyOptional({
        description: 'Detalle adicional del paciente sobre la enfermedad',
        example: 'Diagnosticada hace 5 años',
    })
    detalle?: string;
}

/**
 * Información de medicamento en una receta
 */
export class MedicamentoRecetaHistoriaDto {
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
        description: 'Concentración',
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
 * Información de receta médica en la historia clínica
 */
export class RecetaHistoriaDto {
    @ApiProperty({
        description: 'ID de la receta (registro_atencion_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de creación',
        example: '2024-01-20T14:30:00.000Z',
    })
    fechaHoraCreacion!: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la receta',
        example: 'Tomar los medicamentos con agua',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Medicamentos recetados',
        type: [MedicamentoRecetaHistoriaDto],
    })
    medicamentos!: MedicamentoRecetaHistoriaDto[];
}

/**
 * Información del médico que realizó la atención
 */
export class MedicoAtencionHistoriaDto {
    @ApiProperty({
        description: 'ID del médico',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Carlos Pérez',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Medicina General',
    })
    especialidad!: string;
}

/**
 * Información de un registro de atención en la historia clínica
 */
export class RegistroAtencionHistoriaDto {
    @ApiProperty({
        description: 'ID del registro (cita_id)',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de la atención',
        example: '2024-01-20T10:00:00.000Z',
    })
    fechaHoraAtencion!: string;

    @ApiProperty({
        description: 'Fecha y hora de creación del registro',
        example: '2024-01-20T14:30:00.000Z',
    })
    fechaHoraCreacion!: string;

    @ApiPropertyOptional({
        description: 'Motivo de la consulta',
        example: 'Dolor de cabeza persistente',
    })
    motivoCita?: string;

    @ApiPropertyOptional({
        description: 'Diagnóstico médico',
        example: 'Migraña tensional',
    })
    diagnostico?: string;

    @ApiPropertyOptional({
        description: 'Observaciones de la atención',
        example: 'Paciente refiere estrés laboral',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Médico que realizó la atención',
        type: MedicoAtencionHistoriaDto,
    })
    medico!: MedicoAtencionHistoriaDto;

    @ApiPropertyOptional({
        description: 'Receta médica asociada (si existe)',
        type: RecetaHistoriaDto,
    })
    receta?: RecetaHistoriaDto;
}

/**
 * Información de documento en la historia clínica
 */
export class DocumentoHistoriaDto {
    @ApiProperty({
        description: 'ID del documento',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Título del documento',
        example: 'Radiografía de tórax',
    })
    titulo!: string;

    @ApiProperty({
        description: 'URL del documento',
        example: 'https://s3.bucket.com/documents/radiografia.pdf',
    })
    url!: string;

    @ApiProperty({
        description: 'Tipo MIME del archivo',
        example: 'application/pdf',
    })
    mimeType!: string;

    @ApiProperty({
        description: 'Tipo de documento',
        example: 'Examen de laboratorio',
    })
    tipoDocumento!: string;

    @ApiProperty({
        description: 'Fecha y hora de subida',
        example: '2024-01-20T10:00:00.000Z',
    })
    fechaHoraSubida!: string;
}

/**
 * Respuesta completa de historia clínica
 */
export class HistoriaClinicaCompletaDto {
    @ApiProperty({
        description: 'ID de la historia clínica (paciente_id)',
        example: 10,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha y hora de apertura de la historia',
        example: '2024-01-15T10:30:00.000Z',
    })
    fechaHoraApertura!: string;

    @ApiProperty({
        description: 'Información del paciente',
        type: PacienteHistoriaDto,
    })
    paciente!: PacienteHistoriaDto;

    @ApiProperty({
        description: 'Enfermedades y antecedentes del paciente',
        type: [EnfermedadPacienteHistoriaDto],
    })
    enfermedades!: EnfermedadPacienteHistoriaDto[];

    @ApiProperty({
        description: 'Registros de atención médica',
        type: [RegistroAtencionHistoriaDto],
    })
    registrosAtencion!: RegistroAtencionHistoriaDto[];

    @ApiProperty({
        description: 'Documentos adjuntos a la historia',
        type: [DocumentoHistoriaDto],
    })
    documentos!: DocumentoHistoriaDto[];

    @ApiProperty({
        description: 'Total de atenciones registradas',
        example: 5,
    })
    totalAtenciones!: number;
}

/**
 * Respuesta API para obtener historia clínica
 */
export class HistoriaClinicaApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Historia clínica obtenida exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la historia clínica',
        type: HistoriaClinicaCompletaDto,
    })
    data!: HistoriaClinicaCompletaDto;
}

/**
 * Respuesta cuando no existe historia clínica
 */
export class HistoriaClinicaNoExisteDto {
    @ApiProperty({
        description: 'Indica que el paciente no tiene historia clínica',
        example: false,
    })
    existe!: boolean;

    @ApiProperty({
        description: 'Mensaje informativo',
        example:
            'El paciente no tiene historia clínica. Se creará automáticamente en la primera atención médica.',
    })
    message!: string;
}
