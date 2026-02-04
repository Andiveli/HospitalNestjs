import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnfermedadesEntity } from './enfermedades.entity';
import { EnfermedadInterface } from './enfermedades.interface';

/**
 * Servicio para gestionar el catálogo de enfermedades
 * Proporciona operaciones CRUD para enfermedades médicas
 */
@Injectable()
export class EnfermedadesService {
    constructor(
        @InjectRepository(EnfermedadesEntity)
        private readonly enfermedadRepository: Repository<EnfermedadesEntity>,
    ) {}

    /**
     * Crea una nueva enfermedad en el catálogo
     * @param data - Datos de la enfermedad a crear
     * @returns La enfermedad creada
     * @throws ConflictException si ya existe una enfermedad con el mismo nombre
     */
    async addEnfermedad(
        data: EnfermedadInterface,
    ): Promise<EnfermedadesEntity> {
        const existe = await this.enfermedadRepository.findOne({
            where: { nombre: data.nombre },
        });

        if (existe) {
            throw new ConflictException(
                `Ya existe una enfermedad con el nombre "${data.nombre}"`,
            );
        }

        const enfermedad = this.enfermedadRepository.create(data);
        return await this.enfermedadRepository.save(enfermedad);
    }

    /**
     * Obtiene todas las enfermedades del catálogo
     * @returns Array con todas las enfermedades
     */
    async getEnfermedades(): Promise<EnfermedadesEntity[]> {
        return await this.enfermedadRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene una enfermedad específica por ID
     * @param id - ID de la enfermedad
     * @returns La enfermedad encontrada
     * @throws NotFoundException si no existe la enfermedad
     */
    async getEnfermedad(id: number): Promise<EnfermedadesEntity> {
        const enfermedad = await this.enfermedadRepository.findOne({
            where: { id },
        });

        if (!enfermedad) {
            throw new NotFoundException(
                `Enfermedad con ID ${id} no encontrada`,
            );
        }

        return enfermedad;
    }

    /**
     * Actualiza una enfermedad existente
     * @param id - ID de la enfermedad a actualizar
     * @param data - Datos parciales a actualizar
     * @returns La enfermedad actualizada
     * @throws NotFoundException si no existe la enfermedad
     * @throws ConflictException si el nuevo nombre ya existe
     */
    async updateEnfermedad(
        id: number,
        data: Partial<EnfermedadInterface>,
    ): Promise<EnfermedadesEntity> {
        const enfermedad = await this.getEnfermedad(id);

        // Si se está actualizando el nombre, verificar que no exista otro con ese nombre
        if (data.nombre && data.nombre !== enfermedad.nombre) {
            const existe = await this.enfermedadRepository.findOne({
                where: { nombre: data.nombre },
            });

            if (existe) {
                throw new ConflictException(
                    `Ya existe una enfermedad con el nombre "${data.nombre}"`,
                );
            }
        }

        // Actualizar solo los campos proporcionados
        if (data.nombre !== undefined) {
            enfermedad.nombre = data.nombre;
        }
        if (data.descripcion !== undefined) {
            enfermedad.descripcion = data.descripcion;
        }

        return await this.enfermedadRepository.save(enfermedad);
    }
}
