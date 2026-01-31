import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    Request,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import UserRequest from 'src/features/people/people.request';
import { Roles } from 'src/features/roles/roles.decorator';
import { Rol } from 'src/features/roles/roles.enum';
import { RolesGuard } from 'src/features/roles/roles.guard';
import { CitasService } from '../citas.service';
import {
    BadRequestErrorResponseDto,
    ForbiddenErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from '../dto/api-error-responses.dto';
import {
    CitaDetalladaApiResponseDto,
    CitasListApiResponseDto,
    CitasPaginadasApiResponseDto,
} from '../dto/api-responses.dto';
import { CitaResponseDto } from '../dto/cita-response.dto';
import { FiltrarCitasPorFechaDto } from '../dto/filtrar-citas-por-fecha.dto';
import { PaginationDto } from '../dto/pagination.dto';

@ApiTags('Citas - Medico')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Rol.Medico)
@Controller('citas/medico')
export class CitasMedicoController {
    constructor(private readonly citasService: CitasService) {}

    @Get('proximas')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Obtener las próximas citas del médico autenticado',
        description:
            'Devuelve las próximas 3 citas pendientes del médico autenticado, ' +
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
    async getProximasCitasMedico(
        @Request() req: UserRequest,
    ): Promise<CitasListApiResponseDto> {
        const medicoId = req.user.id;
        const citas = await this.citasService.getProximasCitasMedico(medicoId);

        return {
            message: 'Próximas citas del médico obtenidas exitosamente',
            data: citas,
        };
    }

    @Get('all')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300000)
    @ApiOperation({
        summary: 'Listar todas las citas del médico autenticado',
        description:
            'Devuelve todas las citas del médico autenticado, ' +
            'con soporte de paginación. Incluye citas pendientes, atendidas y canceladas. ' +
            'Ordenadas por fecha descendente (las más recientes primero).',
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
        description: 'Citas del médico obtenidas exitosamente',
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
    async getAllCitasMedico(
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
        const medicoId = req.user.id;
        const { page = 1, limit = 10 } = paginationDto;

        const result = await this.citasService.getAllCitasMedico(
            medicoId,
            page,
            limit,
        );

        return {
            message: 'Citas del médico obtenidas exitosamente',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get('fecha')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(60000)
    @ApiOperation({
        summary: 'Filtrar citas del médico por fecha',
        description:
            'Devuelve todas las citas del médico autenticado para una fecha específica. ' +
            'Incluye citas pendientes, atendidas y canceladas. ' +
            'Ordenadas por hora de inicio ascendente.',
    })
    @ApiQuery({
        name: 'fecha',
        required: true,
        type: String,
        description:
            'Fecha para filtrar citas (formato YYYY-MM-DD). Ejemplo: 2026-02-15',
        example: '2026-02-15',
    })
    @ApiOkResponse({
        description: 'Citas del médico para la fecha obtenidas exitosamente',
        type: CitasListApiResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Fecha inválida o formato incorrecto',
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
    async getCitasMedicoPorFecha(
        @Request() req: UserRequest,
        @Query() query: FiltrarCitasPorFechaDto,
    ): Promise<CitasListApiResponseDto> {
        const medicoId = req.user.id;
        const citas = await this.citasService.getCitasMedicoPorFecha(
            medicoId,
            query.fecha,
        );

        return {
            message: `Citas del médico para el ${query.fecha} obtenidas exitosamente`,
            data: citas,
        };
    }

    @Get(':id')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(600000)
    @ApiOperation({
        summary: 'Obtener detalle de una cita específica (médico)',
        description:
            'Devuelve toda la información de una cita específica asignada al médico autenticado. ' +
            'Incluye diagnóstico, observaciones, recetas y derivaciones si la cita ya fue atendida. ' +
            'Solo lectura - el médico no puede modificar la cita desde este endpoint.',
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
    async getCitaByIdMedico(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<CitaDetalladaApiResponseDto> {
        const medicoId = req.user.id;
        const cita = await this.citasService.getCitaByIdMedico(id, medicoId);

        return {
            message: 'Cita obtenida exitosamente',
            data: cita,
        };
    }
}
