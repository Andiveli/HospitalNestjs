import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiParam,
} from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { EnfermedadDto } from './dto/enfermedad.dto';
import {
    EnfermedadResponseDto,
    EnfermedadCreatedResponseDto,
    EnfermedadUpdatedResponseDto,
    EnfermedadSingleResponseDto,
    EnfermedadesListResponseDto,
    EnfermedadesEmptyResponseDto,
} from './dto/enfermedad-response.dto';
import { EnfermedadesService } from './enfermedades.service';

/**
 * Controlador para gestionar enfermedades del catálogo médico
 * Solo administradores pueden crear/modificar enfermedades
 * Todos los usuarios autenticados pueden consultar el catálogo
 */
@ApiTags('Enfermedades')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('enfermedades')
export class EnfermedadesController {
    constructor(private readonly enfermedadesService: EnfermedadesService) {}

    /**
     * Crea una nueva enfermedad en el catálogo
     * Solo administradores
     */
    @Post('addEnfermedad')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear nueva enfermedad',
        description:
            'Crea una nueva enfermedad en el catálogo médico. ' +
            'Solo administradores pueden crear enfermedades. ' +
            'El nombre debe ser único.',
    })
    @ApiCreatedResponse({
        description: 'Enfermedad creada exitosamente',
        type: EnfermedadCreatedResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos - nombre vacío o formato incorrecto',
    })
    @ApiConflictResponse({
        description: 'La enfermedad con ese nombre ya existe',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async addEnfermedad(
        @Body() body: EnfermedadDto,
    ): Promise<EnfermedadCreatedResponseDto> {
        const enfermedad = await this.enfermedadesService.addEnfermedad(body);
        return {
            message: 'Enfermedad creada exitosamente',
            data: this.mapToResponseDto(enfermedad),
        };
    }

    /**
     * Obtiene todas las enfermedades del catálogo
     * Accesible para todos los usuarios autenticados
     */
    @Get('listEnfermedades')
    @Roles(Rol.Admin, Rol.Medico, Rol.Paciente)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar todas las enfermedades',
        description:
            'Obtiene el listado completo de enfermedades del catálogo médico. ' +
            'Accesible para todos los usuarios autenticados.',
    })
    @ApiOkResponse({
        description: 'Listado de enfermedades obtenido exitosamente',
        type: EnfermedadesListResponseDto,
    })
    @ApiOkResponse({
        description: 'No hay enfermedades registradas',
        type: EnfermedadesEmptyResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getEnfermedades(): Promise<
        EnfermedadesListResponseDto | EnfermedadesEmptyResponseDto
    > {
        const enfermedades = await this.enfermedadesService.getEnfermedades();

        if (enfermedades.length === 0) {
            return {
                message: 'No hay enfermedades registradas',
                data: [],
            };
        }

        return {
            message: 'Enfermedades obtenidas exitosamente',
            data: enfermedades.map((e) => this.mapToResponseDto(e)),
        };
    }

    /**
     * Obtiene una enfermedad específica por ID
     * Accesible para todos los usuarios autenticados
     */
    @Get('enfermedad/:id')
    @Roles(Rol.Admin, Rol.Medico, Rol.Paciente)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener enfermedad por ID',
        description:
            'Obtiene los detalles de una enfermedad específica por su ID. ' +
            'Accesible para todos los usuarios autenticados.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la enfermedad',
        example: 1,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Enfermedad encontrada',
        type: EnfermedadSingleResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Enfermedad no encontrada',
    })
    @ApiBadRequestResponse({
        description: 'ID inválido',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getEnfermedad(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<EnfermedadSingleResponseDto> {
        const enfermedad = await this.enfermedadesService.getEnfermedad(id);
        return {
            message: 'Enfermedad obtenida exitosamente',
            data: this.mapToResponseDto(enfermedad),
        };
    }

    /**
     * Actualiza una enfermedad existente
     * Solo administradores
     */
    @Patch('enfermedad/:id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar enfermedad',
        description:
            'Actualiza los datos de una enfermedad existente. ' +
            'Solo administradores pueden modificar enfermedades.',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la enfermedad a actualizar',
        example: 1,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Enfermedad actualizada exitosamente',
        type: EnfermedadUpdatedResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Enfermedad no encontrada',
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'El nuevo nombre ya existe en otra enfermedad',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async updateEnfermedad(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: Partial<EnfermedadDto>,
    ): Promise<EnfermedadUpdatedResponseDto> {
        const enfermedad = await this.enfermedadesService.updateEnfermedad(
            id,
            body,
        );
        return {
            message: 'Enfermedad actualizada exitosamente',
            data: this.mapToResponseDto(enfermedad),
        };
    }

    /**
     * Helper para mapear entidad a DTO de respuesta
     */
    private mapToResponseDto(enfermedad: {
        id: number;
        nombre: string;
        descripcion: string | null;
    }): EnfermedadResponseDto {
        return {
            id: enfermedad.id,
            nombre: enfermedad.nombre,
            descripcion: enfermedad.descripcion,
        };
    }
}
