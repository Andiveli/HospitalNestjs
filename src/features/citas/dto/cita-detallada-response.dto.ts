import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MedicoInfoDto, PacienteInfoDto } from './cita-response.dto';

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
}
