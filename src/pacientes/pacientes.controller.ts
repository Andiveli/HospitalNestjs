import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Request,
    Get,
} from '@nestjs/common';
import { Roles } from 'src/roles/roles.decorator';
import { Rol } from 'src/roles/roles.enum';
import { PacientesService } from './pacientes.service';
import UserRequest from 'src/people/people.request';
import { InfoDto } from './dto/info.dto';
import { DocsDto } from './dto/doc.dto';

@Controller('pacientes')
export class PacientesController {
    constructor(private readonly pacientesService: PacientesService) {}

    @Roles(Rol.Paciente)
    @Post('addInfo')
    @HttpCode(HttpStatus.CREATED)
    async addInfo(@Request() req: UserRequest, @Body() body: InfoDto) {
        await this.pacientesService.addInfo(body, req.user.email);
    }

    @Roles(Rol.Paciente)
    @Get('myinfo')
    @HttpCode(HttpStatus.OK)
    async getInfo(@Request() req: UserRequest) {
        const result = await this.pacientesService.getInfo(req.user.id);
        console.log(result);
    }

    @Roles(Rol.Paciente)
    @Post('addDocs')
    @HttpCode(HttpStatus.ACCEPTED)
    addDocs(@Request() req: UserRequest, @Body() body: DocsDto) {
        console.log('Agregando datos');
    }
}
