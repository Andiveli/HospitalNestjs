import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear un tipo de sangre
 */
export class CreateSangreDto {
    @ApiProperty({
        description: 'Nombre del tipo de sangre',
        example: 'A+',
    })
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre es obligatorio' })
    @MaxLength(10, { message: 'El nombre no puede exceder 10 caracteres' })
    nombre!: string;
}

/**
 * DTO para actualizar un tipo de sangre
 */
export class UpdateSangreDto {
    @ApiPropertyOptional({
        description: 'Nuevo nombre del tipo de sangre',
        example: 'O-',
    })
    @IsString({ message: 'El nombre debe ser un texto' })
    @MaxLength(10, { message: 'El nombre no puede exceder 10 caracteres' })
    nombre?: string;
}
