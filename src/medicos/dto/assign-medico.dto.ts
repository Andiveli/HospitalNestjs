import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ArrayNotEmpty,
    ValidateNested,
    Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HorarioDto {
    @ApiProperty({
        description: 'Nombre del día de atención (ej: Lunes, Martes)',
    })
    @IsString()
    @IsNotEmpty()
    diaNombre!: string;

    @ApiProperty({ description: 'Hora de inicio (formato HH:MM)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'El formato de hora debe ser HH:MM (24 horas)',
    })
    horaInicio!: string;

    @ApiProperty({ description: 'Hora de fin (formato HH:MM)' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'El formato de hora debe ser HH:MM (24 horas)',
    })
    horaFin!: string;
}

export class EspecialidadDto {
    @ApiProperty({ description: 'Nombre de la especialidad' })
    @IsString()
    @IsNotEmpty()
    especialidadNombre!: string;

    @ApiProperty({
        description: '¿Es la especialidad principal del médico?',
        default: false,
    })
    @IsOptional()
    principal?: boolean = false;
}

export class AssignMedicoDto {
    @ApiProperty({
        description: 'ID del usuario (paciente) a convertir en médico',
    })
    @IsNumber()
    @IsNotEmpty()
    usuarioId!: number;

    @ApiPropertyOptional({
        description: 'Número de pasaporte (opcional, usa cédula por defecto)',
    })
    @IsString()
    @IsOptional()
    pasaporte?: string;

    @ApiProperty({
        description: 'Licencia médica del profesional',
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    licenciaMedica!: string;

    @ApiProperty({
        description: 'Especialidades del médico',
        type: [EspecialidadDto],
        required: true,
    })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => EspecialidadDto)
    especialidades!: EspecialidadDto[];

    @ApiProperty({
        description: 'Horarios de atención del médico',
        type: [HorarioDto],
        required: true,
    })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => HorarioDto)
    horarios!: HorarioDto[];
}
