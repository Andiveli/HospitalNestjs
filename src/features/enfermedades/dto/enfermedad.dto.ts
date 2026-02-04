import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * DTO para crear una nueva enfermedad
 */
export class EnfermedadDto {
    @ApiProperty({
        description: 'Nombre de la enfermedad',
        example: 'Diabetes Tipo 2',
        minLength: 1,
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
    nombre!: string;

    @ApiProperty({
        description: 'Descripción detallada de la enfermedad',
        example:
            'Enfermedad metabólica crónica caracterizada por niveles elevados de glucosa en sangre',
        required: false,
        nullable: true,
    })
    @IsString()
    @IsOptional()
    descripcion?: string;
}
