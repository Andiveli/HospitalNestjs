import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ExcepcionHorarioEntity } from '../excepcion-horario.entity';

@Injectable()
export class ExcepcionesHorarioRepository {
    constructor(
        @InjectRepository(ExcepcionHorarioEntity)
        private readonly ormRepository: Repository<ExcepcionHorarioEntity>,
    ) {}

    /**
     * Crea una nueva excepción de horario
     * @param excepcion - Entidad a crear
     * @returns La excepción creada
     */
    async create(
        excepcion: ExcepcionHorarioEntity,
    ): Promise<ExcepcionHorarioEntity> {
        return this.ormRepository.save(excepcion);
    }

    /**
     * Busca una excepción por ID
     * @param id - ID de la excepción
     * @returns La excepción o null si no existe
     */
    async findById(id: number): Promise<ExcepcionHorarioEntity | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['medico'],
        });
    }

    /**
     * Busca una excepción por médico y fecha
     * @param medicoId - ID del médico
     * @param fecha - Fecha de la excepción
     * @returns La excepción o null si no existe
     */
    async findByMedicoYFecha(
        medicoId: number,
        fecha: Date,
    ): Promise<ExcepcionHorarioEntity | null> {
        return this.ormRepository.findOne({
            where: {
                medico: { usuarioId: medicoId },
                fecha,
            },
        });
    }

    /**
     * Busca una excepción por médico y fecha, excluyendo un ID
     * @param medicoId - ID del médico
     * @param fecha - Fecha de la excepción
     * @param excludeId - ID a excluir
     * @returns La excepción o null si no existe
     */
    async findByMedicoYFechaExcluyendoId(
        medicoId: number,
        fecha: Date,
        excludeId: number,
    ): Promise<ExcepcionHorarioEntity | null> {
        return this.ormRepository
            .findOne({
                where: {
                    medico: { usuarioId: medicoId },
                    fecha,
                },
            })
            .then((excepcion) => {
                if (excepcion && excepcion.id !== excludeId) {
                    return excepcion;
                }
                return null;
            });
    }

    /**
     * Obtiene todas las excepciones de un médico
     * @param medicoId - ID del médico
     * @returns Lista de excepciones ordenadas por fecha
     */
    async findByMedico(medicoId: number): Promise<ExcepcionHorarioEntity[]> {
        return this.ormRepository.find({
            where: { medico: { usuarioId: medicoId } },
            order: { fecha: 'ASC' },
        });
    }

    /**
     * Obtiene las excepciones futuras de un médico
     * @param medicoId - ID del médico
     * @param fechaDesde - Fecha desde la cual buscar
     * @returns Lista de excepciones futuras
     */
    async findFuturasByMedico(
        medicoId: number,
        fechaDesde: Date,
    ): Promise<ExcepcionHorarioEntity[]> {
        return this.ormRepository.find({
            where: {
                medico: { usuarioId: medicoId },
                fecha: MoreThanOrEqual(fechaDesde),
            },
            order: { fecha: 'ASC' },
        });
    }

    /**
     * Obtiene todas las excepciones con relaciones de médico
     * @returns Lista de excepciones ordenadas
     */
    async findAll(): Promise<ExcepcionHorarioEntity[]> {
        return this.ormRepository.find({
            relations: ['medico', 'medico.persona', 'medico.especialidades'],
            order: {
                medico: { usuarioId: 'ASC' },
                fecha: 'ASC',
            },
        });
    }

    /**
     * Actualiza una excepción
     * @param excepcion - Entidad a actualizar
     * @returns La excepción actualizada
     */
    async save(
        excepcion: ExcepcionHorarioEntity,
    ): Promise<ExcepcionHorarioEntity> {
        return this.ormRepository.save(excepcion);
    }

    /**
     * Elimina una excepción por ID
     * @param id - ID de la excepción
     */
    async delete(id: number): Promise<void> {
        const resultado = await this.ormRepository.delete(id);

        if (resultado.affected === 0) {
            throw new NotFoundException(`Excepción con ID ${id} no encontrada`);
        }
    }
}
