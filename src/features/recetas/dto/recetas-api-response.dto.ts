import { ApiProperty } from '@nestjs/swagger';
import {
    RecetaResponseDto,
    RecetasCitaResponseDto,
} from './receta-response.dto';
import { RecetasPacienteResponseDto } from './recetas-paciente.dto';

/**
 * DTO para respuesta de creación de receta
 */
export class RecetaCreadaResponseDto {
    @ApiProperty({
        example: 'Receta médica creada exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: RecetaResponseDto,
        description: 'Datos de la receta creada',
    })
    data!: RecetaResponseDto;
}

/**
 * DTO para respuesta de receta por registro de atención
 */
export class RecetaByRegistroResponseDto {
    @ApiProperty({
        example: 'Receta médica obtenida exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: RecetasCitaResponseDto,
        description: 'Datos de la receta o indicador si no existe',
    })
    data!: RecetasCitaResponseDto;
}

/**
 * DTO para respuesta de listado de medicamentos
 */
export class MedicamentosListResponseDto {
    @ApiProperty({
        example: 'Medicamentos obtenidos exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: 'array',
        description: 'Lista de medicamentos disponibles',
        example: [
            {
                id: 1,
                nombre: 'Paracetamol',
                principioActivo: 'Paracetamol',
                concentracion: '500mg',
                presentacion: 'Tabletas',
            },
        ],
    })
    data!: Array<{
        id: number;
        nombre: string;
        principioActivo: string;
        concentracion?: string;
        presentacion: string;
    }>;
}

/**
 * DTO para respuesta de listado de vías de administración
 */
export class ViasAdministracionListResponseDto {
    @ApiProperty({
        example: 'Vías de administración obtenidas exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: 'array',
        description: 'Lista de vías de administración',
        example: [{ id: 1, nombre: 'Oral' }],
    })
    data!: Array<{ id: number; nombre: string }>;
}

/**
 * DTO para respuesta de listado de unidades de medida
 */
export class UnidadesMedidaListResponseDto {
    @ApiProperty({
        example: 'Unidades de medida obtenidas exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: 'array',
        description: 'Lista de unidades de medida',
        example: [{ id: 1, nombre: 'Tableta' }],
    })
    data!: Array<{ id: number; nombre: string }>;
}

/**
 * DTO para respuesta de recetas del paciente
 */
export class MisRecetasResponseDto {
    @ApiProperty({
        example: 'Recetas médicas obtenidas exitosamente',
        description: 'Mensaje de la operación',
    })
    message!: string;

    @ApiProperty({
        type: RecetasPacienteResponseDto,
        description: 'Datos de las recetas del paciente',
    })
    data!: RecetasPacienteResponseDto;
}
