import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MedicamentoEntity } from '../entities/medicamento.entity';
import { PresentacionMedicamentoEntity } from '../entities/presentacion-medicamento.entity';
import { ViaAdministracionEntity } from '../entities/via-administracion.entity';
import { UnidadMedidaEntity } from '../entities/unidad-medida.entity';

@Injectable()
export class MedicamentoRepository {
    constructor(
        @InjectRepository(MedicamentoEntity)
        private readonly medicamentoRepository: Repository<MedicamentoEntity>,
        @InjectRepository(PresentacionMedicamentoEntity)
        private readonly presentacionRepository: Repository<PresentacionMedicamentoEntity>,
        @InjectRepository(ViaAdministracionEntity)
        private readonly viaAdministracionRepository: Repository<ViaAdministracionEntity>,
        @InjectRepository(UnidadMedidaEntity)
        private readonly unidadMedidaRepository: Repository<UnidadMedidaEntity>,
    ) {}

    /**
     * Verifica si todos los medicamentos existen
     * @param medicamentoIds - Array de IDs de medicamentos
     * @returns true si todos existen, false si alguno no existe
     */
    async existenMedicamentos(medicamentoIds: number[]): Promise<boolean> {
        const count = await this.medicamentoRepository.count({
            where: { id: In(medicamentoIds) },
        });
        return count === medicamentoIds.length;
    }

    /**
     * Verifica si todas las vías de administración existen
     * @param viaIds - Array de IDs de vías de administración
     * @returns true si todas existen, false si alguna no existe
     */
    async existenViasAdministracion(viaIds: number[]): Promise<boolean> {
        const count = await this.viaAdministracionRepository.count({
            where: { id: In(viaIds) },
        });
        return count === viaIds.length;
    }

    /**
     * Verifica si todas las unidades de medida existen
     * @param unidadIds - Array de IDs de unidades de medida
     * @returns true si todas existen, false si alguna no existe
     */
    async existenUnidadesMedida(unidadIds: number[]): Promise<boolean> {
        const count = await this.unidadMedidaRepository.count({
            where: { id: In(unidadIds) },
        });
        return count === unidadIds.length;
    }

    /**
     * Obtiene todos los medicamentos
     * @returns Lista de medicamentos con sus presentaciones
     */
    async findAll(): Promise<MedicamentoEntity[]> {
        return this.medicamentoRepository.find({
            relations: ['presentacion'],
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene un medicamento por ID
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
     * Obtiene todas las vías de administración
     * @returns Lista de vías de administración
     */
    async findAllViasAdministracion(): Promise<ViaAdministracionEntity[]> {
        return this.viaAdministracionRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene todas las unidades de medida
     * @returns Lista de unidades de medida
     */
    async findAllUnidadesMedida(): Promise<UnidadMedidaEntity[]> {
        return this.unidadMedidaRepository.find({
            order: { nombre: 'ASC' },
        });
    }

    /**
     * Obtiene todas las presentaciones de medicamento
     * @returns Lista de presentaciones
     */
    async findAllPresentaciones(): Promise<PresentacionMedicamentoEntity[]> {
        return this.presentacionRepository.find({
            order: { nombre: 'ASC' },
        });
    }
}
