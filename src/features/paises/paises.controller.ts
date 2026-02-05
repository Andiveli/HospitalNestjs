import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { PaisesService } from './paises.service';
import { CreatePaisDto, UpdatePaisDto } from './dto/pais.dto';
import {
    PaisApiResponseDto,
    PaisesListApiResponseDto,
    PaisesEmptyResponseDto,
} from './dto/pais-response.dto';

@ApiTags('Países')
@Controller('paises')
export class PaisesController {
    constructor(private readonly paisesService: PaisesService) {}

    /**
     * Crea un nuevo país
     */
    @Post()
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear país',
        description: 'Crea un nuevo país en el sistema. Solo administradores.',
    })
    @ApiCreatedResponse({
        description: 'País creado exitosamente',
        type: PaisApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'Ya existe un país con ese nombre',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async crear(@Body() dto: CreatePaisDto): Promise<PaisApiResponseDto> {
        const pais = await this.paisesService.crearPais(dto);

        return {
            message: 'País creado exitosamente',
            data: pais,
        };
    }

    /**
     * Lista todos los países
     */
    @Get()
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar países',
        description: 'Obtiene la lista de todos los países registrados.',
    })
    @ApiOkResponse({
        description: 'Países obtenidos exitosamente',
        type: PaisesListApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async listar(): Promise<PaisesListApiResponseDto | PaisesEmptyResponseDto> {
        const paises = await this.paisesService.listarPaises();

        if (paises.length === 0) {
            return { message: 'No hay países registrados' };
        }

        return {
            message: 'Países obtenidos exitosamente',
            data: paises,
        };
    }

    /**
     * Obtiene un país por ID
     */
    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener país por ID',
        description: 'Obtiene los detalles de un país específico.',
    })
    @ApiOkResponse({
        description: 'País obtenido exitosamente',
        type: PaisApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'País no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PaisApiResponseDto> {
        const pais = await this.paisesService.findById(id);

        return {
            message: 'País obtenido exitosamente',
            data: pais,
        };
    }

    /**
     * Actualiza un país
     */
    @Put(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar país',
        description: 'Actualiza un país existente. Solo administradores.',
    })
    @ApiOkResponse({
        description: 'País actualizado exitosamente',
        type: PaisApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiNotFoundResponse({
        description: 'País no encontrado',
    })
    @ApiConflictResponse({
        description: 'Ya existe otro país con ese nombre',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePaisDto,
    ): Promise<PaisApiResponseDto> {
        const pais = await this.paisesService.updatePais(id, dto);

        return {
            message: 'País actualizado exitosamente',
            data: pais,
        };
    }

    /**
     * Elimina un país
     */
    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar país',
        description:
            'Elimina un país del sistema. Solo administradores. ' +
            'No se puede eliminar si tiene dependencias (provincias, ciudades).',
    })
    @ApiOkResponse({
        description: 'País eliminado exitosamente',
    })
    @ApiNotFoundResponse({
        description: 'País no encontrado',
    })
    @ApiBadRequestResponse({
        description: 'No se puede eliminar - el país tiene dependencias',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.paisesService.deletePais(id);

        return {
            message: 'País eliminado exitosamente',
        };
    }
}
