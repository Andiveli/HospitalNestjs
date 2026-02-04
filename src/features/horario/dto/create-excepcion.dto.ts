import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsDateString,
    IsString,
    MaxLength,
    IsOptional,
    Matches,
    IsBoolean,
} from 'class-validator';

/**
 * DTO para crear una excepción de horario
 * Las excepciones permiten al médico definir días específicos con horarios diferentes
 * o bloquear días completos (sin hora_inicio y hora_fin)
 */
export class CreateExcepcionDto {
    @ApiProperty({
        description: 'Fecha de la excepción (YYYY-MM-DD)',
        example: '2024-03-15',
    })
    @IsNotEmpty({ message: 'La fecha es obligatoria' })
    @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
    fecha!: string;

    @ApiPropertyOptional({
        description:
            'Hora de inicio (HH:MM). Si no se proporciona, se bloquea todo el día',
        example: '09:00',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'La hora de inicio debe ser un texto' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'La hora de inicio debe tener formato HH:MM (24 horas)',
    })
    horaInicio?: string;

    @ApiPropertyOptional({
        description:
            'Hora de fin (HH:MM). Si no se proporciona, se bloquea todo el día',
        example: '13:00',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'La hora de fin debe ser un texto' })
    @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
        message: 'La hora de fin debe tener formato HH:MM (24 horas)',
    })
    horaFin?: string;

    @ApiPropertyOptional({
        description: 'Motivo de la excepción',
        example: 'Reunión médica profesional',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'El motivo debe ser un texto' })
    @MaxLength(255, {
        message: 'El motivo no puede exceder 255 caracteres',
    })
    motivo?: string;

    @ApiPropertyOptional({
        description:
            'Indica si la excepción está confirmada/aprobada por administración',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Confirmada debe ser un valor booleano' })
    confirmada?: boolean;
}
