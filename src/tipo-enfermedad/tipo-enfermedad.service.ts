import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
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

    async addTipo(tipo: UpdateDto): Promise<TiposEnfermedadEntity> {
        const { nombre } = tipo;
        const existe = await this.tipoRepository.findOne({ where: { nombre } });
        if (existe)
            throw new ConflictException('El tipo de enfermedad ya existe');
        const nuevoTipo = this.tipoRepository.create(tipo);
        const resultado = await this.tipoRepository.save(nuevoTipo);
        return resultado;
    }

    async getTipos() {
        const listaTipos = await this.tipoRepository.find();
        return listaTipos;
    }

    async getTipoById(id: number): Promise<TiposEnfermedadEntity | null> {
        const tipo = await this.tipoRepository.findOne({ where: { id } });
        if (!tipo) throw new NotFoundException('Tipo no encontrado');
        return tipo;
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
