import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Rol } from 'src/roles/roles.enum';
import { MedicosService } from './medicos.service';
import { Roles } from 'src/roles/roles.decorator';
import { MedicoDto } from './dto/medico.dto';

@Controller('medicos')
export class MedicosController {
    constructor(private readonly medicosService: MedicosService) {}

    @Roles(Rol.Admin)
    @Post('addinfo')
    @HttpCode(HttpStatus.OK)
    async addInfo(@Body() body: MedicoDto): Promise<{ msg: string }> {
        await this.medicosService.addInfo(body);
        return { msg: 'Información agregada correctamente' };
    }
}
