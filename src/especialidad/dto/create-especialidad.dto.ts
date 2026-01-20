import { IsNotEmpty, IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear una nueva especialidad médica
 */
export class CreateEspecialidadDto {
    @ApiProperty({
        description: 'Nombre de la especialidad médica',
        example: 'Cardiología',
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    nombre!: string;

    @ApiPropertyOptional({
        description: 'Descripción de la especialidad',
        example:
            'Especialidad dedicada al estudio del corazón y sistema circulatorio',
    })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    descripcion?: string;
}
