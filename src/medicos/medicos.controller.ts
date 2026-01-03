import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
} from '@nestjs/common';
import UserRequest from 'src/people/people.request';
import { Roles } from 'src/roles/roles.decorator';
import { Rol } from 'src/roles/roles.enum';
import { AddMedicoDto, PerfilMedico } from './dto/addmedico.dto';
import { MedicosService } from './medicos.service';

@Controller('medicos')
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) {}

    @Roles(Rol.Admin)
    @Post('addinfo')
    @HttpCode(HttpStatus.OK)
    async addInfo(@Body() body: AddMedicoDto): Promise<{ msg: string }> {
        await this.medicosService.addInfo(body);
        return { msg: 'Información agregada correctamente' };
    }

    @Roles(Rol.Medico)
    @Get('myInfo')
    @HttpCode(HttpStatus.OK)
    async getMyInfo(@Request() req: UserRequest): Promise<PerfilMedico> {
        return await this.medicosService.myInfo(req.user.id);
    }
}
