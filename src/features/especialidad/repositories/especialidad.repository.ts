import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EspecialidadEntity } from '../especialidad.entity';
import { CreateEspecialidadDto } from '../dto/create-especialidad.dto';
import { UpdateEspecialidadDto } from '../dto/update-especialidad.dto';
import { EspecialidadResponseDto } from '../dto/especialidad-response.dto';

/**
 * Repositorio para operaciones de base de datos de especialidades
 */
@Injectable()
export class EspecialidadRepository {
    /**
     * Constructor del repositorio de especialidades
     * @param especialidadRepository Repositorio de TypeORM para EspecialidadEntity
     */
    constructor(
        @InjectRepository(EspecialidadEntity)
        public readonly especialidadRepository: Repository<EspecialidadEntity>,
    ) {}

    /**
     * Crea una nueva especialidad en la base de datos
     * @param createDto Datos para crear la especialidad
     * @returns Entidad de especialidad creada
     */
    async create(
        createDto: CreateEspecialidadDto,
    ): Promise<EspecialidadEntity> {
        const especialidad = this.especialidadRepository.create(createDto);
        return await this.especialidadRepository.save(especialidad);
    }

    /**
     * Obtiene una lista paginada de especialidades
     * @param page Número de página (por defecto 1)
     * @param limit Límite de resultados por página (por defecto 10)
     * @returns Tupla con array de especialidades y total de registros
     */
    async findAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<[EspecialidadEntity[], number]> {
        return await this.especialidadRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    /**
     * Busca una especialidad por su ID
     * @param id ID de la especialidad
     * @returns Especialidad encontrada o null
     */
    async findById(id: number): Promise<EspecialidadEntity | null> {
        return await this.especialidadRepository.findOne({
            where: { id },
        });
    }

    /**
     * Busca una especialidad por su nombre
     * @param nombre Nombre de la especialidad
     * @returns Especialidad encontrada o null
     */
    async findByName(nombre: string): Promise<EspecialidadEntity | null> {
        return await this.especialidadRepository.findOne({ where: { nombre } });
    }

    /**
     * Actualiza una especialidad existente
     * @param id ID de la especialidad a actualizar
     * @param updateDto Datos a actualizar
     * @returns Especialidad actualizada o null si no existe
     */
    async update(
        id: number,
        updateDto: UpdateEspecialidadDto,
    ): Promise<EspecialidadEntity | null> {
        await this.especialidadRepository.update(id, updateDto);
        return await this.findById(id);
    }

    /**
     * Elimina una especialidad por su ID
     * @param id ID de la especialidad a eliminar
     */
    async delete(id: number): Promise<void> {
        await this.especialidadRepository.delete(id);
    }

    /**
     * Convierte una entidad de especialidad a DTO de respuesta
     * @param especialidad Entidad de especialidad
     * @returns DTO de respuesta
     */
    mapToDto(especialidad: EspecialidadEntity): EspecialidadResponseDto {
        return {
            id: especialidad.id,
            nombre: especialidad.nombre,
            descripcion: especialidad.descripcion || undefined,
        };
    }
}
