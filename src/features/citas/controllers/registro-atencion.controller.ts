import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../../roles/roles.guard';
import { Roles } from '../../roles/roles.decorator';
import { Rol } from '../../roles/roles.enum';
import UserRequest from '../../people/people.request';
import { RegistroAtencionService } from '../services/registro-atencion.service';
import { CrearRegistroAtencionDto } from '../dto/crear-registro-atencion.dto';
import { CrearRegistroAtencionApiResponseDto } from '../dto/registro-atencion-response.dto';

@ApiTags('Registro de Atención')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('registro-atencion')
export class RegistroAtencionController {
    constructor(
        private readonly registroAtencionService: RegistroAtencionService,
    ) {}

    @Post()
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Crear registro de atención médica completo',
        description:
            'Crea un registro de atención médica para una cita atendida. ' +
            'Incluye diagnóstico, observaciones y opcionalmente receta médica con medicamentos. ' +
            'Si el paciente no tiene historia clínica, se crea automáticamente. ' +
            'Solo el médico asignado a la cita puede crear el registro.',
    })
    @ApiCreatedResponse({
        description: 'Registro de atención creado exitosamente',
        type: CrearRegistroAtencionApiResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos inválidos, cita no está atendida, ya existe registro, o IDs de medicamentos/vías/unidades no existen',
    })
    @ApiForbiddenResponse({
        description:
            'No tiene permiso para crear registros o no es el médico asignado a la cita',
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
    })
    @ApiConflictResponse({
        description: 'Ya existe un registro de atención para esta cita',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiInternalServerErrorResponse({
        description: 'Error interno del servidor',
    })
    async crearRegistroAtencion(
        @Body() dto: CrearRegistroAtencionDto,
        @Request() req: UserRequest,
    ): Promise<CrearRegistroAtencionApiResponseDto> {
        const registro =
            await this.registroAtencionService.crearRegistroAtencion(
                dto,
                req.user.id,
            );

        return {
            message: 'Registro de atención creado exitosamente',
            data: registro,
        };
    }
}
