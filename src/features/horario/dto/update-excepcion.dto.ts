import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDateString,
    IsString,
    MaxLength,
    IsOptional,
    Matches,
    IsBoolean,
} from 'class-validator';

/**
 * DTO para actualizar una excepción de horario existente
 */
export class UpdateExcepcionDto {
    @ApiPropertyOptional({
        description: 'Fecha de la excepción (YYYY-MM-DD)',
        example: '2024-03-15',
    })
    @IsOptional()
    @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
    fecha?: string;

    @ApiPropertyOptional({
        description:
            'Hora de inicio (HH:MM). Si no se proporciona, se bloquea todo el día',
        example: '09:00',
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
    })
    @IsOptional()
    @IsBoolean({ message: 'Confirmada debe ser un valor booleano' })
    confirmada?: boolean;
}
