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
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import UserRequest from '../people/people.request';
import { CitasService } from './citas.service';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CitaResponseDto } from './dto/cita-response.dto';
import { CitaDetalladaResponseDto } from './dto/cita-detallada-response.dto';
import { PaginationDto } from './dto/pagination.dto';

@ApiTags('citas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) {}

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
        type: CitaResponseDto,
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
        type: [CitaResponseDto],
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
        type: [CitaResponseDto],
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
        type: CitaDetalladaResponseDto,
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
        type: CitaResponseDto,
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
        schema: {
            example: {
                message: 'Cita del 15/2/2024 cancelada exitosamente',
            },
        },
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
