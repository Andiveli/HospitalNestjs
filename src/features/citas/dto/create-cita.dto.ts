import {
    IsNotEmpty,
    IsDateString,
    IsBoolean,
    IsOptional,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCitaDto {
    @ApiProperty({
        description: 'ID del médico con el que se agendará la cita',
        example: 11,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'El ID del médico es obligatorio' })
    @IsInt({ message: 'El ID del médico debe ser un número entero' })
    @Min(1, { message: 'El ID del médico debe ser mayor a 0' })
    medicoId!: number;

    @ApiProperty({
        description: 'Fecha y hora de inicio de la cita en formato ISO 8601',
        example: '2026-02-15T10:00:00.000Z',
    })
    @IsNotEmpty({ message: 'La fecha y hora de inicio es obligatoria' })
    @IsDateString(
        {},
        {
            message:
                'La fecha y hora de inicio debe ser una fecha válida en formato ISO 8601',
        },
    )
    fechaHoraInicio!: string;

    @ApiPropertyOptional({
        description: 'Indica si la cita será telefónica',
        default: true,
        example: true,
    })
    @IsOptional()
    @IsBoolean({ message: 'El campo telefónica debe ser un booleano' })
    telefonica?: boolean;
}
