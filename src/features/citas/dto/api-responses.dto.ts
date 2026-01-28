import { ApiProperty } from '@nestjs/swagger';
import { CitaResponseDto } from './cita-response.dto';
import { CitaDetalladaResponseDto } from './cita-detallada-response.dto';
import { MedicoDisponibleDto } from './medico-disponible.dto';
import {
    DisponibilidadResponseDto,
    SlotDisponibleDto,
} from './disponibilidad.dto';
import { DiasAtencionResponseDto } from './dias-atencion.dto';

// ============================================
// Base Response DTOs
// ============================================

/**
 * Metadata de paginación
 */
export class PaginationMetaDto {
    @ApiProperty({ example: 50, description: 'Total de registros' })
    total!: number;

    @ApiProperty({ example: 1, description: 'Página actual' })
    page!: number;

    @ApiProperty({ example: 10, description: 'Registros por página' })
    limit!: number;

    @ApiProperty({ example: 5, description: 'Total de páginas' })
    totalPages!: number;
}

// ============================================
// Citas Responses
// ============================================

/**
 * Respuesta para crear/actualizar una cita
 */
export class CitaApiResponseDto {
    @ApiProperty({
        example: 'Cita creada exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: CitaResponseDto,
        description: 'Datos de la cita',
    })
    data!: CitaResponseDto;
}

/**
 * Respuesta para listar citas (array)
 */
export class CitasListApiResponseDto {
    @ApiProperty({
        example: 'Próximas citas obtenidas exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: [CitaResponseDto],
        description: 'Lista de citas',
    })
    data!: CitaResponseDto[];
}

/**
 * Respuesta para listar citas con paginación
 */
export class CitasPaginadasApiResponseDto {
    @ApiProperty({
        example: 'Citas pendientes obtenidas exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: [CitaResponseDto],
        description: 'Lista de citas',
    })
    data!: CitaResponseDto[];

    @ApiProperty({
        type: PaginationMetaDto,
        description: 'Información de paginación',
    })
    meta!: PaginationMetaDto;
}

/**
 * Respuesta para detalle de una cita
 */
export class CitaDetalladaApiResponseDto {
    @ApiProperty({
        example: 'Cita obtenida exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: CitaDetalladaResponseDto,
        description: 'Datos detallados de la cita',
    })
    data!: CitaDetalladaResponseDto;
}

/**
 * Respuesta para cancelar una cita
 */
export class CitaCanceladaApiResponseDto {
    @ApiProperty({
        example: 'Cita del 15/2/2024 cancelada exitosamente',
        description: 'Mensaje de confirmación',
    })
    message!: string;
}

// ============================================
// Médicos Responses
// ============================================

/**
 * Respuesta para listar médicos disponibles
 */
export class MedicosDisponiblesApiResponseDto {
    @ApiProperty({
        example: 'Médicos obtenidos exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: [MedicoDisponibleDto],
        description: 'Lista de médicos disponibles',
    })
    data!: MedicoDisponibleDto[];
}

/**
 * Respuesta para días de atención de un médico
 */
export class DiasAtencionApiResponseDto {
    @ApiProperty({
        example: 'Días de atención obtenidos exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: DiasAtencionResponseDto,
        description: 'Días de atención del médico',
    })
    data!: DiasAtencionResponseDto;
}

/**
 * Respuesta para disponibilidad de un médico
 */
export class DisponibilidadApiResponseDto {
    @ApiProperty({
        example: 'Disponibilidad obtenida exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: DisponibilidadResponseDto,
        description: 'Slots disponibles del médico',
    })
    data!: DisponibilidadResponseDto;
}

// Re-export para que el controller pueda importar todo desde un lugar
export { SlotDisponibleDto };
