import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un nuevo tipo de enfermedad
 */
export class CreateTipoEnfermedadDto {
    @ApiProperty({
        description: 'Nombre del tipo de enfermedad',
        example: 'Respiratoria',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100)
    nombre!: string;
}
