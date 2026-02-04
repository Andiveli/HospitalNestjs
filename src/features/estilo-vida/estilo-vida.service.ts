import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstiloVidaEntity } from './estilo-vida.entity';

@Injectable()
export class EstiloVidaService {
    constructor(
        @InjectRepository(EstiloVidaEntity)
        private readonly estiloVidaRepository: Repository<EstiloVidaEntity>,
    ) {}

    /**
     * Crea un nuevo estilo de vida
     * @param nombre - Nombre del estilo de vida
     * @returns El estilo de vida creado
     */
    async create(nombre: string): Promise<EstiloVidaEntity> {
        const existe = await this.estiloVidaRepository.findOne({
            where: { nombre },
        });

        if (existe) {
            throw new ConflictException(
                'Ya existe un estilo de vida con ese nombre',
            );
        }

        const estilo = this.estiloVidaRepository.create({ nombre });
        return await this.estiloVidaRepository.save(estilo);
    }

    /**
     * Obtiene todos los estilos de vida
     * @returns Lista de estilos de vida
     */
    async findAll(): Promise<EstiloVidaEntity[]> {
        return await this.estiloVidaRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene un estilo de vida por ID
     * @param id - ID del estilo de vida
     * @returns El estilo de vida encontrado
     */
    async findById(id: number): Promise<EstiloVidaEntity> {
        const estilo = await this.estiloVidaRepository.findOne({
            where: { id },
        });

        if (!estilo) {
            throw new NotFoundException(
                `Estilo de vida con ID ${id} no encontrado`,
            );
        }

        return estilo;
    }

    /**
     * Actualiza un estilo de vida existente
     * @param id - ID del estilo de vida
     * @param nombre - Nuevo nombre
     * @returns El estilo de vida actualizado
     */
    async update(id: number, nombre?: string): Promise<EstiloVidaEntity> {
        const estilo = await this.findById(id);

        if (!nombre) {
            throw new BadRequestException(
                'Debe proporcionar un nombre para actualizar',
            );
        }

        const existeOtro = await this.estiloVidaRepository.findOne({
            where: { nombre },
        });

        if (existeOtro && existeOtro.id !== id) {
            throw new ConflictException(
                'Ya existe otro estilo de vida con ese nombre',
            );
        }

        estilo.nombre = nombre;
        return await this.estiloVidaRepository.save(estilo);
    }

    /**
     * Elimina un estilo de vida
     * @param id - ID del estilo de vida a eliminar
     */
    async delete(id: number): Promise<void> {
        const estilo = await this.findById(id);
        await this.estiloVidaRepository.remove(estilo);
    }
}
