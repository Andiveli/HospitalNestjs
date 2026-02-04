import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import {
    CreateEspecialidadResponseDto,
    GetEspecialidadesResponseDto,
} from './dto/especialidad-response.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { EspecialidadService } from './especialidad.service';

/**
 * Controlador para gestionar especialidades médicas
 * Maneja operaciones CRUD para especialidades médicas
 */
@ApiTags('Especialidades')
@Controller('especialidades')
export class EspecialidadController {
    /**
     * Constructor del controlador de especialidades
     * @param especialidadService Servicio de especialidades
     */
    constructor(private readonly especialidadService: EspecialidadService) {}

    @Post()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear una nueva especialidad médica',
        description:
            'Crea una nueva especialidad con nombre y descripción opcional',
    })
    @ApiCreatedResponse({
        description: 'Especialidad creada correctamente',
        type: CreateEspecialidadResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Solicitud inválida - Datos incorrectos',
    })
    @ApiConflictResponse({
        description: 'Ya existe una especialidad con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    /**
     * Crea una nueva especialidad médica
     * @param createDto Datos para crear la especialidad
     * @returns Respuesta con la especialidad creada
     */
    async createEspecialidad(
        @Body() createDto: CreateEspecialidadDto,
    ): Promise<CreateEspecialidadResponseDto> {
        return await this.especialidadService.createEspecialidad(createDto);
    }

    @Get()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener lista de especialidades',
        description: 'Retorna todas las especialidades médicas disponibles',
    })
    @ApiOkResponse({
        description: 'Especialidades recuperadas correctamente',
        type: GetEspecialidadesResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (por defecto: 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Límite de resultados por página (por defecto: 10)',
    })

    /**
     * Obtiene una lista paginada de especialidades médicas
     * @param page Número de página (opcional, por defecto 1)
     * @param limit Límite de resultados por página (opcional, por defecto 10)
     * @returns Lista paginada de especialidades
     */
    async getEspecialidades(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<GetEspecialidadesResponseDto> {
        return await this.especialidadService.getEspecialidades(
            page ?? 1,
            limit ?? 10,
        );
    }

    @Get(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener especialidad por ID',
        description: 'Retorna la información de una especialidad específica',
    })
    @ApiOkResponse({
        description: 'Especialidad recuperada correctamente',
        type: CreateEspecialidadResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Especialidad no encontrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la especialidad',
        type: Number,
    })
    /**
     * Obtiene una especialidad médica por su ID
     * @param id ID de la especialidad
     * @returns Información de la especialidad
     */
    async getEspecialidadById(
        @Param('id') id: number,
    ): Promise<CreateEspecialidadResponseDto> {
        return await this.especialidadService.getEspecialidadById(id);
    }

    @Put(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar especialidad',
        description: 'Actualiza el nombre y/o descripción de una especialidad',
    })
    @ApiOkResponse({
        description: 'Especialidad actualizada correctamente',
        type: CreateEspecialidadResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Especialidad no encontrada',
    })
    @ApiConflictResponse({
        description: 'Ya existe una especialidad con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la especialidad',
        type: Number,
    })
    /**
     * Actualiza una especialidad médica existente
     * @param id ID de la especialidad a actualizar
     * @param updateDto Datos a actualizar
     * @returns Especialidad actualizada
     */
    async updateEspecialidad(
        @Param('id') id: number,
        @Body() updateDto: UpdateEspecialidadDto,
    ): Promise<CreateEspecialidadResponseDto> {
        return await this.especialidadService.updateEspecialidad(id, updateDto);
    }

    @Delete(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar especialidad',
        description:
            'Elimina una especialidad médica del sistema (soft delete)',
    })
    @ApiOkResponse({
        description: 'Especialidad eliminada correctamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Especialidad eliminada correctamente',
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Especialidad no encontrada',
    })
    @ApiBadRequestResponse({
        description: 'La especialidad ya se encuentra inactiva',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID de la especialidad',
        type: Number,
    })
    /**
     * Elimina una especialidad médica del sistema
     * @param id ID de la especialidad a eliminar
     * @returns Mensaje de confirmación
     */
    async deleteEspecialidad(
        @Param('id') id: number,
    ): Promise<{ message: string }> {
        return await this.especialidadService.deleteEspecialidad(id);
    }
}
