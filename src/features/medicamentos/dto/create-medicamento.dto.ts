import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    MaxLength,
    IsOptional,
    IsInt,
    Min,
} from 'class-validator';

/**
 * DTO para crear un nuevo medicamento
 */
export class CreateMedicamentoDto {
    @ApiProperty({
        description: 'Nombre comercial del medicamento',
        example: 'Paracetamol',
    })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @IsString({ message: 'El nombre debe ser un texto' })
    @MaxLength(150, {
        message: 'El nombre no puede exceder 150 caracteres',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Principio activo del medicamento',
        example: 'Paracetamol',
    })
    @IsNotEmpty({ message: 'El principio activo es obligatorio' })
    @IsString({ message: 'El principio activo debe ser un texto' })
    @MaxLength(150, {
        message: 'El principio activo no puede exceder 150 caracteres',
    })
    principioActivo!: string;

    @ApiPropertyOptional({
        description: 'Concentración del medicamento',
        example: '500mg',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'La concentración debe ser un texto' })
    @MaxLength(100, {
        message: 'La concentración no puede exceder 100 caracteres',
    })
    concentracion?: string;

    @ApiProperty({
        description: 'ID de la presentación del medicamento',
        example: 1,
    })
    @IsNotEmpty({ message: 'La presentación es obligatoria' })
    @IsInt({ message: 'La presentación debe ser un número entero' })
    @Min(1, { message: 'La presentación debe ser mayor a 0' })
    presentacionId!: number;
}
