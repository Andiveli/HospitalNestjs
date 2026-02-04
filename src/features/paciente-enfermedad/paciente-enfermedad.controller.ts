import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { CreatePacienteEnfermedadDto } from './dto/create.dto';
import { UpdatePacienteEnfermedadDto } from './dto/update.dto';
import { PacienteEnfermedadEntity } from './paciente-enfermedad.entity';
import { PacienteEnfermedadService } from './paciente-enfermedad.service';

/**
 * Controlador para gestionar la relación entre pacientes y enfermedades
 * Permite asociar enfermedades, alergias y antecedentes médicos a pacientes
 * Solo médicos pueden crear, modificar o eliminar estas relaciones
 */
@ApiTags('Paciente-Enfermedad')
@ApiBearerAuth()
@Controller('paciente-enfermedad')
export class PacienteEnfermedadController {
    constructor(
        private readonly pacienteEnfermedadService: PacienteEnfermedadService,
    ) {}

    /**
     * Crea una nueva relación paciente-enfermedad
     */
    @Roles(Rol.Medico)
    @Post()
    @ApiOperation({
        summary: 'Crear una nueva relación paciente-enfermedad',
        description:
            'Registra una nueva relación entre un paciente y una enfermedad con su tipo y detalles correspondientes',
    })
    @ApiCreatedResponse({
        description: 'Relación creada exitosamente',
        type: PacienteEnfermedadEntity,
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiConflictResponse({
        description: 'El paciente ya tiene esta enfermedad registrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden crear estas relaciones',
    })
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createDto: CreatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        return await this.pacienteEnfermedadService.create(createDto);
    }

    /**
     * Obtiene todas las relaciones paciente-enfermedad
     */
    @Roles(Rol.Medico)
    @Get()
    @ApiOperation({
        summary: 'Obtener todas las relaciones paciente-enfermedad',
        description:
            'Devuelve una lista completa de todas las relaciones entre pacientes y enfermedades registradas',
    })
    @ApiOkResponse({
        description: 'Lista obtenida exitosamente',
        type: [PacienteEnfermedadEntity],
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden acceder',
    })
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findAll();
    }

    /**
     * Obtiene enfermedades de un paciente específico
     */
    @Roles(Rol.Medico)
    @Get('paciente/:pacienteId')
    @ApiOperation({
        summary: 'Obtener enfermedades de un paciente específico',
        description:
            'Devuelve todas las enfermedades registradas para un paciente específico con sus detalles',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente (usuario_id)',
        example: 10,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Lista de enfermedades del paciente',
        type: [PacienteEnfermedadEntity],
    })
    @ApiNotFoundResponse({
        description: 'Paciente no encontrado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden acceder',
    })
    @HttpCode(HttpStatus.OK)
    findByPaciente(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findByPaciente(pacienteId);
    }

    /**
     * Obtiene pacientes con una enfermedad específica
     */
    @Roles(Rol.Medico)
    @Get('enfermedad/:enfermedadId')
    @ApiOperation({
        summary: 'Obtener pacientes con una enfermedad específica',
        description:
            'Devuelve todos los pacientes que tienen registrada una enfermedad específica',
    })
    @ApiParam({
        name: 'enfermedadId',
        description: 'ID de la enfermedad',
        example: 5,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Lista de pacientes con la enfermedad',
        type: [PacienteEnfermedadEntity],
    })
    @ApiNotFoundResponse({
        description: 'Enfermedad no encontrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden acceder',
    })
    @HttpCode(HttpStatus.OK)
    findByEnfermedad(
        @Param('enfermedadId', ParseIntPipe) enfermedadId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findByEnfermedad(enfermedadId);
    }

    /**
     * Obtiene una relación específica paciente-enfermedad
     */
    @Roles(Rol.Medico)
    @Get(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Obtener una relación específica paciente-enfermedad',
        description:
            'Devuelve los detalles de una relación específica entre un paciente y una enfermedad',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente',
        example: 10,
        type: Number,
    })
    @ApiParam({
        name: 'enfermedadId',
        description: 'ID de la enfermedad',
        example: 5,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Relación encontrada',
        type: PacienteEnfermedadEntity,
    })
    @ApiNotFoundResponse({
        description: 'Relación paciente-enfermedad no encontrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden acceder',
    })
    @HttpCode(HttpStatus.OK)
    findOne(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @Param('enfermedadId', ParseIntPipe) enfermedadId: number,
    ): Promise<PacienteEnfermedadEntity> {
        return this.pacienteEnfermedadService.findOne(pacienteId, enfermedadId);
    }

    /**
     * Actualiza una relación paciente-enfermedad
     */
    @Roles(Rol.Medico)
    @Patch(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Actualizar una relación paciente-enfermedad',
        description:
            'Actualiza los detalles de una relación existente entre paciente y enfermedad',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente',
        example: 10,
        type: Number,
    })
    @ApiParam({
        name: 'enfermedadId',
        description: 'ID de la enfermedad',
        example: 5,
        type: Number,
    })
    @ApiOkResponse({
        description: 'Relación actualizada exitosamente',
        type: PacienteEnfermedadEntity,
    })
    @ApiNotFoundResponse({
        description: 'Relación no encontrada',
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden modificar',
    })
    @HttpCode(HttpStatus.OK)
    update(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @Param('enfermedadId', ParseIntPipe) enfermedadId: number,
        @Body(ValidationPipe) updateDto: UpdatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        return this.pacienteEnfermedadService.update(
            pacienteId,
            enfermedadId,
            updateDto,
        );
    }

    /**
     * Elimina una relación paciente-enfermedad
     */
    @Roles(Rol.Medico)
    @Delete(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Eliminar una relación paciente-enfermedad',
        description:
            'Elimina permanentemente una relación entre paciente y enfermedad del sistema',
    })
    @ApiParam({
        name: 'pacienteId',
        description: 'ID del paciente',
        example: 10,
        type: Number,
    })
    @ApiParam({
        name: 'enfermedadId',
        description: 'ID de la enfermedad',
        example: 5,
        type: Number,
    })
    @ApiNoContentResponse({
        description: 'Relación eliminada exitosamente',
    })
    @ApiNotFoundResponse({
        description: 'Relación no encontrada',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado',
    })
    @ApiForbiddenResponse({
        description: 'Solo médicos pueden eliminar',
    })
    remove(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @Param('enfermedadId', ParseIntPipe) enfermedadId: number,
    ): Promise<void> {
        return this.pacienteEnfermedadService.remove(pacienteId, enfermedadId);
    }
}
