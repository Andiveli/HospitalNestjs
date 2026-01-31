import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    Min,
    IsString,
    MaxLength,
    IsOptional,
} from 'class-validator';

export class MedicamentoRecetaDto {
    @ApiProperty({
        description: 'ID del medicamento',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'El ID del medicamento es obligatorio' })
    @IsInt({ message: 'El ID del medicamento debe ser un número entero' })
    @Min(1, { message: 'El ID del medicamento debe ser mayor a 0' })
    medicamentoId!: number;

    @ApiProperty({
        description: 'Duración del tratamiento (ej: 7 días, 2 semanas)',
        example: '7 días',
    })
    @IsNotEmpty({ message: 'La duración es obligatoria' })
    @IsString({ message: 'La duración debe ser un texto' })
    @MaxLength(100, {
        message: 'La duración no puede exceder 100 caracteres',
    })
    duracion!: string;

    @ApiProperty({
        description:
            'Frecuencia de administración (ej: Cada 8 horas, 2 veces al día)',
        example: 'Cada 8 horas',
    })
    @IsNotEmpty({ message: 'La frecuencia es obligatoria' })
    @IsString({ message: 'La frecuencia debe ser un texto' })
    @MaxLength(100, {
        message: 'La frecuencia no puede exceder 100 caracteres',
    })
    frecuencia!: string;

    @ApiProperty({
        description: 'Cantidad a administrar',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'La cantidad es obligatoria' })
    @IsInt({ message: 'La cantidad debe ser un número entero' })
    @Min(1, { message: 'La cantidad debe ser al menos 1' })
    cantidad!: number;

    @ApiProperty({
        description: 'ID de la vía de administración',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'La vía de administración es obligatoria' })
    @IsInt({ message: 'La vía de administración debe ser un número entero' })
    @Min(1, { message: 'La vía de administración debe ser mayor a 0' })
    viaAdministracionId!: number;

    @ApiProperty({
        description: 'ID de la unidad de medida',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'La unidad de medida es obligatoria' })
    @IsInt({ message: 'La unidad de medida debe ser un número entero' })
    @Min(1, { message: 'La unidad de medida debe ser mayor a 0' })
    unidadMedidaId!: number;

    @ApiProperty({
        description: 'Indicaciones adicionales para el paciente',
        example: 'Tomar después de las comidas',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Las indicaciones deben ser un texto' })
    @MaxLength(255, {
        message: 'Las indicaciones no pueden exceder 255 caracteres',
    })
    indicaciones?: string;
}
