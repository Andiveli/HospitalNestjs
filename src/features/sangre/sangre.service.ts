import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrupoSanguineoEntity } from './sangre.entity';

@Injectable()
export class SangreService {
    constructor(
        @InjectRepository(GrupoSanguineoEntity)
        private readonly sangreRepository: Repository<GrupoSanguineoEntity>,
    ) {}

    /**
     * Crea un nuevo grupo sanguíneo
     * @param nombre - Nombre del grupo sanguíneo
     * @returns El grupo sanguíneo creado
     */
    async create(nombre: string): Promise<GrupoSanguineoEntity> {
        const existe = await this.sangreRepository.findOne({
            where: { nombre },
        });

        if (existe) {
            throw new ConflictException(
                'Ya existe un grupo sanguíneo con ese nombre',
            );
        }

        const sangre = this.sangreRepository.create({ nombre });
        return await this.sangreRepository.save(sangre);
    }

    /**
     * Obtiene todos los grupos sanguíneos
     * @returns Lista de grupos sanguíneos
     */
    async findAll(): Promise<GrupoSanguineoEntity[]> {
        return await this.sangreRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene un grupo sanguíneo por ID
     * @param id - ID del grupo sanguíneo
     * @returns El grupo sanguíneo encontrado
     */
    async findById(id: number): Promise<GrupoSanguineoEntity> {
        const sangre = await this.sangreRepository.findOne({
            where: { id },
        });

        if (!sangre) {
            throw new NotFoundException(
                `Grupo sanguíneo con ID ${id} no encontrado`,
            );
        }

        return sangre;
    }

    /**
     * Actualiza un grupo sanguíneo existente
     * @param id - ID del grupo sanguíneo
     * @param nombre - Nuevo nombre
     * @returns El grupo sanguíneo actualizado
     */
    async update(id: number, nombre?: string): Promise<GrupoSanguineoEntity> {
        const sangre = await this.findById(id);

        if (!nombre) {
            throw new BadRequestException(
                'Debe proporcionar un nombre para actualizar',
            );
        }

        const existeOtro = await this.sangreRepository.findOne({
            where: { nombre },
        });

        if (existeOtro && existeOtro.id !== id) {
            throw new ConflictException(
                'Ya existe otro grupo sanguíneo con ese nombre',
            );
        }

        sangre.nombre = nombre;
        return await this.sangreRepository.save(sangre);
    }

    /**
     * Elimina un grupo sanguíneo
     * @param id - ID del grupo sanguíneo a eliminar
     */
    async delete(id: number): Promise<void> {
        const sangre = await this.findById(id);
        await this.sangreRepository.remove(sangre);
    }
}
