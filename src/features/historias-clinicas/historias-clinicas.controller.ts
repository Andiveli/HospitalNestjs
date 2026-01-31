import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import UserRequest from '../people/people.request';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { HistoriaClinicaResponseDto } from './dto/historia-clinica.dto';

@ApiTags('Historias Clínicas')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('historias-clinicas')
export class HistoriasClinicasController {
    constructor(
        private readonly historiasClinicasService: HistoriasClinicasService,
    ) {}

    @Get(':pacienteId')
    @Roles(Rol.Paciente, Rol.Medico)
    @ApiOperation({
        summary: 'Obtener historia clínica completa',
        description:
            'Obtiene la historia clínica completa de un paciente. ' +
            'Incluye: información personal, enfermedades, citas médicas con diagnósticos y recetas, ' +
            'documentos médicos y resumen estadístico. ' +
            '**Restricciones:** Pacientes solo pueden ver su propia historia. ' +
            'Médicos solo pueden ver historias de pacientes que hayan atendido.',
    })
    @ApiOkResponse({
        description: 'Historia clínica obtenida exitosamente',
        type: HistoriaClinicaResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Paciente no encontrado o sin historia clínica',
    })
    @ApiForbiddenResponse({
        description:
            'No tiene permiso para ver esta historia clínica. ' +
            'Si es paciente: solo puede ver la suya propia. ' +
            'Si es médico: solo puede ver historias de pacientes que haya atendido.',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiInternalServerErrorResponse({
        description: 'Error interno al obtener la historia clínica',
    })
    async getHistoriaClinica(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: HistoriaClinicaResponseDto }> {
        const historia = await this.historiasClinicasService.getHistoriaClinica(
            pacienteId,
            req.user.id,
            req.user.roles,
        );

        return {
            message: 'Historia clínica obtenida exitosamente',
            data: historia,
        };
    }
}
