import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { CrearDto } from './dto/crear.dto';
import { PeopleService } from './people.service';
import { PeopleGuard } from './people.guard';
import { Rol } from 'src/roles/roles.enum';

@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    @UseGuards(PeopleGuard)
    @Post('medico')
    @HttpCode(HttpStatus.CREATED)
    async crearMedico(@Body() medico: CrearDto) {
        await this.peopleService.rolToPerson(medico.email, Rol.Medico);
    }

    @UseGuards(PeopleGuard)
    @Post('paciente')
    @HttpCode(HttpStatus.CREATED)
    async crearPaciente(@Body() paciente: CrearDto) {
        return this.peopleService.rolToPerson(paciente.email, Rol.Paciente);
    }

    @UseGuards(PeopleGuard)
    @Get('medicos')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarMedicos() {
        const medicos = await this.peopleService.listarUserRol(Rol.Medico);
        if (medicos.length === 0)
            return { msg: 'La lista de médicos está vacía' };
    }

    @UseGuards(PeopleGuard)
    @Get('pacientes')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarPacientes() {
        const pacientes = await this.peopleService.listarUserRol(Rol.Paciente);
        if (pacientes.length === 0)
            return { msg: 'La lista de pacientes está vacía' };
    }
}
