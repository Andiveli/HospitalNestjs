import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    UseGuards,
    HttpException,
    Get,
    Param,
    ParseIntPipe,
    Patch,
} from '@nestjs/common';
import { PeopleGuard } from 'src/people/people.guard';
import { TipoEnfermedadService } from './tipo-enfermedad.service';
import { UpdateDto } from './dto/updateDto';
import { TiposEnfermedadEntity } from './tipo-enfermedad.entity';

@Controller('tipo-enfermedad')
export class TipoEnfermedadController {
    constructor(private readonly tipoService: TipoEnfermedadService) {}

    @UseGuards(PeopleGuard)
    @Post('addTipo')
    @HttpCode(HttpStatus.CREATED)
    async addTipo(@Body() body: UpdateDto): Promise<{ msg: string }> {
        const result = await this.tipoService.addTipo(body);
        if (!result) {
            throw new HttpException(
                'Error al agregar el tipo de enfermedad',
                HttpStatus.BAD_REQUEST,
            );
        }
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
        const tipo = await this.tipoService.getTipoById(id);
        if (!tipo) {
            throw new HttpException(
                { msg: 'Tipo invalido, no existe' },
                HttpStatus.BAD_REQUEST,
            );
        }
        return { msg: tipo };
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
