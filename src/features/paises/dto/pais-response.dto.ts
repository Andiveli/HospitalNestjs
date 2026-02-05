import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para respuesta de país
 */
export class PaisResponseDto {
    @ApiProperty({ description: 'ID del país', example: 1 })
    id!: number;

    @ApiProperty({ description: 'Nombre del país', example: 'Argentina' })
    nombre!: string;
}

/**
 * DTO para respuesta de lista de países
 */
export class PaisesListApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Países obtenidos exitosamente',
    })
    message!: string;

    @ApiProperty({ type: [PaisResponseDto], description: 'Lista de países' })
    data!: PaisResponseDto[];
}

/**
 * DTO para respuesta de creación de país
 */
export class PaisApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'País creado exitosamente',
    })
    message!: string;

    @ApiProperty({
        type: PaisResponseDto,
        description: 'Datos del país creado',
    })
    data!: PaisResponseDto;
}

/**
 * DTO para respuesta cuando no hay países
 */
export class PaisesEmptyResponseDto {
    @ApiProperty({
        description: 'Mensaje cuando no hay países',
        example: 'No hay países registrados',
    })
    message!: string;
}
