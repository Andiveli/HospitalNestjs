import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una nueva presentación de medicamento
 */
export class CreatePresentacionDto {
    @ApiProperty({
        description: 'Nombre de la presentación',
        example: 'Comprimidos',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre!: string;
}

/**
 * DTO para actualizar una presentación existente
 */
export class UpdatePresentacionDto {
    @ApiProperty({
        description: 'Nuevo nombre de la presentación',
        example: 'Cápsulas',
        maxLength: 100,
        required: false,
    })
    @IsString()
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre?: string;
}
