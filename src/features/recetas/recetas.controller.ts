import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
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
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import {
    RecetaResponseDto,
    RecetasCitaResponseDto,
} from './dto/receta-response.dto';
import {
    RecetaCreadaResponseDto,
    RecetaByRegistroResponseDto,
    MedicamentosListResponseDto,
    ViasAdministracionListResponseDto,
    UnidadesMedidaListResponseDto,
    MisRecetasResponseDto,
} from './dto/recetas-api-response.dto';

@ApiTags('Recetas')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('recetas')
export class RecetasController {
    constructor(private readonly recetasService: RecetasService) {}

    @Post()
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Crear receta médica',
        description:
            'Crea una nueva receta médica para un registro de atención. ' +
            'Solo los médicos pueden crear recetas y solo cuando la cita está en estado "Atendida". ' +
            'Además, solo el médico asignado a la cita puede crear la receta.',
    })
    @ApiCreatedResponse({
        description: 'Receta médica creada exitosamente',
        type: RecetaResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Datos inválidos, cita no está atendida, o IDs de medicamentos/vías/unidades no existen',
    })
    @ApiConflictResponse({
        description: 'Ya existe una receta para este registro de atención',
    })
    @ApiForbiddenResponse({
        description:
            'No tiene permiso para crear recetas o no es el médico asignado a la cita',
    })
    @ApiNotFoundResponse({
        description: 'Registro de atención no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async createReceta(
        @Body() createRecetaDto: CreateRecetaDto,
        @Request() req: UserRequest,
    ): Promise<RecetaCreadaResponseDto> {
        const receta = await this.recetasService.createReceta(
            createRecetaDto,
            req.user.id,
        );

        return {
            message: 'Receta médica creada exitosamente',
            data: receta,
        };
    }

    @Get('registro-atencion/:registroAtencionId')
    @Roles(Rol.Medico, Rol.Paciente)
    @ApiOperation({
        summary: 'Obtener receta por registro de atención',
        description:
            'Obtiene la receta médica asociada a un registro de atención. ' +
            'Tanto médicos como pacientes pueden consultar esta información.',
    })
    @ApiOkResponse({
        description: 'Receta médica obtenida exitosamente',
        type: RecetasCitaResponseDto,
    })
    @ApiNotFoundResponse({
        description: 'Registro de atención no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getRecetaByRegistreAtencionId(
        @Param('registroAtencionId', ParseIntPipe) registroAtencionId: number,
    ): Promise<RecetaByRegistroResponseDto> {
        const receta =
            await this.recetasService.getRecetaByRegistroAtencionId(
                registroAtencionId,
            );

        return {
            message: receta.tieneReceta
                ? 'Receta médica obtenida exitosamente'
                : 'No existe receta médica para este registro de atención',
            data: receta,
        };
    }

    @Get('medicamentos')
    @Roles(Rol.Medico, Rol.Paciente)
    @ApiOperation({
        summary: 'Listar medicamentos disponibles',
        description:
            'Obtiene la lista de todos los medicamentos disponibles para recetar.',
    })
    @ApiOkResponse({
        description: 'Lista de medicamentos obtenida exitosamente',
        type: MedicamentosListResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getMedicamentos(): Promise<MedicamentosListResponseDto> {
        const medicamentos = await this.recetasService.getMedicamentos();

        return {
            message: 'Medicamentos obtenidos exitosamente',
            data: medicamentos,
        };
    }

    @Get('vias-administracion')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Listar vías de administración',
        description:
            'Obtiene la lista de todas las vías de administración disponibles.',
    })
    @ApiOkResponse({
        description: 'Lista de vías de administración obtenida exitosamente',
        type: ViasAdministracionListResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getViasAdministracion(): Promise<ViasAdministracionListResponseDto> {
        const vias = await this.recetasService.getViasAdministracion();

        return {
            message: 'Vías de administración obtenidas exitosamente',
            data: vias,
        };
    }

    @Get('unidades-medida')
    @Roles(Rol.Medico)
    @ApiOperation({
        summary: 'Listar unidades de medida',
        description:
            'Obtiene la lista de todas las unidades de medida disponibles.',
    })
    @ApiOkResponse({
        description: 'Lista de unidades de medida obtenida exitosamente',
        type: UnidadesMedidaListResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async getUnidadesMedida(): Promise<UnidadesMedidaListResponseDto> {
        const unidades = await this.recetasService.getUnidadesMedida();

        return {
            message: 'Unidades de medida obtenidas exitosamente',
            data: unidades,
        };
    }

    @Get('paciente/mis-recetas')
    @Roles(Rol.Paciente)
    @ApiOperation({
        summary: 'Obtener mis recetas médicas',
        description:
            'Obtiene todas las recetas médicas del paciente autenticado. ' +
            'Cada receta incluye: medicamentos recetados, diagnóstico de la atención, ' +
            'observaciones del médico e información del médico que la emitió. ' +
            'Las recetas están ordenadas por fecha (más recientes primero).',
    })
    @ApiOkResponse({
        description: 'Recetas médicas obtenidas exitosamente',
        type: MisRecetasResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiInternalServerErrorResponse({
        description: 'Error interno al obtener las recetas',
    })
    async getMisRecetas(
        @Request() req: UserRequest,
    ): Promise<MisRecetasResponseDto> {
        const recetas = await this.recetasService.getRecetasByPaciente(
            req.user.id,
        );

        return {
            message: 'Recetas médicas obtenidas exitosamente',
            data: recetas,
        };
    }
}
