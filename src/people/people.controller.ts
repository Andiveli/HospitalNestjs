import { Body, Controller, Get, Post } from '@nestjs/common';
import { PeopleService } from './people.service';
import { CrearDto } from './dto/crear.dto';

@Controller('people')
export class PeopleController {
    constructor(
        private readonly peopleService: PeopleService
    ) {}

    @Post('/medico')
    async crearMedico(@Body() medico: CrearDto) {
        return this.peopleService.crearMedico(medico);
    }

    @Post('/paciente')
    async crearPaciente(@Body() paciente: CrearDto) {
        return this.peopleService.crearPaciente(paciente);
    }

    @Get('/medicos')
    async listarMedicos() {
        return this.peopleService.listarMedicos();
    }

    @Get('/pacientes')
    async listarPacientes() {
        return this.peopleService.listarPacientes();
    }

    async reservarCita() {
        return {msg: "Reservando cita..."}
    }
}
