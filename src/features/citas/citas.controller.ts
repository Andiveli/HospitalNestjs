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
import UserRequest from '../people/people.request';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CitaResponseDto } from './dto/cita-response.dto';
import { CitaDetalladaResponseDto } from './dto/cita-detallada-response.dto';
import { PaginationDto } from './dto/pagination.dto';
import { MedicoDisponibleDto } from './dto/medico-disponible.dto';
import {
    ConsultarDisponibilidadQueryDto,
    DisponibilidadResponseDto,
} from './dto/disponibilidad.dto';
import { DiasAtencionResponseDto } from './dto/dias-atencion.dto';
import {
    CitaApiResponseDto,
    CitasListApiResponseDto,
    CitasPaginadasApiResponseDto,
    CitaDetalladaApiResponseDto,
    CitaCanceladaApiResponseDto,
    MedicosDisponiblesApiResponseDto,
    DiasAtencionApiResponseDto,
    DisponibilidadApiResponseDto,
} from './dto/api-responses.dto';

@ApiTags('Citas')
@ApiBearerAuth()
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) {}

    @Get('medicos')
    @ApiOperation({
        summary: 'Listar médicos disponibles',
        description:
            'Obtiene la lista de médicos disponibles para agendar citas. ' +
            'Opcionalmente se puede filtrar por especialidad.',
    })
    @ApiQuery({
        name: 'especialidadId',
        required: false,
        type: Number,
        description: 'ID de la especialidad para filtrar médicos',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Lista de médicos obtenida exitosamente',
        type: MedicosDisponiblesApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getMedicosDisponibles(
        @Query('especialidadId') especialidadId?: number,
    ): Promise<{ message: string; data: MedicoDisponibleDto[] }> {
        const medicos =
            await this.citasService.getMedicosDisponibles(especialidadId);

        return {
            message: 'Médicos obtenidos exitosamente',
            data: medicos,
        };
    }

    @Get('medicos/:medicoId/disponibilidad')
    @ApiOperation({
        summary: 'Obtener slots disponibles de un médico',
        description:
            'Obtiene los horarios disponibles de un médico para una fecha específica. ' +
            'Devuelve slots de 30 minutos, excluyendo citas ya agendadas y excepciones.',
    })
    @ApiOkResponse({
        description: 'Disponibilidad obtenida exitosamente',
        type: DisponibilidadApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
    })
    @ApiBadRequestResponse({
        description: 'Fecha inválida',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getDisponibilidadMedico(
        @Param('medicoId', ParseIntPipe) medicoId: number,
        @Query() query: ConsultarDisponibilidadQueryDto,
    ): Promise<{ message: string; data: DisponibilidadResponseDto }> {
        const disponibilidad = await this.citasService.getDisponibilidadMedico(
            medicoId,
            query.fecha,
        );

        return {
            message: 'Disponibilidad obtenida exitosamente',
            data: disponibilidad,
        };
    }

    @Get('medicos/:medicoId/dias-atencion')
    @ApiOperation({
        summary: 'Obtener días de atención de un médico',
        description:
            'Devuelve los días de la semana en que el médico atiende ' +
            '(ej: Lunes, Miércoles, Viernes).',
    })
    @ApiOkResponse({
        description: 'Días de atención obtenidos exitosamente',
        type: DiasAtencionApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getDiasAtencion(
        @Param('medicoId', ParseIntPipe) medicoId: number,
    ): Promise<{ message: string; data: DiasAtencionResponseDto }> {
        const diasAtencion = await this.citasService.getDiasAtencion(medicoId);

        return {
            message: 'Días de atención obtenidos exitosamente',
            data: diasAtencion,
        };
    }

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva cita médica',
        description:
            'Permite a un paciente autenticado agendar una cita con un médico específico. ' +
            'La duración de la cita es de 30 minutos por defecto. ' +
            'La fecha y hora de fin se calcula automáticamente. ' +
            'Valida que no haya conflictos de horario con otras citas del médico.',
    })
    @ApiCreatedResponse({
        description: 'Cita creada exitosamente',
        type: CitaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o fecha en el pasado',
        schema: {
            example: {
                message:
                    'La fecha de la cita debe ser posterior a la fecha actual',
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiConflictResponse({
        description:
            'Conflicto de horario - El médico ya tiene una cita agendada',
        schema: {
            example: {
                message:
                    'El médico ya tiene una cita agendada en ese horario. Por favor selecciona otro horario disponible.',
                error: 'Conflict',
                statusCode: 409,
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
        schema: {
            example: {
                message: 'Médico con ID 999 no encontrado',
                error: 'Not Found',
                statusCode: 404,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        schema: {
            example: {
                message: 'Unauthorized',
                error: 'Unauthorized',
                statusCode: 401,
            },
        },
    })
    async createCita(
        @Body() createCitaDto: CreateCitaDto,
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: CitaResponseDto }> {
        const pacienteId = req.user.id;
        const cita = await this.citasService.createCita(
            createCitaDto,
            pacienteId,
        );

        return {
            message: 'Cita creada exitosamente',
            data: cita,
        };
    }

    @Get('proximas')
    @ApiOperation({
        summary: 'Obtener las próximas 3 citas pendientes',
        description:
            'Devuelve las 3 próximas citas pendientes del paciente autenticado, ' +
            'ordenadas por fecha de inicio ascendente (la más cercana primero).',
    })
    @ApiOkResponse({
        description: 'Próximas citas obtenidas exitosamente',
        type: CitasListApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getProximasCitas(
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: CitaResponseDto[] }> {
        const pacienteId = req.user.id;
        const citas = await this.citasService.getProximasCitas(pacienteId);

        return {
            message: 'Próximas citas obtenidas exitosamente',
            data: citas,
        };
    }

    @Get('recientes')
    @ApiOperation({
        summary: 'Obtener las últimas 4 citas atendidas',
        description:
            'Devuelve las 4 últimas citas atendidas del paciente autenticado, ' +
            'ordenadas por fecha descendente (la más reciente primero).',
    })
    @ApiOkResponse({
        description: 'Citas recientes obtenidas exitosamente',
        type: CitasListApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getRecientesCitasAtendidas(
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: CitaResponseDto[] }> {
        const pacienteId = req.user.id;
        const citas =
            await this.citasService.getRecientesCitasAtendidas(pacienteId);

        return {
            message: 'Citas recientes obtenidas exitosamente',
            data: citas,
        };
    }

    @Get('pendientes')
    @ApiOperation({
        summary: 'Listar todas las citas pendientes con paginación',
        description:
            'Devuelve todas las citas pendientes del paciente autenticado, ' +
            'con soporte de paginación. Ordenadas por fecha ascendente.',
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
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getAllCitasPendientes(
        @Request() req: UserRequest,
        @Query() paginationDto: PaginationDto,
    ): Promise<{
        message: string;
        data: CitaResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const pacienteId = req.user.id;
        const { page = 1, limit = 10 } = paginationDto;

        const result = await this.citasService.getAllCitasPendientes(
            pacienteId,
            page,
            limit,
        );

        return {
            message: 'Citas pendientes obtenidas exitosamente',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('atendidas')
    @ApiOperation({
        summary: 'Listar todas las citas atendidas con paginación',
        description:
            'Devuelve todas las citas atendidas del paciente autenticado, ' +
            'con soporte de paginación. Ordenadas por fecha descendente.',
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
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getAllCitasAtendidas(
        @Request() req: UserRequest,
        @Query() paginationDto: PaginationDto,
    ): Promise<{
        message: string;
        data: CitaResponseDto[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> {
        const pacienteId = req.user.id;
        const { page = 1, limit = 10 } = paginationDto;

        const result = await this.citasService.getAllCitasAtendidas(
            pacienteId,
            page,
            limit,
        );

        return {
            message: 'Citas atendidas obtenidas exitosamente',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener detalles de una cita específica',
        description:
            'Devuelve toda la información de una cita, incluyendo diagnóstico, ' +
            'observaciones, recetas y derivaciones si la cita ya fue atendida. ' +
            'Solo el paciente dueño de la cita puede acceder.',
    })
    @ApiOkResponse({
        description: 'Cita obtenida exitosamente',
        type: CitaDetalladaApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        schema: {
            example: {
                message: 'Cita con ID 999 no encontrada',
                error: 'Not Found',
                statusCode: 404,
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para acceder a esta cita',
        schema: {
            example: {
                message: 'No tienes permiso para acceder a esta cita',
                error: 'Forbidden',
                statusCode: 403,
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'ID inválido',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getCitaById(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: CitaDetalladaResponseDto }> {
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
            'Permite modificar la fecha/hora y si es telefónica de una cita pendiente. ' +
            'Reglas: ' +
            '1) Solo citas con estado "pendiente" ' +
            '2) Solo si faltan 72+ horas para la cita ' +
            '3) NO se puede cambiar el médico ' +
            '4) Valida que no haya conflictos de horario con otras citas del médico',
    })
    @ApiOkResponse({
        description: 'Cita actualizada exitosamente',
        type: CitaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos inválidos, cita no es "pendiente", o faltan menos de 72 horas',
        schema: {
            example: {
                message:
                    'Solo se pueden modificar citas con al menos 72 horas de anticipación',
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        schema: {
            example: {
                message: 'Cita con ID 123 no encontrada',
                error: 'Not Found',
                statusCode: 404,
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para modificar esta cita',
        schema: {
            example: {
                message: 'No tienes permiso para modificar esta cita',
                error: 'Forbidden',
                statusCode: 403,
            },
        },
    })
    @ApiConflictResponse({
        description: 'Conflicto de horario con otra cita del médico',
        schema: {
            example: {
                message:
                    'El médico ya tiene una cita agendada en ese horario. Por favor selecciona otro horario.',
                error: 'Conflict',
                statusCode: 409,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async updateCita(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateCitaDto: UpdateCitaDto,
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: CitaResponseDto }> {
        const pacienteId = req.user.id;
        const cita = await this.citasService.updateCita(
            id,
            updateCitaDto,
            pacienteId,
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
            'Cancela una cita pendiente cambiando su estado a "cancelada" (soft delete). ' +
            'Reglas: ' +
            '1) Solo citas con estado "pendiente" ' +
            '2) Solo si faltan 72+ horas para la cita',
    })
    @ApiOkResponse({
        description: 'Cita cancelada exitosamente',
        type: CitaCanceladaApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Cita no es "pendiente" o faltan menos de 72 horas',
        schema: {
            example: {
                message:
                    'Solo se pueden cancelar citas con al menos 72 horas de anticipación',
                error: 'Bad Request',
                statusCode: 400,
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
        schema: {
            example: {
                message: 'Cita con ID 123 no encontrada',
                error: 'Not Found',
                statusCode: 404,
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para cancelar esta cita',
        schema: {
            example: {
                message: 'No tienes permiso para cancelar esta cita',
                error: 'Forbidden',
                statusCode: 403,
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async deleteCita(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<{ message: string }> {
        const pacienteId = req.user.id;
        const result = await this.citasService.deleteCita(id, pacienteId);

        return result;
    }
}
