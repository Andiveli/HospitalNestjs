import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

/**
 * DTO para consultar disponibilidad de un médico
 */
export class ConsultarDisponibilidadQueryDto {
    @ApiProperty({
        example: '2026-02-01',
        description: 'Fecha para consultar disponibilidad (formato YYYY-MM-DD)',
    })
    @IsNotEmpty({ message: 'La fecha es requerida' })
    @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
    fecha!: string;
}

/**
 * DTO de respuesta con los slots disponibles
 */
export class SlotDisponibleDto {
    @ApiProperty({
        example: '08:00',
        description: 'Hora de inicio del slot (formato HH:mm)',
    })
    horaInicio!: string;

    @ApiProperty({
        example: '08:30',
        description: 'Hora de fin del slot (formato HH:mm)',
    })
    horaFin!: string;
}

export class DisponibilidadResponseDto {
    @ApiProperty({
        example: '2026-02-01',
        description: 'Fecha consultada',
    })
    fecha!: string;

    @ApiProperty({
        example: 'Lunes',
        description: 'Nombre del día de la semana',
    })
    diaSemana!: string;

    @ApiProperty({
        type: [SlotDisponibleDto],
        description: 'Lista de slots disponibles de 30 minutos',
    })
    slots!: SlotDisponibleDto[];

    @ApiProperty({
        example: true,
        description: 'Indica si el médico atiende ese día',
    })
    atiende!: boolean;

    @ApiProperty({
        example: 'El médico no atiende los domingos',
        description: 'Mensaje informativo (opcional)',
        required: false,
    })
    mensaje?: string;
}
