import {
    IsDateString,
    IsOptional,
    IsString,
    Matches,
    IsEnum,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Sangre } from './info.dto';

/**
 * DTO para actualizar información del paciente (campos opcionales)
 */
export class UpdateInfoDto {
    @ApiPropertyOptional({
        description: 'Fecha de nacimiento del paciente (YYYY-MM-DD)',
        example: '1990-05-15',
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'Formato de fecha incorrecto (YYYY-MM-DD)' })
    fecha?: string;

    @ApiPropertyOptional({
        description: 'Número de teléfono del paciente',
        example: '+5491155551234',
        pattern: '^[+]?[0-9]{10}$',
        minLength: 10,
        maxLength: 15,
    })
    @IsOptional()
    @IsString()
    @Matches(/^\+?[0-9]{10}$/, {
        message: 'El numero de telefono no es valido',
    })
    telefono?: string;

    @ApiPropertyOptional({
        description: 'Dirección completa de residencia',
        example: 'Av. Corrientes 1234, Buenos Aires',
        minLength: 10,
        maxLength: 255,
    })
    @IsOptional()
    @IsString()
    residencia?: string;

    @ApiPropertyOptional({
        description: 'País de residencia del paciente',
        example: 'Argentina',
        minLength: 3,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    pais?: string;

    @ApiPropertyOptional({
        description: 'Grupo sanguíneo del paciente',
        example: 'O+',
        enum: [
            Sangre.A_POSITIVE,
            Sangre.A_NEGATIVE,
            Sangre.B_POSITIVE,
            Sangre.B_NEGATIVE,
            Sangre.AB_POSITIVE,
            Sangre.AB_NEGATIVE,
            Sangre.O_POSITIVE,
            Sangre.O_NEGATIVE,
        ],
    })
    @IsOptional()
    @IsEnum(Sangre, {
        message:
            'Grupo sanguíneo no válido. Opciones: A+, A-, B+, B-, AB+, AB-, O+, O-',
    })
    sangre?: Sangre;

    @ApiPropertyOptional({
        description:
            'Estilo de vida del paciente (debe existir en la tabla estilos_vida)',
        example: 'Activo',
        minLength: 1,
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
        message: 'El estilo de vida solo puede contener letras',
    })
    estiloVida?: string;
}
