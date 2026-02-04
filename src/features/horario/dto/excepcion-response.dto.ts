import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO con información del médico para excepciones (vista admin)
 */
export class MedicoExcepcionInfoDto {
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
        example: 'Cardiología',
    })
    especialidad?: string;
}

/**
 * DTO de respuesta para una excepción de horario
 */
export class ExcepcionResponseDto {
    @ApiProperty({
        description: 'ID de la excepción',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Fecha de la excepción',
        example: '2024-03-15',
    })
    fecha!: string;

    @ApiPropertyOptional({
        description: 'Hora de inicio (null si es día bloqueado completo)',
        example: '09:00',
    })
    horaInicio?: string | null;

    @ApiPropertyOptional({
        description: 'Hora de fin (null si es día bloqueado completo)',
        example: '13:00',
    })
    horaFin?: string | null;

    @ApiPropertyOptional({
        description: 'Motivo de la excepción',
        example: 'Reunión médica profesional',
    })
    motivo?: string | null;

    @ApiProperty({
        description: 'Indica si bloquea todo el día',
        example: false,
    })
    diaCompleto!: boolean;

    @ApiProperty({
        description:
            'Indica si la excepción está confirmada/aprobada por administración',
        example: false,
    })
    confirmada!: boolean;

    @ApiPropertyOptional({
        description: 'Información del médico (solo en vista admin)',
        type: MedicoExcepcionInfoDto,
    })
    medico?: MedicoExcepcionInfoDto;
}

/**
 * DTO de respuesta API para una excepción
 */
export class ExcepcionApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Excepción creada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la excepción',
        type: ExcepcionResponseDto,
    })
    data!: ExcepcionResponseDto;
}

/**
 * DTO de respuesta API para listado de excepciones
 */
export class ExcepcionesListApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Excepciones obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de excepciones',
        type: [ExcepcionResponseDto],
    })
    data!: ExcepcionResponseDto[];
}

/**
 * DTO de respuesta API para excepciones agrupadas por médico (vista admin)
 */
export class ExcepcionesPorMedicoResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Excepciones por médico obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de médicos con sus excepciones',
        type: [Object],
        example: [
            {
                medico: {
                    id: 5,
                    nombreCompleto: 'Dr. Juan Pérez',
                    especialidad: 'Cardiología',
                },
                totalExcepciones: 3,
                excepciones: [
                    {
                        id: 1,
                        fecha: '2024-03-15',
                        diaCompleto: true,
                        motivo: 'Vacaciones',
                    },
                ],
            },
        ],
    })
    data!: Array<{
        medico: MedicoExcepcionInfoDto;
        totalExcepciones: number;
        excepciones: ExcepcionResponseDto[];
    }>;
}
