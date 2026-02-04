import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import UserRequest from 'src/features/people/people.request';
import { Roles } from 'src/features/roles/roles.decorator';
import { Rol } from 'src/features/roles/roles.enum';
import { RolesGuard } from 'src/features/roles/roles.guard';
import { DerivacionesService } from './derivaciones.service';
import { CreateDerivacionDto } from './dto/create-derivacion.dto';
import {
    DerivacionApiResponseDto,
    DerivacionesListApiResponseDto,
    ServicioReferidoDto,
    CentroSaludDto,
} from './dto/derivacion-response.dto';

@ApiTags('Derivaciones')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Rol.Medico)
@Controller('derivaciones')
export class DerivacionesController {
    constructor(private readonly derivacionesService: DerivacionesService) {}

    @Post()
    @ApiOperation({
        summary: 'Crear una nueva derivación',
        description:
            'Crea una derivación para un paciente a un centro de salud con servicios específicos. ' +
            'Requiere el rol de médico.',
    })
    @ApiCreatedResponse({
        description: 'Derivación creada exitosamente',
        type: DerivacionApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Centro de salud o servicios no encontrados',
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para crear derivaciones',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async create(
        @Body() dto: CreateDerivacionDto,
        @Request() req: UserRequest,
    ): Promise<DerivacionApiResponseDto> {
        const medicoId = req.user.id;
        const derivacion = await this.derivacionesService.create(dto, medicoId);

        return {
            message: 'Derivación creada exitosamente',
            data: derivacion,
        };
    }

    @Get()
    @ApiOperation({
        summary: 'Listar derivaciones del médico',
        description:
            'Obtiene todas las derivaciones creadas por el médico autenticado, ordenadas por fecha descendente.',
    })
    @ApiOkResponse({
        description: 'Derivaciones obtenidas exitosamente',
        type: DerivacionesListApiResponseDto,
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para ver derivaciones',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findByMedico(
        @Request() req: UserRequest,
    ): Promise<DerivacionesListApiResponseDto> {
        const medicoId = req.user.id;
        const derivaciones =
            await this.derivacionesService.findByMedico(medicoId);

        return {
            message: 'Derivaciones obtenidas exitosamente',
            data: derivaciones,
        };
    }

    @Get('servicios')
    @ApiOperation({
        summary: 'Listar servicios referidos disponibles',
        description:
            'Obtiene el catálogo de servicios médicos disponibles para derivaciones.',
    })
    @ApiOkResponse({
        description: 'Servicios obtenidos exitosamente',
        schema: {
            example: {
                message: 'Servicios obtenidos exitosamente',
                data: [
                    { id: 1, nombre: 'Resonancia Magnética' },
                    { id: 2, nombre: 'Tomografía Computarizada' },
                ],
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findAllServicios(): Promise<{
        message: string;
        data: ServicioReferidoDto[];
    }> {
        const servicios = await this.derivacionesService.findAllServicios();

        return {
            message: 'Servicios obtenidos exitosamente',
            data: servicios,
        };
    }

    @Get('centros')
    @ApiOperation({
        summary: 'Listar centros de salud',
        description:
            'Obtiene el catálogo de centros de salud disponibles para derivaciones.',
    })
    @ApiOkResponse({
        description: 'Centros obtenidos exitosamente',
        schema: {
            example: {
                message: 'Centros de salud obtenidos exitosamente',
                data: [
                    {
                        id: 1,
                        nombre: 'Hospital Central',
                        direccion: 'Av. Principal 123',
                        telefono: '555-1234',
                    },
                ],
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findAllCentros(): Promise<{
        message: string;
        data: CentroSaludDto[];
    }> {
        const centros = await this.derivacionesService.findAllCentros();

        return {
            message: 'Centros de salud obtenidos exitosamente',
            data: centros,
        };
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Obtener detalle de una derivación',
        description:
            'Obtiene los detalles completos de una derivación específica. ' +
            'Solo el médico que la creó puede verla.',
    })
    @ApiOkResponse({
        description: 'Derivación obtenida exitosamente',
        type: DerivacionApiResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Derivación no encontrada',
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para ver esta derivación',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async findById(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<DerivacionApiResponseDto> {
        const medicoId = req.user.id;
        const derivacion = await this.derivacionesService.findById(
            id,
            medicoId,
        );

        return {
            message: 'Derivación obtenida exitosamente',
            data: derivacion,
        };
    }

    @Delete(':id')
    @ApiOperation({
        summary: 'Eliminar una derivación',
        description:
            'Elimina una derivación existente. ' +
            'Solo el médico que la creó puede eliminarla.',
    })
    @ApiOkResponse({
        description: 'Derivación eliminada exitosamente',
        schema: {
            example: {
                message: 'Derivación eliminada exitosamente',
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Derivación no encontrada',
    })
    @ApiForbiddenResponse({
        description: 'No tienes permiso para eliminar esta derivación',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async delete(
        @Param('id', ParseIntPipe) id: number,
        @Request() req: UserRequest,
    ): Promise<{ message: string }> {
        const medicoId = req.user.id;
        await this.derivacionesService.delete(id, medicoId);

        return {
            message: 'Derivación eliminada exitosamente',
        };
    }
}
