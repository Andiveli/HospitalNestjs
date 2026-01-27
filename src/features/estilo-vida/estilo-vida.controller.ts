import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
} from '@nestjs/common';
import { EstiloVidaService } from './estilo-vida.service';
import { EstiloVidaEntity } from './estilo-vida.entity';
import { PaisEntity } from '../paises/paises.entity';
import { PeopleGuard } from '../people/people.guard';

@Controller('estilo-vida')
export class EstiloVidaController {
    constructor(private readonly estiloService: EstiloVidaService) {}

    @UseGuards(PeopleGuard)
    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    async crear(
        @Body('nombre') nombre: string,
    ): Promise<{ msg: string; data: EstiloVidaEntity }> {
        const result = await this.estiloService.crearEstilo(nombre);
        return { msg: 'Estilo de vida creado', data: result };
    }

    @UseGuards(PeopleGuard)
    @Post('listar')
    @HttpCode(HttpStatus.OK)
    async listar(): Promise<PaisEntity[] | { message: string }> {
        const estilos = await this.estiloService.listarEstilo();
        if (estilos.length === 0)
            return { message: 'No hay estilos de vida registrados' };
        return estilos;
    }
}
