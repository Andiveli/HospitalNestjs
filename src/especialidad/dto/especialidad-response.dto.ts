import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para información de especialidad
 */
export class EspecialidadResponseDto {
    @ApiProperty({ description: 'ID de la especialidad' })
    id!: number;

    @ApiProperty({ description: 'Nombre de la especialidad' })
    nombre!: string;

    @ApiPropertyOptional({ description: 'Descripción de la especialidad' })
    descripcion?: string;
}

/**
 * DTO de respuesta para creación de especialidad
 */
export class CreateEspecialidadResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({ description: 'Datos de la especialidad creada' })
    data!: EspecialidadResponseDto;
}

/**
 * DTO de respuesta para lista paginada de especialidades
 */
export class GetEspecialidadesResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({
        description: 'Lista de especialidades',
        type: [EspecialidadResponseDto],
    })
    data!: EspecialidadResponseDto[];

    @ApiProperty({ description: 'Metadatos de paginación' })
    meta!: {
        total: number;
        page: number;
        limit: number;
    };
}
