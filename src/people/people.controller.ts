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

@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    @UseGuards(PeopleGuard)
    @Post('medico')
    @HttpCode(HttpStatus.CREATED)
    async crearMedico(@Body() medico: CrearDto) {
        return this.peopleService.crearMedico(medico);
    }

    @UseGuards(PeopleGuard)
    @Post('paciente')
    @HttpCode(HttpStatus.CREATED)
    async crearPaciente(@Body() paciente: CrearDto) {
        return this.peopleService.crearPaciente(paciente);
    }

    @UseGuards(PeopleGuard)
    @Get('medicos')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarMedicos() {
        return this.peopleService.listarMedicos();
    }

    @UseGuards(PeopleGuard)
    @Get('pacientes')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarPacientes() {
        return this.peopleService.listarPacientes();
    }
}
