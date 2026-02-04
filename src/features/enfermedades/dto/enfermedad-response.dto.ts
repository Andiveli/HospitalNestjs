import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO con los datos de una enfermedad
 */
export class EnfermedadResponseDto {
    @ApiProperty({
        description: 'ID único de la enfermedad',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre de la enfermedad',
        example: 'Diabetes Tipo 2',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Descripción detallada de la enfermedad',
        example: 'Enfermedad metabólica crónica',
        nullable: true,
    })
    descripcion!: string | null;
}

/**
 * DTO para respuesta de lista de enfermedades
 */
export class EnfermedadesListResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Enfermedades obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de enfermedades',
        type: [EnfermedadResponseDto],
    })
    data!: EnfermedadResponseDto[];
}

/**
 * DTO para respuesta de enfermedad única
 */
export class EnfermedadSingleResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Enfermedad obtenida exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la enfermedad',
        type: EnfermedadResponseDto,
    })
    data!: EnfermedadResponseDto;
}

/**
 * DTO para respuesta de creación exitosa
 */
export class EnfermedadCreatedResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Enfermedad creada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la enfermedad creada',
        type: EnfermedadResponseDto,
    })
    data!: EnfermedadResponseDto;
}

/**
 * DTO para respuesta de actualización exitosa
 */
export class EnfermedadUpdatedResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Enfermedad actualizada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la enfermedad actualizada',
        type: EnfermedadResponseDto,
    })
    data!: EnfermedadResponseDto;
}

/**
 * DTO para respuesta cuando no hay enfermedades
 */
export class EnfermedadesEmptyResponseDto {
    @ApiProperty({
        description: 'Mensaje informativo',
        example: 'No hay enfermedades registradas',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista vacía',
        example: [],
        type: [EnfermedadResponseDto],
    })
    data!: EnfermedadResponseDto[];
}
