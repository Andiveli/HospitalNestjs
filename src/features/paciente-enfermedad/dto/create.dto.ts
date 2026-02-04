import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

/**
 * DTO para crear una relación entre paciente y enfermedad
 * Asocia un paciente con una enfermedad del catálogo
 */
export class CreatePacienteEnfermedadDto {
    @ApiProperty({
        description: 'ID del paciente (usuario_id)',
        example: 10,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    pacienteId!: number;

    @ApiProperty({
        description: 'ID de la enfermedad a asociar',
        example: 5,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    enfermedadId!: number;

    @ApiProperty({
        description: 'Detalle adicional sobre la enfermedad del paciente',
        example: 'Diagnosticada en 2020. Controlada con medicación.',
        required: false,
        maxLength: 1000,
    })
    @IsString()
    @IsOptional()
    @MaxLength(1000)
    detalle?: string;

    @ApiProperty({
        description: 'ID del tipo de enfermedad (ej: antecedente, alergia)',
        example: 1,
        minimum: 1,
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    tipoEnfermedadId!: number;
}
