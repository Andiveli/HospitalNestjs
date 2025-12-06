import {
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Body,
    UseGuards,
} from '@nestjs/common';
import { PeopleGuard } from 'src/people/people.guard';
import { PaisesService } from './paises.service';
import { PaisEntity } from './paises.entity';

@Controller('paises')
export class PaisesController {
    constructor(private readonly paisesService: PaisesService) {}

    @UseGuards(PeopleGuard)
    @Post('add')
    @HttpCode(HttpStatus.CREATED)
    async crear(
        @Body('nombre') nombre: string,
    ): Promise<{ msg: string; data: PaisEntity }> {
        const result = await this.paisesService.crearPais(nombre);
        return { msg: 'País creado', data: result };
    }

    @UseGuards(PeopleGuard)
    @Post('listar')
    @HttpCode(HttpStatus.OK)
    async listar(): Promise<PaisEntity[] | { message: string }> {
        const paises = await this.paisesService.listarPaises();
        if (paises.length === 0)
            return { message: 'No hay países registrados' };
        return paises;
    }
}
