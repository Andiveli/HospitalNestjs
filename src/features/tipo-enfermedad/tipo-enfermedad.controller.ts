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
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import {
    CreateTipoEnfermedadDto,
    TipoEnfermedadResponseDto,
    TiposEnfermedadListResponseDto,
    UpdateTipoEnfermedadDto,
} from './dto';
import { TipoEnfermedadService } from './tipo-enfermedad.service';

/**
 * Controlador para gestionar tipos de enfermedad
 * Maneja operaciones CRUD para tipos de enfermedad
 */
@ApiTags('Tipos de Enfermedad')
@Controller('tipo-enfermedad')
export class TipoEnfermedadController {
    constructor(private readonly tipoService: TipoEnfermedadService) {}

    @Post()
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear un nuevo tipo de enfermedad',
        description: 'Crea un nuevo tipo de enfermedad en el sistema',
    })
    @ApiCreatedResponse({
        description: 'Tipo de enfermedad creado correctamente',
        type: TipoEnfermedadResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Solicitud inválida - Datos incorrectos',
    })
    @ApiConflictResponse({
        description: 'Ya existe un tipo de enfermedad con ese nombre',
    })
    async createTipoEnfermedad(
        @Body() createDto: CreateTipoEnfermedadDto,
    ): Promise<TipoEnfermedadResponseDto> {
        return await this.tipoService.createTipoEnfermedad(createDto);
    }

    @Get()
    @Roles(Rol.Medico, Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener lista de tipos de enfermedad',
        description: 'Retorna todos los tipos de enfermedad registrados',
    })
    @ApiOkResponse({
        description: 'Lista de tipos de enfermedad recuperada correctamente',
        type: TiposEnfermedadListResponseDto,
    })
    async getTiposEnfermedad(): Promise<TiposEnfermedadListResponseDto> {
        return await this.tipoService.getTiposEnfermedad();
    }

    @Get(':id')
    @Roles(Rol.Medico, Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener tipo de enfermedad por ID',
        description:
            'Retorna la información de un tipo de enfermedad específico',
    })
    @ApiOkResponse({
        description: 'Tipo de enfermedad recuperado correctamente',
        type: TipoEnfermedadResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Tipo de enfermedad no encontrado',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del tipo de enfermedad',
        type: Number,
    })
    async getTipoEnfermedadById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<TipoEnfermedadResponseDto> {
        return await this.tipoService.getTipoEnfermedadById(id);
    }

    @Patch(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar tipo de enfermedad',
        description: 'Actualiza el nombre de un tipo de enfermedad existente',
    })
    @ApiOkResponse({
        description: 'Tipo de enfermedad actualizado correctamente',
        type: TipoEnfermedadResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Tipo de enfermedad no encontrado',
    })
    @ApiBadRequestResponse({
        description: 'Solicitud inválida - Datos incorrectos',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del tipo de enfermedad',
        type: Number,
    })
    async updateTipoEnfermedad(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDto: UpdateTipoEnfermedadDto,
    ): Promise<TipoEnfermedadResponseDto> {
        return await this.tipoService.updateTipoEnfermedad(id, updateDto);
    }
}
