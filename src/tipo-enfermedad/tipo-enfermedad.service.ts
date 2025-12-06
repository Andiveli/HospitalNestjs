import { Injectable, NotFoundException } from '@nestjs/common';
import { TiposEnfermedadEntity } from './tipo-enfermedad.entity';
import { Repository } from 'typeorm';
import { UpdateDto } from './dto/updateDto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TipoEnfermedadService {
    constructor(
        @InjectRepository(TiposEnfermedadEntity)
        private readonly tipoRepository: Repository<TiposEnfermedadEntity>,
    ) {}

    async addTipo(tipo: UpdateDto): Promise<boolean> {
        const { nombre } = tipo;
        const existe = await this.tipoRepository.findOne({ where: { nombre } });
        if (existe) return false;
        const nuevoTipo = this.tipoRepository.create(tipo);
        const resultado = await this.tipoRepository.save(nuevoTipo);
        return resultado ? true : false;
    }

    async getTipos() {
        const listaTipos = await this.tipoRepository.find();
        return listaTipos;
    }

    async getTipoById(id: number): Promise<TiposEnfermedadEntity | null> {
        return await this.tipoRepository.findOne({ where: { id } });
    }

    async updateTipo(
        id: number,
        nombre: UpdateDto,
    ): Promise<TiposEnfermedadEntity | null> {
        const tipo = await this.tipoRepository.findOne({ where: { id } });
        if (!tipo) {
            throw new NotFoundException('Tipo no encontrado');
        }
        Object.assign(tipo, nombre);
        return await this.tipoRepository.save(tipo);
    }
}
