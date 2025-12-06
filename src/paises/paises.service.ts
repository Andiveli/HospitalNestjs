import { ConflictException, Injectable } from '@nestjs/common';
import { PaisEntity } from './paises.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PaisesService {
    constructor(
        @InjectRepository(PaisEntity)
        private paisRepository: Repository<PaisEntity>,
    ) {}

    async crearPais(nombre: string): Promise<PaisEntity> {
        const existe = await this.paisRepository.findOneBy({ nombre });
        if (existe) throw new ConflictException('El país ya existe');
        const pais = this.paisRepository.create({ nombre });
        return await this.paisRepository.save(pais);
    }

    async listarPaises(): Promise<PaisEntity[]> {
        return await this.paisRepository.find();
    }
}
