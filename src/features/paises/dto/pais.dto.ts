import {
    IsNotEmpty,
    IsString,
    MaxLength,
    IsOptional,
    IsInt,
    Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear un país
 */
export class CreatePaisDto {
    @ApiProperty({
        description: 'Nombre del país',
        example: 'Argentina',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre!: string;
}

/**
 * DTO para actualizar un país
 */
export class UpdatePaisDto {
    @ApiProperty({
        description: 'Nuevo nombre del país',
        example: 'Brasil',
        maxLength: 100,
        required: false,
    })
    @IsString()
    @IsOptional()
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    nombre?: string;
}

/**
 * DTO para parámetros de ID
 */
export class PaisIdDto {
    @ApiProperty({ description: 'ID del país', example: 1 })
    @IsInt()
    @Min(1)
    id!: number;
}
