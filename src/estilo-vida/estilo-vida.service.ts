import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstiloVidaEntity } from './estilo-vida.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EstiloVidaService {
    constructor(
        @InjectRepository(EstiloVidaEntity)
        private estilo: Repository<EstiloVidaEntity>,
    ) {}

    async crearEstilo(nombre: string): Promise<EstiloVidaEntity> {
        const existe = await this.estilo.findOne({ where: { nombre } });
        if (existe) throw new ConflictException('El estilo de vida ya existe');
        const estilo = this.estilo.create({ nombre });
        return await this.estilo.save(estilo);
    }

    async listarEstilo(): Promise<EstiloVidaEntity[]> {
        return await this.estilo.find();
    }
}
