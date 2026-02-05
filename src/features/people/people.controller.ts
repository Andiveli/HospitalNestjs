import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
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
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { CrearDto } from './dto/crear.dto';
import { PeopleService } from './people.service';
import { PeopleGuard } from './people.guard';
import {
    UsuarioResponseDto,
    UsuarioCreadoResponseDto,
    ListaVaciaResponseDto,
    StatsApiResponseDto,
} from './dto/people-response.dto';

@ApiTags('People - Usuarios')
@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    /**
     * Asigna el rol de médico a un usuario existente
     */
    @Post('medico')
    @UseGuards(PeopleGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear médico',
        description:
            'Asigna el rol de médico a un usuario existente en el sistema. ' +
            'El usuario debe estar previamente registrado con verificación de email.',
    })
    @ApiCreatedResponse({
        description: 'Médico creado exitosamente',
        type: UsuarioCreadoResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o usuario no verificado',
    })
    @ApiNotFoundResponse({
        description: 'Usuario con el email especificado no encontrado',
    })
    @ApiConflictResponse({
        description: 'El usuario ya tiene el rol de médico',
    })
    async crearMedico(
        @Body() medico: CrearDto,
    ): Promise<UsuarioCreadoResponseDto> {
        await this.peopleService.rolToPerson(medico.email, Rol.Medico);
        return { msg: 'Médico creado exitosamente' };
    }

    /**
     * Asigna el rol de paciente a un usuario existente
     */
    @Post('paciente')
    @UseGuards(PeopleGuard)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Crear paciente',
        description:
            'Asigna el rol de paciente a un usuario existente en el sistema. ' +
            'El usuario debe estar previamente registrado con verificación de email.',
    })
    @ApiCreatedResponse({
        description: 'Paciente creado exitosamente',
        type: UsuarioCreadoResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o usuario no verificado',
    })
    @ApiNotFoundResponse({
        description: 'Usuario con el email especificado no encontrado',
    })
    @ApiConflictResponse({
        description: 'El usuario ya tiene el rol de paciente',
    })
    async crearPaciente(
        @Body() paciente: CrearDto,
    ): Promise<UsuarioCreadoResponseDto> {
        await this.peopleService.rolToPerson(paciente.email, Rol.Paciente);
        return { msg: 'Paciente creado exitosamente' };
    }

    /**
     * Lista todos los médicos registrados y verificados
     */
    @Get('medicos')
    @UseGuards(PeopleGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Listar médicos',
        description:
            'Obtiene la lista de todos los médicos registrados y verificados en el sistema.',
    })
    @ApiOkResponse({
        description: 'Lista de médicos obtenida exitosamente',
        type: [UsuarioResponseDto],
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async listarMedicos(): Promise<
        UsuarioResponseDto[] | ListaVaciaResponseDto
    > {
        const medicos = await this.peopleService.listarUserRol(Rol.Medico);
        if (medicos.length === 0)
            return { msg: 'La lista de médicos está vacía' };
        return medicos as UsuarioResponseDto[];
    }

    /**
     * Lista todos los pacientes registrados y verificados
     */
    @Get('pacientes')
    @UseGuards(PeopleGuard)
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Listar pacientes',
        description:
            'Obtiene la lista de todos los pacientes registrados y verificados en el sistema.',
    })
    @ApiOkResponse({
        description: 'Lista de pacientes obtenida exitosamente',
        type: [UsuarioResponseDto],
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    async listarPacientes(): Promise<
        UsuarioResponseDto[] | ListaVaciaResponseDto
    > {
        const pacientes = await this.peopleService.listarUserRol(Rol.Paciente);
        if (pacientes.length === 0)
            return { msg: 'La lista de pacientes está vacía' };
        return pacientes as UsuarioResponseDto[];
    }

    /**
     * Obtiene estadísticas de usuarios del sistema (solo admins)
     */
    @Get('stats')
    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener estadísticas de usuarios',
        description:
            'Devuelve el número total de médicos y pacientes registrados y verificados en el sistema. ' +
            'Solo accesible por administradores.',
    })
    @ApiOkResponse({
        description: 'Estadísticas obtenidas exitosamente',
        type: StatsApiResponseDto,
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async getStats(): Promise<StatsApiResponseDto> {
        const totalMedicos = await this.peopleService.countUsuariosByRol(
            Rol.Medico,
        );
        const totalPacientes = await this.peopleService.countUsuariosByRol(
            Rol.Paciente,
        );

        return {
            message: 'Estadísticas obtenidas exitosamente',
            data: {
                totalMedicos,
                totalPacientes,
            },
        };
    }
}
