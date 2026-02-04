import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para un estilo de vida
 */
export class EstiloVidaResponseDto {
    @ApiProperty({ description: 'ID del estilo de vida' })
    id!: number;

    @ApiProperty({ description: 'Nombre del estilo de vida' })
    nombre!: string;
}

/**
 * DTO de respuesta API para crear estilo de vida
 */
export class CreateEstiloVidaApiResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({ description: 'Datos del estilo de vida creado' })
    data!: EstiloVidaResponseDto;
}

/**
 * DTO de respuesta API para listar estilos de vida
 */
export class ListEstiloVidaApiResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({
        description: 'Lista de estilos de vida',
        type: [EstiloVidaResponseDto],
    })
    data!: EstiloVidaResponseDto[];
}
