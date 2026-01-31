import { ApiProperty } from '@nestjs/swagger';

/**
 * Información del médico en la cita
 */
export class MedicoInfoDto {
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

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Cardiología',
        required: false,
    })
    especialidad?: string;
}

/**
 * Información del paciente en la cita
 */
export class PacienteInfoDto {
    @ApiProperty({
        description: 'ID del paciente',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del paciente',
        example: 'María',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Apellido del paciente',
        example: 'González',
    })
    apellido!: string;
}

/**
 * DTO para la respuesta de una cita
 */
export class CitaResponseDto {
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
        example: 'pendiente',
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
}
