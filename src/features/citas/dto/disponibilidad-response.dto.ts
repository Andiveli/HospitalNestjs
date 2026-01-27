import { ApiProperty } from '@nestjs/swagger';

export class DisponibilidadHorario {
    @ApiProperty({
        description: 'Fecha disponible (YYYY-MM-DD)',
        example: '2024-01-15',
    })
    fecha!: string;

    @ApiProperty({
        description: 'Horas disponibles para esa fecha',
        example: ['09:00', '09:30', '10:00', '10:30'],
    })
    horasDisponibles!: string[];
}

export class DisponibilidadResponseDto {
    @ApiProperty({
        description: 'ID del médico',
        example: 1,
    })
    medicoId!: number;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Carlos Pérez',
    })
    nombreMedico!: string;

    @ApiProperty({
        description: 'Especialidad del médico',
        example: 'Cardiología',
    })
    especialidad!: string;

    @ApiProperty({
        description: 'Lista de fechas disponibles con sus horarios',
        type: [DisponibilidadHorario],
    })
    disponibilidad!: DisponibilidadHorario[];
}
