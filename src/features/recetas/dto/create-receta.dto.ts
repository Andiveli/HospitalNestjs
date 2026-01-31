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
import { MedicamentoRecetaDto } from './medicamento-receta.dto';

export class CreateRecetaDto {
    @ApiProperty({
        description: 'ID del registro de atención (cita atendida)',
        example: 1,
        minimum: 1,
    })
    @IsNotEmpty({ message: 'El ID del registro de atención es obligatorio' })
    @IsInt({
        message: 'El ID del registro de atención debe ser un número entero',
    })
    @Min(1, { message: 'El ID del registro de atención debe ser mayor a 0' })
    registroAtencionId!: number;

    @ApiPropertyOptional({
        description: 'Observaciones generales de la receta médica',
        example: 'Paciente con alergia a la penicilina',
        required: false,
    })
    @IsOptional()
    @IsString({ message: 'Las observaciones deben ser un texto' })
    @MaxLength(1000, {
        message: 'Las observaciones no pueden exceder 1000 caracteres',
    })
    observaciones?: string;

    @ApiProperty({
        description: 'Lista de medicamentos a recetar',
        type: [MedicamentoRecetaDto],
        minItems: 1,
    })
    @IsNotEmpty({ message: 'Debe incluir al menos un medicamento' })
    @IsArray({ message: 'Los medicamentos deben ser un array' })
    @ArrayMinSize(1, { message: 'Debe incluir al menos un medicamento' })
    @ValidateNested({ each: true })
    @Type(() => MedicamentoRecetaDto)
    medicamentos!: MedicamentoRecetaDto[];
}
