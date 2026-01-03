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
import { PacientesEntity } from './pacientes.entity';
import { ApiBadRequestResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('pacientes')
export class PacientesController {
    constructor(private readonly pacientesService: PacientesService) {}

    @Roles(Rol.Paciente)
    @Post('addInfo')
    @HttpCode(HttpStatus.CREATED)
    async addInfo(
        @Request() req: UserRequest,
        @Body() body: InfoDto,
    ): Promise<{ msg: string; data: PacientesEntity }> {
        const result = await this.pacientesService.addInfo(
            body,
            req.user.email,
        );
        return { msg: 'Información agregada correctamente', data: result };
    }

    @Roles(Rol.Paciente)
    @Get('myInfo')
    @ApiOperation({
        summary: 'Obtener la información del paciente autenticado',
        description:
            'Obtiene la información detallada del paciente que ha iniciado sesión',
    })
    @ApiOkResponse({ description: 'Información obtenida correctamente.' })
    @ApiBadRequestResponse()
    @ApiForbiddenResponse({ description: 'Acceso denegado.' })
    @ApiNotFoundResponse({ description: 'Paciente no encontrado' })
    @HttpCode(HttpStatus.OK)
    async getInfo(@Request() req: UserRequest) {
        const result = await this.pacientesService.getInfo(req.user.id);
        return result;
    }

    @Roles(Rol.Paciente)
    @Post('addDocs')
    @HttpCode(HttpStatus.ACCEPTED)
    addDocs(@Request() req: UserRequest, @Body() body: DocsDto) {
        console.log('Agregando datos');
    }
}
