import { ApiProperty } from '@nestjs/swagger';

export interface MedicoInfo {
    id: number;
    nombre: string;
    apellido: string;
    especialidad?: string;
}

export interface PacienteInfo {
    id: number;
    nombre: string;
    apellido: string;
}

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
        example: {
            id: 11,
            nombre: 'Juan',
            apellido: 'Pérez',
            especialidad: 'Cardiología',
        },
    })
    medico!: MedicoInfo;

    @ApiProperty({
        description: 'Información del paciente',
        example: {
            id: 5,
            nombre: 'María',
            apellido: 'González',
        },
    })
    paciente!: PacienteInfo;
}
