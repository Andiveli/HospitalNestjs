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
    MedicamentoApiResponseDto,
    MedicamentosListApiResponseDto,
    PresentacionesListApiResponseDto,
} from './dto/medicamento-response.dto';

@ApiTags('Medicamentos')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('medicamentos')
export class MedicamentosController {
    constructor(private readonly medicamentosService: MedicamentosService) {}

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
