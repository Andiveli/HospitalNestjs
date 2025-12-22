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
import { PeopleGuard } from 'src/people/people.guard';
import { EnfermedadDto } from './dto/enfermedad.dto';
import { EnfermedadesEntity } from './enfermedades.entity';
import { EnfermedadesService } from './enfermedades.service';

@Controller('enfermedades')
export class EnfermedadesController {
    constructor(private readonly enfermedadesService: EnfermedadesService) {}

    @UseGuards(PeopleGuard)
    @Post('addEnfermedad')
    @HttpCode(HttpStatus.CREATED)
    async addEnfermedad(@Body() body: EnfermedadDto): Promise<{ msg: string }> {
        await this.enfermedadesService.addEnfermedad(body);
        return { msg: 'Enfermedad agregada correctamente' };
    }

    @UseGuards(PeopleGuard)
    @Get('listEnfermedades')
    @HttpCode(HttpStatus.OK)
    async getEnfermedades(): Promise<EnfermedadesEntity[] | { msg: string }> {
        const enfermedades = await this.enfermedadesService.getEnfermedades();
        if (enfermedades.length === 0)
            return { msg: 'No hay enfermedades registradas' };
        return enfermedades;
    }

    @UseGuards(PeopleGuard)
    @Get('enfermedad/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async getEnfermedad(@Param('id', ParseIntPipe) id: number) {
        return await this.enfermedadesService.getEnfermedad(id);
    }

    @UseGuards(PeopleGuard)
    @Patch('enfermedad/:id')
    @HttpCode(HttpStatus.ACCEPTED)
    async updateEnfermedad(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: Partial<EnfermedadDto>,
    ): Promise<{ msg: string }> {
        await this.enfermedadesService.updateEnfermedad(id, body);
        return { msg: 'Enfermedad actualizado correctamente' };
    }
}
