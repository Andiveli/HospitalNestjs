import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO con información de la presentación
 */
export class PresentacionResponseDto {
    @ApiProperty({
        description: 'ID de la presentación',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre de la presentación',
        example: 'Tabletas',
    })
    nombre!: string;
}

/**
 * DTO de respuesta para un medicamento
 */
export class MedicamentoResponseDto {
    @ApiProperty({
        description: 'ID del medicamento',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre comercial del medicamento',
        example: 'Paracetamol',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Principio activo del medicamento',
        example: 'Paracetamol',
    })
    principioActivo!: string;

    @ApiPropertyOptional({
        description: 'Concentración del medicamento',
        example: '500mg',
    })
    concentracion?: string;

    @ApiProperty({
        description: 'Presentación del medicamento',
        type: PresentacionResponseDto,
    })
    presentacion!: PresentacionResponseDto;
}

/**
 * DTO de respuesta API para crear/actualizar medicamento
 */
export class MedicamentoApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Medicamento creado exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos del medicamento',
        type: MedicamentoResponseDto,
    })
    data!: MedicamentoResponseDto;
}

/**
 * DTO de respuesta API para listado de medicamentos
 */
export class MedicamentosListApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Medicamentos obtenidos exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de medicamentos',
        type: [MedicamentoResponseDto],
    })
    data!: MedicamentoResponseDto[];
}

/**
 * DTO de respuesta API para presentaciones
 */
export class PresentacionesListApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Presentaciones obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Lista de presentaciones',
        type: [PresentacionResponseDto],
    })
    data!: PresentacionResponseDto[];
}

/**
 * DTO de respuesta API para crear/actualizar presentación
 */
export class PresentacionApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Presentación creada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la presentación',
        type: PresentacionResponseDto,
    })
    data!: PresentacionResponseDto;
}
