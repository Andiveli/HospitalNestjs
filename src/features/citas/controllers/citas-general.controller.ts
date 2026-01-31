import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CitasService } from '../citas.service';
import {
    BadRequestErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
} from '../dto/api-error-responses.dto';
import {
    DiasAtencionApiResponseDto,
    DisponibilidadApiResponseDto,
    MedicosDisponiblesApiResponseDto,
} from '../dto/api-responses.dto';
import { ConsultarDisponibilidadQueryDto } from '../dto/disponibilidad.dto';

@ApiTags('Citas - General')
@Controller('citas')
export class CitasController {
    constructor(private readonly citasService: CitasService) {}

    @Get('medicos')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300000)
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
        type: UnauthorizedErrorResponseDto,
    })
    async getMedicosDisponibles(
        @Query('especialidadId') especialidadId?: number,
    ): Promise<MedicosDisponiblesApiResponseDto> {
        const medicos =
            await this.citasService.getMedicosDisponibles(especialidadId);

        return {
            message: 'Médicos obtenidos exitosamente',
            data: medicos,
        };
    }

    @Get('medicos/:medicoId/disponibilidad')
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(60000)
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
        type: NotFoundErrorResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Fecha inválida',
        type: BadRequestErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getDisponibilidadMedico(
        @Param('medicoId', ParseIntPipe) medicoId: number,
        @Query() query: ConsultarDisponibilidadQueryDto,
    ): Promise<DisponibilidadApiResponseDto> {
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
    @UseInterceptors(CacheInterceptor)
    @CacheTTL(300000)
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
        type: NotFoundErrorResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
        type: UnauthorizedErrorResponseDto,
    })
    async getDiasAtencion(
        @Param('medicoId', ParseIntPipe) medicoId: number,
    ): Promise<DiasAtencionApiResponseDto> {
        const diasAtencion = await this.citasService.getDiasAtencion(medicoId);

        return {
            message: 'Días de atención obtenidos exitosamente',
            data: diasAtencion,
        };
    }
}
