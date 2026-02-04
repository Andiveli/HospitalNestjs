import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para datos de un tipo de enfermedad
 */
export class TipoEnfermedadDataDto {
    @ApiProperty({
        description: 'ID del tipo de enfermedad',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del tipo de enfermedad',
        example: 'Respiratoria',
    })
    nombre!: string;
}

/**
 * DTO de respuesta para operaciones de un solo tipo de enfermedad
 */
export class TipoEnfermedadResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Tipo de enfermedad creado correctamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos del tipo de enfermedad',
        type: TipoEnfermedadDataDto,
    })
    data!: TipoEnfermedadDataDto;
}

/**
 * DTO de respuesta para lista de tipos de enfermedad
 */
export class TiposEnfermedadListResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Lista de tipos de enfermedad',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de tipos de enfermedad',
        type: [TipoEnfermedadDataDto],
    })
    data!: TipoEnfermedadDataDto[];
}
