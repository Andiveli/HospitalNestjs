import { CacheTTL } from '@nestjs/cache-manager';
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
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
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserScopedCacheInterceptor } from 'src/common/interceptors/user-scoped-cache.interceptor';
import UserRequest from 'src/features/people/people.request';
import { Roles } from 'src/features/roles/roles.decorator';
import { Rol } from 'src/features/roles/roles.enum';
import { RolesGuard } from 'src/features/roles/roles.guard';
import {
    BadRequestErrorResponseDto,
    ConflictErrorResponseDto,
    ForbiddenErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from '../dto/api-error-responses.dto';
import {
    CitaApiResponseDto,
    CitaCanceladaApiResponseDto,
    CitaDetalladaApiResponseDto,
    CitasListApiResponseDto,
    CitasPaginadasApiResponseDto,
} from '../dto/api-responses.dto';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { PaginationDto } from '../dto/pagination.dto';
import { UpdateCitaDto } from '../dto/update-cita.dto';
import { CitasService } from '../services';
import { CitasCacheService } from '../services/citas-cache.service';

@ApiTags('Citas - Paciente')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Rol.Paciente)
@Controller('citas/paciente')
export class CitasPacienteController {
    constructor(
        private readonly citasService: CitasService,
        private readonly citasCacheService: CitasCacheService,
    ) {}

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva cita médica',
        description:
            'Crea una nueva cita médica para el paciente autenticado. ' +
            'Valida que el médico exista, que no haya conflictos de horario ' +
            'y que la fecha sea futura. La duración es automáticamente 30 minutos.',
    })
    @ApiCreatedResponse({
        description: 'Cita creada exitosamente',
        type: CitaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o fecha en el pasado',
        type: BadRequestErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Conflicto de horario con otra cita',
        type: ConflictErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
        type: NotFoundErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para crear citas',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async createCita(
        @Body() createCitaDto: CreateCitaDto,
        @Request() req: UserRequest,
    ): Promise<CitaApiResponseDto> {
        const pacienteId = req.user.id;
        const cita = await this.citasService.createCita(
            createCitaDto,
            pacienteId,
        );

        // Invalidar caché del paciente, médico y disponibilidad
        const fecha = new Date(cita.fechaHoraInicio)
            .toISOString()
            .split('T')[0];
        await this.citasCacheService.invalidateOnCitaCreated(
            pacienteId,
            cita.medico.id,
            fecha,
        );

        return {
            message: 'Cita creada exitosamente',
            data: cita,
        };
    }

    @Get('proximas')
    @UseInterceptors(UserScopedCacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Obtener las próximas citas del paciente',
        description:
            'Devuelve las próximas 3 citas pendientes del paciente autenticado, ' +
            'ordenadas por fecha de inicio ascendente (la más cercana primero).',
    })
    @ApiOkResponse({
        description: 'Próximas citas obtenidas exitosamente',
        type: CitasListApiResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a este recurso',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getProximasCitas(
        @Request() req: UserRequest,
    ): Promise<CitasListApiResponseDto> {
        const pacienteId = req.user.id;
        const citas = await this.citasService.getProximasCitas(pacienteId);

        return {
            message:
                citas.length > 0
                    ? 'Próximas citas obtenidas exitosamente'
                    : 'No tienes citas próximas',
            data: citas,
        };
    }

    @Get('recientes')
    @UseInterceptors(UserScopedCacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Obtener citas atendidas recientes',
        description:
            'Devuelve las últimas 4 citas atendidas del paciente autenticado, ' +
            'ordenadas por fecha de inicio descendente (las más recientes primero).',
    })
    @ApiOkResponse({
        description: 'Citas atendidas recientes obtenidas exitosamente',
        type: CitasListApiResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a este recurso',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getRecientesCitasAtendidas(
        @Request() req: UserRequest,
    ): Promise<CitasListApiResponseDto> {
        const pacienteId = req.user.id;
        const citas =
            await this.citasService.getRecientesCitasAtendidas(pacienteId);

        return {
            message:
                citas.length > 0
                    ? 'Citas atendidas recientes obtenidas exitosamente'
                    : 'No tienes citas atendidas recientes',
            data: citas,
        };
    }

    @Get('pendientes')
    @UseInterceptors(UserScopedCacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Listar todas las citas pendientes',
        description:
            'Devuelve todas las citas pendientes del paciente autenticado ' +
            'con soporte de paginación.',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (default: 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Registros por página (default: 10, max: 100)',
        example: 10,
    })
    @ApiOkResponse({
        description: 'Citas pendientes obtenidas exitosamente',
        type: CitasPaginadasApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Parámetros de paginación inválidos',
        type: BadRequestErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a este recurso',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getAllCitasPendientes(
        @Request() req: UserRequest,
        @Query() paginationDto: PaginationDto,
    ): Promise<CitasPaginadasApiResponseDto> {
        const pacienteId = req.user.id;
        const { page = 1, limit = 10 } = paginationDto;

        const result = await this.citasService.getAllCitasPendientes(
            pacienteId,
            page,
            limit,
        );

        return {
            message:
                result.data.length > 0
                    ? 'Citas pendientes obtenidas exitosamente'
                    : 'No tienes citas pendientes',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('atendidas')
    @UseInterceptors(UserScopedCacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Listar todas las citas atendidas',
        description:
            'Devuelve todas las citas atendidas del paciente autenticado ' +
            'con soporte de paginación.',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (default: 1)',
        example: 1,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Registros por página (default: 10, max: 100)',
        example: 10,
    })
    @ApiOkResponse({
        description: 'Citas atendidas obtenidas exitosamente',
        type: CitasPaginadasApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Parámetros de paginación inválidos',
        type: BadRequestErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a este recurso',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getAllCitasAtendidas(
        @Request() req: UserRequest,
        @Query() paginationDto: PaginationDto,
    ): Promise<CitasPaginadasApiResponseDto> {
        const pacienteId = req.user.id;
        const { page = 1, limit = 10 } = paginationDto;

        const result = await this.citasService.getAllCitasAtendidas(
            pacienteId,
            page,
            limit,
        );

        return {
            message:
                result.data.length > 0
                    ? 'Citas atendidas obtenidas exitosamente'
                    : 'No tienes citas atendidas',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get(':id')
    @UseInterceptors(UserScopedCacheInterceptor)
    @CacheTTL(600000)
    @ApiOperation({
        summary: 'Obtener detalle de una cita específica',
        description:
            'Devuelve toda la información de una cita específica del paciente autenticado. ' +
            'Incluye diagnóstico, observaciones, recetas y derivaciones si la cita ya fue atendida.',
    })
    @ApiOkResponse({
        description: 'Cita obtenida exitosamente',
        type: CitaDetalladaApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        type: NotFoundErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a esta cita',
        type: ForbiddenErrorResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'ID inválido',
        type: BadRequestErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getCitaById(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<CitaDetalladaApiResponseDto> {
        const pacienteId = req.user.id;
        const cita = await this.citasService.getCitaById(id, pacienteId);

        return {
            message: 'Cita obtenida exitosamente',
            data: cita,
        };
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Actualizar una cita existente',
        description:
            'Actualiza la fecha/hora y/o el modo telefónico de una cita pendiente. ' +
            'Solo se pueden modificar citas con estado "pendiente" y ' +
            'con al menos 72 horas de anticipación.',
    })
    @ApiOkResponse({
        description: 'Cita actualizada exitosamente',
        type: CitaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos, cita no modificable o fuera del plazo',
        type: BadRequestErrorResponseDto,
    })
    @ApiConflictResponse({
        description: 'Conflicto de horario con otra cita',
        type: ConflictErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        type: NotFoundErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para modificar esta cita',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async updateCita(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCitaDto: UpdateCitaDto,
        @Request() req: UserRequest,
    ): Promise<CitaApiResponseDto> {
        const pacienteId = req.user.id;
        const { cita, cacheMetadata } = await this.citasService.updateCita(
            id,
            updateCitaDto,
            pacienteId,
        );

        // Invalidar caché del paciente, médico y disponibilidad (fecha anterior y nueva)
        await this.citasCacheService.invalidateOnCitaUpdated(
            pacienteId,
            cacheMetadata.medicoId,
            id,
            cacheMetadata.fechaAnterior,
            cacheMetadata.fechaNueva,
        );

        return {
            message: 'Cita actualizada exitosamente',
            data: cita,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Cancelar una cita',
        description:
            'Cancela (soft delete) una cita pendiente del paciente autenticado. ' +
            'Solo se pueden cancelar citas con estado "pendiente" y ' +
            'con al menos 72 horas de anticipación.',
    })
    @ApiOkResponse({
        description: 'Cita cancelada exitosamente',
        type: CitaCanceladaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Cita no cancelable o fuera del plazo',
        type: BadRequestErrorResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        type: NotFoundErrorResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para cancelar esta cita',
        type: ForbiddenErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async deleteCita(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<CitaCanceladaApiResponseDto> {
        const pacienteId = req.user.id;
        const result = await this.citasService.deleteCita(id, pacienteId);

        // Invalidar caché del paciente, médico y disponibilidad
        await this.citasCacheService.invalidateOnCitaCancelled(
            pacienteId,
            result.medicoId,
            id,
            result.fecha,
        );

        return {
            message: result.message,
        };
    }
}
