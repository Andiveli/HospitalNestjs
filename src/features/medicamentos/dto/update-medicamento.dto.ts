import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, IsOptional, IsInt, Min } from 'class-validator';

/**
 * DTO para actualizar un medicamento existente
 */
export class UpdateMedicamentoDto {
    @ApiPropertyOptional({
        description: 'Nombre comercial del medicamento',
        example: 'Paracetamol',
    })
    @IsOptional()
    @IsString({ message: 'El nombre debe ser un texto' })
    @MaxLength(150, {
        message: 'El nombre no puede exceder 150 caracteres',
    })
    nombre?: string;

    @ApiPropertyOptional({
        description: 'Principio activo del medicamento',
        example: 'Paracetamol',
    })
    @IsOptional()
    @IsString({ message: 'El principio activo debe ser un texto' })
    @MaxLength(150, {
        message: 'El principio activo no puede exceder 150 caracteres',
    })
    principioActivo?: string;

    @ApiPropertyOptional({
        description: 'Concentración del medicamento',
        example: '500mg',
    })
    @IsOptional()
    @IsString({ message: 'La concentración debe ser un texto' })
    @MaxLength(100, {
        message: 'La concentración no puede exceder 100 caracteres',
    })
    concentracion?: string;

    @ApiPropertyOptional({
        description: 'ID de la presentación del medicamento',
        example: 1,
    })
    @IsOptional()
    @IsInt({ message: 'La presentación debe ser un número entero' })
    @Min(1, { message: 'La presentación debe ser mayor a 0' })
    presentacionId?: number;
}
