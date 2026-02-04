import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Request,
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
import { RolesGuard } from '../../roles/roles.guard';
import { Roles } from '../../roles/roles.decorator';
import { Rol } from '../../roles/roles.enum';
import UserRequest from '../../people/people.request';
import { ExcepcionesHorarioService } from '../services/excepciones-horario.service';
import { CreateExcepcionDto, UpdateExcepcionDto } from '../dto';
import {
    ExcepcionApiResponseDto,
    ExcepcionesListApiResponseDto,
    ExcepcionesPorMedicoResponseDto,
} from '../dto/excepcion-response.dto';

@ApiTags('Excepciones de Horario')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('excepciones-horario')
export class ExcepcionesHorarioController {
    constructor(
        private readonly excepcionesService: ExcepcionesHorarioService,
    ) {}

    // ==================== ENDPOINTS PARA MÉDICOS ====================

    @Post('medico')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Crear excepción de horario',
        description:
            'Crea una nueva excepción de horario para el médico autenticado. ' +
            'Permite bloquear un día completo (sin horas) o definir un horario especial.',
    })
    @ApiCreatedResponse({
        description: 'Excepción creada exitosamente',
        type: ExcepcionApiResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos inválidos, fecha pasada, o rango de horas incorrecto',
    })
    @ApiConflictResponse({
        description: 'Ya existe una excepción para esa fecha',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de médico',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async create(
        @Body() dto: CreateExcepcionDto,
        @Request() req: UserRequest,
    ): Promise<ExcepcionApiResponseDto> {
        const medicoId = req.user.id;
        const excepcion = await this.excepcionesService.create(dto, medicoId);

        return {
            message: 'Excepción creada exitosamente',
            data: excepcion,
        };
    }

    @Get('medico/mis-excepciones')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Listar mis excepciones',
        description:
            'Obtiene todas las excepciones de horario del médico autenticado.',
    })
    @ApiOkResponse({
        description: 'Excepciones obtenidas exitosamente',
        type: ExcepcionesListApiResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de médico',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findMisExcepciones(
        @Request() req: UserRequest,
    ): Promise<ExcepcionesListApiResponseDto> {
        const medicoId = req.user.id;
        const excepciones =
            await this.excepcionesService.findByMedico(medicoId);

        return {
            message: 'Excepciones obtenidas exitosamente',
            data: excepciones,
        };
    }

    @Get('medico/mis-excepciones/futuras')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Listar excepciones futuras',
        description:
            'Obtiene las excepciones de horario del médico desde hoy en adelante.',
    })
    @ApiOkResponse({
        description: 'Excepciones futuras obtenidas exitosamente',
        type: ExcepcionesListApiResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de médico',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findMisExcepcionesFuturas(
        @Request() req: UserRequest,
    ): Promise<ExcepcionesListApiResponseDto> {
        const medicoId = req.user.id;
        const excepciones =
            await this.excepcionesService.findFuturasByMedico(medicoId);

        return {
            message: 'Excepciones futuras obtenidas exitosamente',
            data: excepciones,
        };
    }

    @Put('medico/:id')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Actualizar excepción',
        description: 'Actualiza una excepción de horario existente del médico.',
    })
    @ApiOkResponse({
        description: 'Excepción actualizada exitosamente',
        type: ExcepcionApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o fecha pasada',
    })
    @ApiNotFoundResponse({
        description: 'Excepción no encontrada',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permiso para modificar esta excepción',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() dto: UpdateExcepcionDto,
        @Request() req: UserRequest,
    ): Promise<ExcepcionApiResponseDto> {
        const medicoId = req.user.id;
        const excepcion = await this.excepcionesService.update(
            id,
            dto,
            medicoId,
        );

        return {
            message: 'Excepción actualizada exitosamente',
            data: excepcion,
        };
    }

    @Delete('medico/:id')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Eliminar excepción',
        description: 'Elimina una excepción de horario del médico.',
    })
    @ApiOkResponse({
        description: 'Excepción eliminada exitosamente',
    })
    @ApiNotFoundResponse({
        description: 'Excepción no encontrada',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permiso para eliminar esta excepción',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<{ message: string }> {
        const medicoId = req.user.id;
        await this.excepcionesService.delete(id, medicoId);

        return {
            message: 'Excepción eliminada exitosamente',
        };
    }

    // ==================== ENDPOINTS PARA ADMIN ====================

    @Get('admin/todas')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Ver todas las excepciones (Admin)',
        description:
            'Obtiene todas las excepciones de horario de todos los médicos, ' +
            'agrupadas por médico. Solo administradores.',
    })
    @ApiOkResponse({
        description: 'Excepciones obtenidas exitosamente',
        type: ExcepcionesPorMedicoResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findAllAdmin(): Promise<ExcepcionesPorMedicoResponseDto> {
        const resultado = await this.excepcionesService.findAll();

        return {
            message: 'Excepciones por médico obtenidas exitosamente',
            data: resultado,
        };
    }

    @Get('admin/medico/:medicoId')
    @Roles(Rol.Admin)
    @ApiOperation({
        summary: 'Ver excepciones de un médico específico (Admin)',
        description:
            'Obtiene todas las excepciones de horario de un médico específico. ' +
            'Solo administradores.',
    })
    @ApiOkResponse({
        description: 'Excepciones del médico obtenidas exitosamente',
        type: ExcepcionesPorMedicoResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos de administrador',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findByMedicoAdmin(
        @Param('medicoId', ParseIntPipe) medicoId: number,
    ): Promise<ExcepcionesPorMedicoResponseDto> {
        const resultado =
            await this.excepcionesService.findByMedicoIdAdmin(medicoId);

        return {
            message: 'Excepciones del médico obtenidas exitosamente',
            data: [resultado],
        };
    }
}
