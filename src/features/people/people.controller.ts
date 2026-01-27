import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
// import { Public } from 'src/auth/public.decorator';
import { CrearDto } from './dto/crear.dto';
import { PeopleService } from './people.service';
import { PeopleGuard } from './people.guard';
import { Rol } from '../roles/roles.enum';

@Controller('people')
export class PeopleController {
    constructor(private readonly peopleService: PeopleService) {}

    @UseGuards(PeopleGuard)
    @Post('medico')
    @HttpCode(HttpStatus.CREATED)
    async crearMedico(@Body() medico: CrearDto): Promise<{ msg: string }> {
        await this.peopleService.rolToPerson(medico.email, Rol.Medico);
        return { msg: 'Médico creado exitosamente' };
    }

    @UseGuards(PeopleGuard)
    @Post('paciente')
    @HttpCode(HttpStatus.CREATED)
    async crearPaciente(@Body() paciente: CrearDto): Promise<{ msg: string }> {
        await this.peopleService.rolToPerson(paciente.email, Rol.Paciente);
        return { msg: 'Paciente creado exitosamente' };
    }

    @UseGuards(PeopleGuard)
    @Get('medicos')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarMedicos() {
        const medicos = await this.peopleService.listarUserRol(Rol.Medico);
        if (medicos.length === 0)
            return { msg: 'La lista de médicos está vacía' };
        return medicos;
    }

    @UseGuards(PeopleGuard)
    @Get('pacientes')
    @HttpCode(HttpStatus.ACCEPTED)
    async listarPacientes() {
        const pacientes = await this.peopleService.listarUserRol(Rol.Paciente);
        if (pacientes.length === 0)
            return { msg: 'La lista de pacientes está vacía' };
        return pacientes;
    }
}
