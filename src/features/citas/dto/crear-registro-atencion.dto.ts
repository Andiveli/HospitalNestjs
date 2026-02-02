import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsInt,
    Min,
    IsString,
    MaxLength,
    IsOptional,
    IsArray,
    ArrayMinSize,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MedicamentoRecetaDto } from '../../recetas/dto/medicamento-receta.dto';

/**
 * DTO para crear un registro de atención médica completo
 * Incluye diagnóstico, observaciones y receta médica opcional
 */
export class CrearRegistroAtencionDto {
    @ApiProperty({
        description: 'ID de la cita atendida',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'El ID de la cita es obligatorio' })
    @IsInt({ message: 'El ID de la cita debe ser un número entero' })
    @Min(1, { message: 'El ID de la cita debe ser mayor a 0' })
    citaId!: number;

    @ApiProperty({
        description: 'Diagnóstico médico de la atención',
        example: 'Gripe viral con fiebre moderada',
    })
    @IsNotEmpty({ message: 'El diagnóstico es obligatorio' })
    @IsString({ message: 'El diagnóstico debe ser un texto' })
    @MaxLength(2000, {
        message: 'El diagnóstico no puede exceder 2000 caracteres',
    })
    diagnostico!: string;

    @ApiPropertyOptional({
        description: 'Observaciones adicionales de la atención',
        example: 'Paciente refiere dolor de cabeza persistente',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    @MaxLength(2000, {
        message: 'Las observaciones no pueden exceder 2000 caracteres',
    })
    observaciones?: string;

    @ApiPropertyOptional({
        description: 'Observaciones generales de la receta médica',
        example: 'Tomar los medicamentos después de las comidas',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones de la receta deben ser un texto' })
    @MaxLength(1000, {
        message:
            'Las observaciones de la receta no pueden exceder 1000 caracteres',
    })
    observacionesReceta?: string;

    @ApiPropertyOptional({
        description: 'Lista de medicamentos a recetar (opcional)',
        type: [MedicamentoRecetaDto],
        required: false,
    })
    @IsOptional()
    @IsArray({ message: 'Los medicamentos deben ser un array' })
    @ArrayMinSize(1, {
        message: 'Debe incluir al menos un medicamento si proporciona la lista',
    })
    @ValidateNested({ each: true })
    @Type(() => MedicamentoRecetaDto)
    medicamentos?: MedicamentoRecetaDto[];
}
