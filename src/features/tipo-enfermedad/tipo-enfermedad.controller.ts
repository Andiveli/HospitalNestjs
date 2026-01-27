import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import { UpdateDto } from './dto/updateDto';
import { TiposEnfermedadEntity } from './tipo-enfermedad.entity';
import { TipoEnfermedadService } from './tipo-enfermedad.service';
import { PeopleGuard } from '../people/people.guard';

@Controller('tipo-enfermedad')
export class TipoEnfermedadController {
    constructor(private readonly tipoService: TipoEnfermedadService) {}

    @UseGuards(PeopleGuard)
    @Post('addTipo')
    @HttpCode(HttpStatus.CREATED)
    async addTipo(@Body() body: UpdateDto): Promise<{ msg: string }> {
        await this.tipoService.addTipo(body);
        return { msg: 'Tipo de enfermedad agregado correctamente' };
    }

    @UseGuards(PeopleGuard)
    @Get('tipos')
    @HttpCode(HttpStatus.OK)
    async getTipos(): Promise<{ msg: string; data?: TiposEnfermedadEntity[] }> {
        const listaTipos = await this.tipoService.getTipos();
        if (listaTipos.length === 0) {
            return { msg: 'No hay tipos de enfermedades registrados aun' };
        }
        return { msg: 'Lista de Tipos de enfermedad', data: listaTipos };
    }

    @UseGuards(PeopleGuard)
    @Get('tipos/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getTipoById(@Param('id', ParseIntPipe) id: number) {
        return await this.tipoService.getTipoById(id);
    }

    @UseGuards(PeopleGuard)
    @Patch('tipos/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateTipo(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateDto,
    ): Promise<{ msg: string }> {
        await this.tipoService.updateTipo(id, body);
        return { msg: 'Tipo actualizado correctamente' };
    }
}
