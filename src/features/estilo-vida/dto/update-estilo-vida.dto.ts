import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar un estilo de vida
 */
export class UpdateEstiloVidaDto {
    @ApiPropertyOptional({
        description: 'Nuevo nombre del estilo de vida',
        example: 'Activo',
    })
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsOptional()
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre?: string;
}
