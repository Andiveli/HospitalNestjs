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
import { SangreService } from './sangre.service';
import { GrupoSanguineoEntity } from './sangre.entity';
import { CreateSangreDto } from './dto/create-sangre.dto';
import { UpdateSangreDto } from './dto/create-sangre.dto';
import {
    CreateSangreApiResponseDto,
    ListSangreApiResponseDto,
} from './dto/sangre-response.dto';

@ApiTags('Grupos Sanguíneos')
@ApiBearerAuth()
@Controller('grupos-sanguineos')
export class SangreController {
    constructor(private readonly sangreService: SangreService) {}

    @Post()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear grupo sanguíneo',
        description: 'Crea un nuevo grupo sanguíneo en el sistema',
    })
    @ApiCreatedResponse({
        description: 'Grupo sanguíneo creado correctamente',
        type: CreateSangreApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'Ya existe un grupo sanguíneo con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async create(
        @Body() dto: CreateSangreDto,
    ): Promise<CreateSangreApiResponseDto> {
        const sangre = await this.sangreService.create(dto.nombre);
        return {
            message: 'Grupo sanguíneo creado correctamente',
            data: { id: sangre.id, nombre: sangre.nombre },
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Listar grupos sanguíneos',
        description: 'Retorna todos los grupos sanguíneos registrados',
    })
    @ApiOkResponse({
        description: 'Grupos sanguíneos obtenidos correctamente',
        type: ListSangreApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findAll(): Promise<ListSangreApiResponseDto> {
        const sangres = await this.sangreService.findAll();
        return {
            message: 'Grupos sanguíneos obtenidos correctamente',
            data: sangres.map((s: GrupoSanguineoEntity) => ({
                id: s.id,
                nombre: s.nombre,
            })),
        };
    }

    @Get(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener grupo sanguíneo por ID',
        description: 'Retorna la información de un grupo sanguíneo específico',
    })
    @ApiOkResponse({
        description: 'Grupo sanguíneo obtenido correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Grupo sanguíneo no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del grupo sanguíneo',
        type: Number,
    })
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string; data: { id: number; nombre: string } }> {
        const sangre = await this.sangreService.findById(id);
        return {
            message: 'Grupo sanguíneo obtenido correctamente',
            data: { id: sangre.id, nombre: sangre.nombre },
        };
    }

    @Put(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar grupo sanguíneo',
        description: 'Actualiza el nombre de un grupo sanguíneo existente',
    })
    @ApiOkResponse({
        description: 'Grupo sanguíneo actualizado correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Grupo sanguíneo no encontrado',
    })
    @ApiConflictResponse({
        description: 'Ya existe otro grupo sanguíneo con ese nombre',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del grupo sanguíneo',
        type: Number,
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateSangreDto,
    ): Promise<{ message: string; data: { id: number; nombre: string } }> {
        const sangre = await this.sangreService.update(id, dto.nombre);
        return {
            message: 'Grupo sanguíneo actualizado correctamente',
            data: { id: sangre.id, nombre: sangre.nombre },
        };
    }

    @Delete(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar grupo sanguíneo',
        description: 'Elimina un grupo sanguíneo del sistema',
    })
    @ApiOkResponse({
        description: 'Grupo sanguíneo eliminado correctamente',
    })
    @ApiNotFoundResponse({
        description: 'Grupo sanguíneo no encontrado',
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
        description: 'ID del grupo sanguíneo',
        type: Number,
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.sangreService.delete(id);
        return { message: 'Grupo sanguíneo eliminado correctamente' };
    }
}
