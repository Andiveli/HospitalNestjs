import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Request,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import UserRequest from '../people/people.request';
import { HistoriaClinicaService } from './historia-clinica.service';
import {
    HistoriaClinicaApiResponseDto,
    HistoriaClinicaCompletaDto,
    HistoriaClinicaNoExisteDto,
} from './dto';

/**
 * Controlador para gestionar la historia clínica
 * Permite acceso a pacientes (su propia historia) y médicos (cualquier paciente)
 */
@ApiTags('Historia Clínica')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('historia-clinica')
export class HistoriaClinicaController {
    constructor(
        private readonly historiaClinicaService: HistoriaClinicaService,
    ) {}

    /**
     * Obtiene la historia clínica del paciente autenticado
     * Solo accesible para usuarios con rol Paciente
     */
    @Get('mi-historia')
    @Roles(Rol.Paciente)
    @ApiOperation({
        summary: 'Obtener mi historia clínica',
        description:
            'Obtiene la historia clínica completa del paciente autenticado. ' +
            'Incluye datos personales, enfermedades, registros de atención, ' +
            'recetas y documentos adjuntos.',
    })
    @ApiOkResponse({
        description: 'Historia clínica obtenida exitosamente',
        type: HistoriaClinicaApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Acceso denegado - Solo pacientes pueden acceder',
    })
    async obtenerMiHistoriaClinica(
        @Request() req: UserRequest,
    ): Promise<
        | HistoriaClinicaApiResponseDto
        | { message: string; data: HistoriaClinicaNoExisteDto }
    > {
        const resultado =
            await this.historiaClinicaService.obtenerHistoriaClinicaCompleta(
                req.user.id,
            );

        // Si no existe historia clínica, retornar mensaje informativo
        if ('existe' in resultado && !resultado.existe) {
            return {
                message: resultado.message,
                data: resultado,
            };
        }

        return {
            message: 'Historia clínica obtenida exitosamente',
            data: resultado as HistoriaClinicaCompletaDto,
        };
    }

    /**
     * Obtiene la historia clínica de un paciente específico
     * Solo accesible para médicos
     */
    @Get('paciente/:pacienteId')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Obtener historia clínica de un paciente',
        description:
            'Obtiene la historia clínica completa de un paciente específico. ' +
            'Solo médicos pueden acceder a esta información. ' +
            'Incluye todos los datos médicos relevantes para la atención.',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente (usuario_id)',
        example: 10,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Historia clínica obtenida exitosamente',
        type: HistoriaClinicaApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Paciente no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Acceso denegado - Solo médicos pueden acceder',
    })
    async obtenerHistoriaClinicaPaciente(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
    ): Promise<
        | HistoriaClinicaApiResponseDto
        | { message: string; data: HistoriaClinicaNoExisteDto }
    > {
        const resultado =
            await this.historiaClinicaService.obtenerHistoriaClinicaCompleta(
                pacienteId,
            );

        // Si no existe historia clínica, retornar mensaje informativo
        if ('existe' in resultado && !resultado.existe) {
            return {
                message: resultado.message,
                data: resultado,
            };
        }

        return {
            message: 'Historia clínica obtenida exitosamente',
            data: resultado as HistoriaClinicaCompletaDto,
        };
    }

    /**
     * Obtiene la historia clínica de un paciente - Endpoint alternativo
     * Accesible para pacientes (solo su propia historia) y médicos (cualquier paciente)
     */
    @Get(':pacienteId')
    @Roles(Rol.Paciente, Rol.Medico)
    @ApiOperation({
        summary: 'Obtener historia clínica por ID',
        description:
            'Obtiene la historia clínica de un paciente. ' +
            'Los pacientes solo pueden ver su propia historia. ' +
            'Los médicos pueden ver la historia de cualquier paciente.',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente (usuario_id)',
        example: 10,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Historia clínica obtenida exitosamente',
        type: HistoriaClinicaApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Paciente no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description:
            'Acceso denegado - Pacientes solo pueden ver su propia historia',
    })
    async obtenerHistoriaClinicaPorId(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @Request() req: UserRequest,
    ): Promise<
        | HistoriaClinicaApiResponseDto
        | { message: string; data: HistoriaClinicaNoExisteDto }
    > {
        // Verificar permisos: pacientes solo pueden ver su propia historia
        const esPaciente = req.user.roles.includes(Rol.Paciente);
        const esMedico = req.user.roles.includes(Rol.Medico);

        if (esPaciente && !esMedico && req.user.id !== pacienteId) {
            throw new ForbiddenException(
                'Solo puede acceder a su propia historia clínica',
            );
        }

        const resultado =
            await this.historiaClinicaService.obtenerHistoriaClinicaCompleta(
                pacienteId,
            );

        // Si no existe historia clínica, retornar mensaje informativo
        if ('existe' in resultado && !resultado.existe) {
            return {
                message: resultado.message,
                data: resultado,
            };
        }

        return {
            message: 'Historia clínica obtenida exitosamente',
            data: resultado as HistoriaClinicaCompletaDto,
        };
    }
}
