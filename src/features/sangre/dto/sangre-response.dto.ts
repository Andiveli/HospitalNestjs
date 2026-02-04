import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para un tipo de sangre
 */
export class SangreResponseDto {
    @ApiProperty({ description: 'ID del tipo de sangre' })
    id!: number;

    @ApiProperty({ description: 'Nombre del tipo de sangre' })
    nombre!: string;
}

/**
 * DTO de respuesta API para crear tipo de sangre
 */
export class CreateSangreApiResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({ description: 'Datos del tipo de sangre creado' })
    data!: SangreResponseDto;
}

/**
 * DTO de respuesta API para listar tipos de sangre
 */
export class ListSangreApiResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({
        description: 'Lista de tipos de sangre',
        type: [SangreResponseDto],
    })
    data!: SangreResponseDto[];
}
