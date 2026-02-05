import {
    Body,
    Controller,
    Delete,
    Get,
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
import { MedicamentosService } from './medicamentos.service';
import { CreateMedicamentoDto, UpdateMedicamentoDto } from './dto';
import {
    CreatePresentacionDto,
    UpdatePresentacionDto,
} from './dto/presentacion.dto';
import {
    MedicamentoApiResponseDto,
    MedicamentosListApiResponseDto,
    PresentacionesListApiResponseDto,
    PresentacionApiResponseDto,
} from './dto/medicamento-response.dto';

@ApiTags('Medicamentos')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('medicamentos')
export class MedicamentosController {
    constructor(private readonly medicamentosService: MedicamentosService) {}

    // ==================== PRESENTACIONES ====================

    @Post('presentaciones')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Crear presentación',
        description:
            'Crea una nueva presentación de medicamento (ej: Comprimidos, Cápsulas, Jarabe). ' +
            'Solo administradores.',
    })
    @ApiCreatedResponse({
        description: 'Presentación creada exitosamente',
        type: PresentacionApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'Ya existe una presentación con ese nombre',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async createPresentacion(
        @Body() dto: CreatePresentacionDto,
    ): Promise<PresentacionApiResponseDto> {
        const presentacion =
            await this.medicamentosService.createPresentacion(dto);

        return {
            message: 'Presentación creada exitosamente',
            data: presentacion,
        };
    }

    @Get('presentaciones')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Listar presentaciones',
        description:
            'Obtiene todas las presentaciones de medicamentos disponibles.',
    })
    @ApiOkResponse({
        description: 'Presentaciones obtenidas exitosamente',
        type: PresentacionesListApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findAllPresentaciones(): Promise<PresentacionesListApiResponseDto> {
        const presentaciones =
            await this.medicamentosService.findAllPresentaciones();

        return {
            message: 'Presentaciones obtenidas exitosamente',
            data: presentaciones,
        };
    }

    @Get('presentaciones/:id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Obtener presentación por ID',
        description: 'Obtiene los detalles de una presentación específica.',
    })
    @ApiOkResponse({
        description: 'Presentación obtenida exitosamente',
        type: PresentacionApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Presentación no encontrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findPresentacionById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PresentacionApiResponseDto> {
        const presentacion =
            await this.medicamentosService.findPresentacionById(id);

        return {
            message: 'Presentación obtenida exitosamente',
            data: presentacion,
        };
    }

    @Put('presentaciones/:id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Actualizar presentación',
        description:
            'Actualiza una presentación de medicamento existente. Solo administradores.',
    })
    @ApiOkResponse({
        description: 'Presentación actualizada exitosamente',
        type: PresentacionApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiNotFoundResponse({
        description: 'Presentación no encontrada',
    })
    @ApiConflictResponse({
        description: 'Ya existe otra presentación con ese nombre',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async updatePresentacion(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdatePresentacionDto,
    ): Promise<PresentacionApiResponseDto> {
        const presentacion = await this.medicamentosService.updatePresentacion(
            id,
            dto,
        );

        return {
            message: 'Presentación actualizada exitosamente',
            data: presentacion,
        };
    }

    @Delete('presentaciones/:id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Eliminar presentación',
        description:
            'Elimina una presentación de medicamento. Solo administradores. ' +
            'No se puede eliminar si hay medicamentos usándola.',
    })
    @ApiOkResponse({
        description: 'Presentación eliminada exitosamente',
    })
    @ApiNotFoundResponse({
        description: 'Presentación no encontrada',
    })
    @ApiBadRequestResponse({
        description:
            'No se puede eliminar - la presentación tiene dependencias',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async deletePresentacion(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<{ message: string }> {
        await this.medicamentosService.deletePresentacion(id);

        return {
            message: 'Presentación eliminada exitosamente',
        };
    }

    //====================Médicamentos====================

    @Post()
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Crear medicamento',
        description:
            'Crea un nuevo medicamento en el catálogo. Solo administradores.',
    })
    @ApiCreatedResponse({
        description: 'Medicamento creado exitosamente',
        type: MedicamentoApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o presentación no existe',
    })
    @ApiConflictResponse({
        description:
            'Ya existe un medicamento con ese nombre y principio activo',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async create(
        @Body() dto: CreateMedicamentoDto,
    ): Promise<MedicamentoApiResponseDto> {
        const medicamento = await this.medicamentosService.create(dto);

        return {
            message: 'Medicamento creado exitosamente',
            data: medicamento,
        };
    }

    @Get()
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Listar todos los medicamentos',
        description: 'Obtiene la lista completa de medicamentos disponibles.',
    })
    @ApiOkResponse({
        description: 'Medicamentos obtenidos exitosamente',
        type: MedicamentosListApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findAll(): Promise<MedicamentosListApiResponseDto> {
        const medicamentos = await this.medicamentosService.findAll();

        return {
            message: 'Medicamentos obtenidos exitosamente',
            data: medicamentos,
        };
    }

    @Get(':id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Obtener medicamento por ID',
        description: 'Obtiene los detalles de un medicamento específico.',
    })
    @ApiOkResponse({
        description: 'Medicamento obtenido exitosamente',
        type: MedicamentoApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Medicamento no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<MedicamentoApiResponseDto> {
        const medicamento = await this.medicamentosService.findById(id);

        return {
            message: 'Medicamento obtenido exitosamente',
            data: medicamento,
        };
    }

    @Put(':id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Actualizar medicamento',
        description:
            'Actualiza un medicamento existente. Solo administradores.',
    })
    @ApiOkResponse({
        description: 'Medicamento actualizado exitosamente',
        type: MedicamentoApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o presentación no existe',
    })
    @ApiNotFoundResponse({
        description: 'Medicamento no encontrado',
    })
    @ApiConflictResponse({
        description:
            'Ya existe otro medicamento con ese nombre y principio activo',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateMedicamentoDto,
    ): Promise<MedicamentoApiResponseDto> {
        const medicamento = await this.medicamentosService.update(id, dto);

        return {
            message: 'Medicamento actualizado exitosamente',
            data: medicamento,
        };
    }

    @Delete(':id')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Eliminar medicamento',
        description:
            'Elimina un medicamento del catálogo. Solo administradores.',
    })
    @ApiOkResponse({
        description: 'Medicamento eliminado exitosamente',
    })
    @ApiNotFoundResponse({
        description: 'Medicamento no encontrado',
    })
    @ApiBadRequestResponse({
        description: 'No se puede eliminar - el medicamento tiene dependencias',
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
        await this.medicamentosService.delete(id);

        return {
            message: 'Medicamento eliminado exitosamente',
        };
    }
}
