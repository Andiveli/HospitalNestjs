import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnfermedadesEntity } from './enfermedades.entity';
import { EnfermedadInterface } from './enfermedades.interface';

@Injectable()
export class EnfermedadesService {
    constructor(
        @InjectRepository(EnfermedadesEntity)
        private readonly enfermedadRepository: Repository<EnfermedadesEntity>,
    ) {}

    async addEnfermedad(data: EnfermedadInterface) {
        const existe = await this.enfermedadRepository.findOne({
            where: { nombre: data.nombre },
        });
        if (existe) throw new ConflictException('La enfermedad ya existe');
        const enfermedad = this.enfermedadRepository.create(data);
        return await this.enfermedadRepository.save(enfermedad);
    }

    async getEnfermedades(): Promise<EnfermedadesEntity[]> {
        const enfermedades = await this.enfermedadRepository.find();
        return enfermedades;
    }

    async getEnfermedad(id: number): Promise<EnfermedadesEntity> {
        const enfermedad = await this.enfermedadRepository.findOne({
            where: { id },
        });
        if (!enfermedad) throw new NotFoundException('La enfermedad no existe');
        return enfermedad;
    }

    async updateEnfermedad(id: number, data: Partial<EnfermedadInterface>) {
        const enfermedad = await this.getEnfermedad(id);
        if (!enfermedad) throw new NotFoundException('La enfermedad no existe');
        const updated = Object.assign(enfermedad, data);
        return await this.enfermedadRepository.save(updated);
    }
}
