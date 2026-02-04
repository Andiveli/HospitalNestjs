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
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { EstiloVidaService } from './estilo-vida.service';
import { EstiloVidaEntity } from './estilo-vida.entity';
import { CreateEstiloVidaDto } from './dto/create-estilo-vida.dto';
import { UpdateEstiloVidaDto } from './dto/update-estilo-vida.dto';
import {
    CreateEstiloVidaApiResponseDto,
    ListEstiloVidaApiResponseDto,
} from './dto/estilo-vida-response.dto';

@ApiTags('Estilos de Vida')
@ApiBearerAuth()
@Controller('estilos-vida')
export class EstiloVidaController {
    constructor(private readonly estiloVidaService: EstiloVidaService) {}

    @Post()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear estilo de vida',
        description: 'Crea un nuevo estilo de vida en el sistema',
    })
    @ApiCreatedResponse({
        description: 'Estilo de vida creado correctamente',
        type: CreateEstiloVidaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'Ya existe un estilo de vida con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async create(
        @Body() dto: CreateEstiloVidaDto,
    ): Promise<CreateEstiloVidaApiResponseDto> {
        const estilo = await this.estiloVidaService.create(dto.nombre);
        return {
            message: 'Estilo de vida creado correctamente',
            data: { id: estilo.id, nombre: estilo.nombre },
        };
    }

    @Get()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar estilos de vida',
        description: 'Retorna todos los estilos de vida registrados',
    })
    @ApiOkResponse({
        description: 'Estilos de vida obtenidos correctamente',
        type: ListEstiloVidaApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findAll(): Promise<ListEstiloVidaApiResponseDto> {
        const estilos = await this.estiloVidaService.findAll();
        return {
            message: 'Estilos de vida obtenidos correctamente',
            data: estilos.map((e: EstiloVidaEntity) => ({
                id: e.id,
                nombre: e.nombre,
            })),
        };
    }

    @Get(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener estilo de vida por ID',
        description: 'Retorna la información de un estilo de vida específico',
    })
    @ApiOkResponse({
        description: 'Estilo de vida obtenido correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Estilo de vida no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del estilo de vida',
        type: Number,
    })
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string; data: { id: number; nombre: string } }> {
        const estilo = await this.estiloVidaService.findById(id);
        return {
            message: 'Estilo de vida obtenido correctamente',
            data: { id: estilo.id, nombre: estilo.nombre },
        };
    }

    @Put(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar estilo de vida',
        description: 'Actualiza el nombre de un estilo de vida existente',
    })
    @ApiOkResponse({
        description: 'Estilo de vida actualizado correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Estilo de vida no encontrado',
    })
    @ApiConflictResponse({
        description: 'Ya existe otro estilo de vida con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del estilo de vida',
        type: Number,
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateEstiloVidaDto,
    ): Promise<{ message: string; data: { id: number; nombre: string } }> {
        const estilo = await this.estiloVidaService.update(id, dto.nombre);
        return {
            message: 'Estilo de vida actualizado correctamente',
            data: { id: estilo.id, nombre: estilo.nombre },
        };
    }

    @Delete(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar estilo de vida',
        description: 'Elimina un estilo de vida del sistema',
    })
    @ApiOkResponse({
        description: 'Estilo de vida eliminado correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Estilo de vida no encontrado',
    })
    @ApiBadRequestResponse({
        description: 'No se puede eliminar - tiene dependencias',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del estilo de vida',
        type: Number,
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.estiloVidaService.delete(id);
        return { message: 'Estilo de vida eliminado correctamente' };
    }
}
