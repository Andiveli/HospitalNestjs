import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO de respuesta para un servicio referido
 */
export class ServicioReferidoDto {
    @ApiProperty({
        description: 'ID del servicio',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del servicio',
        example: 'Resonancia Magnética',
    })
    nombre!: string;
}

/**
 * DTO de respuesta para un centro de salud
 */
export class CentroSaludDto {
    @ApiProperty({
        description: 'ID del centro',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del centro',
        example: 'Hospital Central',
    })
    nombre!: string;

    @ApiPropertyOptional({
        description: 'Dirección del centro',
        example: 'Av. Principal 123',
    })
    direccion?: string;

    @ApiPropertyOptional({
        description: 'Teléfono del centro',
        example: '555-1234',
    })
    telefono?: string;
}

/**
 * DTO de respuesta para una derivación
 */
export class DerivacionResponseDto {
    @ApiProperty({
        description: 'ID de la derivación',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Motivo de la derivación',
        example: 'Requiere resonancia magnética especializada',
    })
    motivo!: string;

    @ApiProperty({
        description: 'Fecha de creación',
        example: '2026-02-02T14:30:00',
    })
    fechaHoraCreacion!: Date;

    @ApiPropertyOptional({
        description: 'ID del registro de atención asociado',
        example: 123,
    })
    registroAtencionId?: number;

    @ApiProperty({
        description: 'ID del médico que creó la derivación',
        example: 5,
    })
    medicoId!: number;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Pérez',
    })
    medicoNombre!: string;

    @ApiPropertyOptional({
        description: 'Centro de salud asignado',
        type: CentroSaludDto,
    })
    centro?: CentroSaludDto;

    @ApiProperty({
        description: 'Servicios referidos',
        type: [ServicioReferidoDto],
    })
    servicios!: ServicioReferidoDto[];
}

/**
 * DTO de respuesta API para una derivación
 */
export class DerivacionApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Derivación creada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la derivación',
        type: DerivacionResponseDto,
    })
    data!: DerivacionResponseDto;
}

/**
 * DTO de respuesta API para listado de derivaciones
 */
export class DerivacionesListApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Derivaciones obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de derivaciones',
        type: [DerivacionResponseDto],
    })
    data!: DerivacionResponseDto[];
}
