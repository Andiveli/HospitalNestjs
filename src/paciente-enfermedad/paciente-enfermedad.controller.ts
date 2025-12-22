import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { Rol } from 'src/roles/roles.enum';
import { SWAGGER_RESPONSES } from '../common/constants/swagger.constants';
import { CreatePacienteEnfermedadDto } from './dto/create.dto';
import { UpdatePacienteEnfermedadDto } from './dto/update.dto';
import { PacienteEnfermedadEntity } from './paciente-enfermedad.entity';
import { PacienteEnfermedadService } from './paciente-enfermedad.service';

@Controller('paciente-enfermedad')
export class PacienteEnfermedadController {
    constructor(
        private readonly pacienteEnfermedadService: PacienteEnfermedadService,
    ) {}

    @Roles(Rol.Medico)
    @Post()
    @ApiOperation({
        summary: 'Crear una nueva relación paciente-enfermedad',
        description:
            'Registra una nueva relación entre un paciente y una enfermedad con su tipo y detalles correspondientes',
    })
    @ApiResponse(SWAGGER_RESPONSES.CREATED(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.BAD_REQUEST)
    @ApiResponse(SWAGGER_RESPONSES.CONFLICT)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @ApiResponse(SWAGGER_RESPONSES.FORBIDDEN)
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body() createDto: CreatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        return await this.pacienteEnfermedadService.create(createDto);
    }

    @Roles(Rol.Medico)
    @Get()
    @ApiOperation({
        summary: 'Obtener todas las relaciones paciente-enfermedad',
        description:
            'Devuelve una lista completa de todas las relaciones entre pacientes y enfermedades registradas',
    })
    @ApiResponse(SWAGGER_RESPONSES.OK(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findAll();
    }

    @Roles(Rol.Medico)
    @Get('paciente/:pacienteId')
    @ApiOperation({
        summary: 'Obtener enfermedades de un paciente específico',
        description:
            'Devuelve todas las enfermedades registradas para un paciente específico con sus detalles',
    })
    @ApiResponse(SWAGGER_RESPONSES.OK(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.NOT_FOUND)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @HttpCode(HttpStatus.OK)
    findByPaciente(
        @Param('pacienteId') pacienteId: string,
    ): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findByPaciente(+pacienteId);
    }

    @Roles(Rol.Medico)
    @Get('enfermedad/:enfermedadId')
    @ApiOperation({
        summary: 'Obtener pacientes con una enfermedad específica',
        description:
            'Devuelve todos los pacientes que tienen registrada una enfermedad específica',
    })
    @ApiResponse(SWAGGER_RESPONSES.OK(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.NOT_FOUND)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @HttpCode(HttpStatus.OK)
    findByEnfermedad(
        @Param('enfermedadId') enfermedadId: string,
    ): Promise<PacienteEnfermedadEntity[]> {
        return this.pacienteEnfermedadService.findByEnfermedad(+enfermedadId);
    }

    @Roles(Rol.Medico)
    @Get(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Obtener una relación específica paciente-enfermedad',
        description:
            'Devuelve los detalles de una relación específica entre un paciente y una enfermedad',
    })
    @ApiResponse(SWAGGER_RESPONSES.OK(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.NOT_FOUND)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @HttpCode(HttpStatus.OK)
    findOne(
        @Param('pacienteId') pacienteId: string,
        @Param('enfermedadId') enfermedadId: string,
    ): Promise<PacienteEnfermedadEntity> {
        return this.pacienteEnfermedadService.findOne(
            +pacienteId,
            +enfermedadId,
        );
    }

    @Roles(Rol.Medico)
    @Patch(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Actualizar una relación paciente-enfermedad',
        description:
            'Actualiza los detalles de una relación existente entre paciente y enfermedad',
    })
    @ApiResponse(SWAGGER_RESPONSES.OK(PacienteEnfermedadEntity))
    @ApiResponse(SWAGGER_RESPONSES.NOT_FOUND)
    @ApiResponse(SWAGGER_RESPONSES.BAD_REQUEST)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @ApiResponse(SWAGGER_RESPONSES.FORBIDDEN)
    @HttpCode(HttpStatus.OK)
    update(
        @Param('pacienteId') pacienteId: string,
        @Param('enfermedadId') enfermedadId: string,
        @Body(ValidationPipe) updateDto: UpdatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        return this.pacienteEnfermedadService.update(
            +pacienteId,
            +enfermedadId,
            updateDto,
        );
    }

    @Roles(Rol.Medico)
    @Delete(':pacienteId/:enfermedadId')
    @ApiOperation({
        summary: 'Eliminar una relación paciente-enfermedad',
        description:
            'Elimina permanentemente una relación entre paciente y enfermedad del sistema',
    })
    @ApiResponse({ status: 204, description: 'Recurso eliminado exitosamente' })
    @ApiResponse(SWAGGER_RESPONSES.NOT_FOUND)
    @ApiResponse(SWAGGER_RESPONSES.UNAUTHORIZED)
    @ApiResponse(SWAGGER_RESPONSES.FORBIDDEN)
    remove(
        @Param('pacienteId') pacienteId: string,
        @Param('enfermedadId') enfermedadId: string,
    ): Promise<void> {
        return this.pacienteEnfermedadService.remove(
            +pacienteId,
            +enfermedadId,
        );
    }
}
