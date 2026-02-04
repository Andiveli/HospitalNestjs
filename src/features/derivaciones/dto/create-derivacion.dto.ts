import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    MaxLength,
    IsOptional,
    IsInt,
    IsArray,
} from 'class-validator';

/**
 * DTO para crear una derivación
 */
export class CreateDerivacionDto {
    @ApiProperty({
        description: 'ID del registro de atención (cita_id)',
        example: 123,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'El ID de registro de atención debe ser un número' })
    registroAtencionId?: number;

    @ApiProperty({
        description: 'Motivo de la derivación',
        example: 'Requiere resonancia magnética especializada',
    })
    @IsNotEmpty({ message: 'El motivo es obligatorio' })
    @IsString({ message: 'El motivo debe ser un texto' })
    @MaxLength(255, {
        message: 'El motivo no puede exceder 255 caracteres',
    })
    motivo!: string;

    @ApiProperty({
        description: 'ID del centro de salud (opcional)',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsInt({ message: 'El ID del centro debe ser un número' })
    centroId?: number;

    @ApiProperty({
        description: 'IDs de los servicios referidos',
        example: [1, 2, 3],
        type: [Number],
    })
    @IsNotEmpty({ message: 'Debe especificar al menos un servicio' })
    @IsArray({ message: 'Los servicios deben ser un array' })
    @IsInt({ each: true, message: 'Cada servicio debe ser un número' })
    serviciosIds!: number[];
}
