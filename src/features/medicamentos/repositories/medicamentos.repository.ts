import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MedicamentoEntity } from '../entities/medicamento.entity';
import { PresentacionMedicamentoEntity } from '../entities/presentacion-medicamento.entity';

@Injectable()
export class MedicamentosRepository {
    constructor(
        @InjectRepository(MedicamentoEntity)
        private readonly medicamentoRepository: Repository<MedicamentoEntity>,
        @InjectRepository(PresentacionMedicamentoEntity)
        private readonly presentacionRepository: Repository<PresentacionMedicamentoEntity>,
    ) {}

    /**
     * Crea un nuevo medicamento
     * @param medicamentoData - Datos del medicamento a crear
     * @returns El medicamento creado con su presentación
     */
    async create(
        medicamentoData: Partial<MedicamentoEntity>,
    ): Promise<MedicamentoEntity> {
        const medicamento = this.medicamentoRepository.create(medicamentoData);
        const guardado = await this.medicamentoRepository.save(medicamento);

        // Retornar con relaciones cargadas
        return this.findById(guardado.id) as Promise<MedicamentoEntity>;
    }

    /**
     * Busca un medicamento por ID con su presentación
     * @param id - ID del medicamento
     * @returns El medicamento encontrado o null
     */
    async findById(id: number): Promise<MedicamentoEntity | null> {
        return this.medicamentoRepository.findOne({
            where: { id },
            relations: ['presentacion'],
        });
    }

    /**
     * Obtiene todos los medicamentos con sus presentaciones
     * @returns Lista de medicamentos ordenados por nombre
     */
    async findAll(): Promise<MedicamentoEntity[]> {
        return this.medicamentoRepository.find({
            relations: ['presentacion'],
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Actualiza un medicamento existente
     * @param id - ID del medicamento a actualizar
     * @param medicamentoData - Datos a actualizar
     * @returns El medicamento actualizado
     */
    async update(
        id: number,
        medicamentoData: Partial<MedicamentoEntity>,
    ): Promise<MedicamentoEntity> {
        await this.medicamentoRepository.update(id, medicamentoData);

        const actualizado = await this.findById(id);
        if (!actualizado) {
            throw new NotFoundException(
                `Medicamento con ID ${id} no encontrado`,
            );
        }

        return actualizado;
    }

    /**
     * Elimina un medicamento
     * @param id - ID del medicamento a eliminar
     */
    async delete(id: number): Promise<void> {
        const resultado = await this.medicamentoRepository.delete(id);

        if (resultado.affected === 0) {
            throw new NotFoundException(
                `Medicamento con ID ${id} no encontrado`,
            );
        }
    }

    /**
     * Verifica si existe un medicamento con el mismo nombre y principio activo
     * @param nombre - Nombre del medicamento
     * @param principioActivo - Principio activo
     * @param excludeId - ID a excluir (para updates)
     * @returns true si existe, false si no
     */
    async existsByNombreYPrincipio(
        nombre: string,
        principioActivo: string,
        excludeId?: number,
    ): Promise<boolean> {
        const query = this.medicamentoRepository
            .createQueryBuilder('medicamento')
            .where('medicamento.nombre = :nombre', { nombre })
            .andWhere('medicamento.principioActivo = :principioActivo', {
                principioActivo,
            });

        if (excludeId) {
            query.andWhere('medicamento.id != :excludeId', { excludeId });
        }

        const count = await query.getCount();
        return count > 0;
    }

    /**
     * Verifica si una presentación existe
     * @param presentacionId - ID de la presentación
     * @returns true si existe, false si no
     */
    async existsPresentacion(presentacionId: number): Promise<boolean> {
        const count = await this.presentacionRepository.count({
            where: { id: presentacionId },
        });
        return count > 0;
    }

    /**
     * Obtiene todas las presentaciones
     * @returns Lista de presentaciones ordenadas por nombre
     */
    async findAllPresentaciones(): Promise<PresentacionMedicamentoEntity[]> {
        return this.presentacionRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Verifica si todos los medicamentos existen (para validaciones)
     * @param medicamentoIds - Array de IDs de medicamentos
     * @returns true si todos existen, false si alguno no existe
     */
    async existenMedicamentos(medicamentoIds: number[]): Promise<boolean> {
        const count = await this.medicamentoRepository.count({
            where: { id: In(medicamentoIds) },
        });
        return count === medicamentoIds.length;
    }
}
