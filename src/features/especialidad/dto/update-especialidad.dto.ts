import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar una especialidad médica existente
 */
export class UpdateEspecialidadDto {
    @ApiPropertyOptional({
        description: 'Nombre de la especialidad médica',
        example: 'Cardiología Pediátrica',
    })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    nombre?: string;

    @ApiPropertyOptional({
        description: 'Descripción de la especialidad',
        example: 'Especialidad dedicada al estudio del corazón en niños',
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string;
}
