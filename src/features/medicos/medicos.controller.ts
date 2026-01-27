import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { AssignMedicoDto } from './dto/assign-medico.dto';
import {
    CreateMedicoResponseDto,
    GetMedicosResponseDto,
} from './dto/medico-response.dto';
import { MedicosService } from './medicos.service';

class EspecialidadCatalogoDto {
    id!: number;
    nombre!: string;
    descripcion?: string;
}

class DiaAtencionCatalogoDto {
    id!: number;
    nombre!: string;
}

@ApiTags('Médicos')
@Controller('medicos')
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) {}

    @Post('assign')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Asignar rol de médico a un usuario existente',
        description:
            'Convierte un paciente existente en médico, asignando especialidades y horarios de atención',
    })
    @ApiCreatedResponse({
        description: 'Médico asignado correctamente',
        type: CreateMedicoResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Solicitud inválida - Datos incorrectos o validaciones fallidas',
    })
    @ApiConflictResponse({
        description: 'El usuario ya está registrado como médico',
    })
    @ApiNotFoundResponse({
        description: 'Usuario, especialidad o rol no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async assignMedico(
        @Body() assignMedicoDto: AssignMedicoDto,
    ): Promise<CreateMedicoResponseDto> {
        return await this.medicosService.assignMedico(assignMedicoDto);
    }

    @Get()
    @Roles(Rol.Admin, Rol.Medico)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener lista de médicos',
        description:
            'Retorna todos los médicos con sus especialidades y horarios',
    })
    @ApiOkResponse({
        description: 'Médicos recuperados correctamente',
        type: GetMedicosResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'Parámetros de paginación inválidos',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador o médico',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Número de página (por defecto: 1)',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Límite de resultados por página (por defecto: 10)',
    })
    async getMedicos(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ): Promise<GetMedicosResponseDto> {
        return await this.medicosService.getMedicos(
            page ? parseInt(page.toString()) : 1,
            limit ? parseInt(limit.toString()) : 10,
        );
    }

    @Get(':id')
    @Roles(Rol.Admin, Rol.Medico)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener médico por ID',
        description: 'Retorna la información completa de un médico específico',
    })
    @ApiOkResponse({
        description: 'Médico recuperado correctamente',
        type: CreateMedicoResponseDto,
    })
    @ApiBadRequestResponse({
        description: 'ID de médico inválido',
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador o médico',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del médico (usuario_id)',
        type: Number,
    })
    async getMedicoById(
        @Param('id') id: number,
    ): Promise<CreateMedicoResponseDto> {
        return await this.medicosService.getMedicoById(parseInt(id.toString()));
    }

    @Put(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Actualizar información de médico',
        description:
            'Actualiza los datos de un médico existente (especialidades y horarios)',
    })
    @ApiOkResponse({
        description: 'Médico actualizado correctamente',
        type: CreateMedicoResponseDto,
    })
    @ApiBadRequestResponse({
        description:
            'Solicitud inválida - Datos incorrectos o validaciones fallidas',
    })
    @ApiNotFoundResponse({
        description: 'Médico, especialidad o día no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del médico (usuario_id)',
        type: Number,
    })
    async updateMedico(
        @Param('id') id: number,
        @Body() assignMedicoDto: AssignMedicoDto,
    ): Promise<CreateMedicoResponseDto> {
        // Asegurarse de que el DTO contenga el ID correcto
        const updateDto = {
            ...assignMedicoDto,
            usuarioId: parseInt(id.toString()),
        };
        return await this.medicosService.updateMedico(
            parseInt(id.toString()),
            updateDto,
        );
    }

    @Delete(':id')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Eliminar médico',
        description: 'Elimina un médico y revierte su rol a paciente',
    })
    @ApiOkResponse({
        description: 'Médico eliminado correctamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Médico eliminado correctamente',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'ID de médico inválido',
    })
    @ApiNotFoundResponse({
        description: 'Médico no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    @ApiParam({
        name: 'id',
        description: 'ID del médico (usuario_id)',
        type: Number,
    })
    async deleteMedico(@Param('id') id: number): Promise<{ message: string }> {
        return await this.medicosService.deleteMedico(parseInt(id.toString()));
    }

    @Get('especialidades/disponibles')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener especialidades disponibles',
        description:
            'Retorna todas las especialidades disponibles para asignar a médicos',
    })
    @ApiOkResponse({
        description: 'Especialidades recuperadas correctamente',
        type: [EspecialidadCatalogoDto],
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async getEspecialidadesDisponibles(): Promise<EspecialidadCatalogoDto[]> {
        return await this.medicosService.getEspecialidadesDisponibles();
    }

    @Get('dias/disponibles')
    @Roles(Rol.Admin)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener días de atención disponibles',
        description:
            'Retorna todos los días de la semana disponibles para horarios',
    })
    @ApiOkResponse({
        description: 'Días recuperados correctamente',
        type: [DiaAtencionCatalogoDto],
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - Token inválido o ausente',
    })
    @ApiForbiddenResponse({
        description: 'Prohibido - Se requiere rol de administrador',
    })
    async getDiasDisponibles(): Promise<DiaAtencionCatalogoDto[]> {
        return await this.medicosService.getDiasDisponibles();
    }
}
