import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecetaMedicaEntity } from '../entities/receta-medica.entity';

@Injectable()
export class RecetaMedicaRepository {
    constructor(
        @InjectRepository(RecetaMedicaEntity)
        private readonly ormRepository: Repository<RecetaMedicaEntity>,
    ) {}

    /**
     * Crea una nueva receta médica con sus medicamentos
     * @param recetaData - Datos de la receta a crear
     * @returns La receta creada con todas sus relaciones cargadas
     */
    async create(
        recetaData: Partial<RecetaMedicaEntity>,
    ): Promise<RecetaMedicaEntity> {
        const receta = this.ormRepository.create(recetaData);
        const recetaGuardada = await this.ormRepository.save(receta);

        const recetaCompleta = await this.findByRegistroAtencionId(
            recetaGuardada.registroAtencionId,
        );

        if (!recetaCompleta) {
            throw new Error(
                'Error al crear la receta: no se pudo recuperar la receta guardada',
            );
        }

        return recetaCompleta;
    }

    /**
     * Busca una receta por ID de registro de atención
     * @param registroAtencionId - ID del registro de atención
     * @returns La receta encontrada o null
     */
    async findByRegistroAtencionId(
        registroAtencionId: number,
    ): Promise<RecetaMedicaEntity | null> {
        return this.ormRepository.findOne({
            where: { registroAtencionId },
            relations: [
                'medico',
                'medico.persona',
                'medicamentos',
                'medicamentos.medicamento',
                'medicamentos.medicamento.presentacion',
                'medicamentos.viaAdministracion',
                'medicamentos.unidadMedida',
            ],
        });
    }

    /**
     * Busca una receta por ID de registro de atención sin cargar todas las relaciones
     * @param registroAtencionId - ID del registro de atención
     * @returns La receta encontrada o null
     */
    async existsByRegistroAtencionId(
        registroAtencionId: number,
    ): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { registroAtencionId },
        });
        return count > 0;
    }

    /**
     * Obtiene todas las recetas médicas de un paciente
     * @param pacienteId - ID del paciente
     * @returns Lista de recetas con todas sus relaciones incluyendo diagnóstico
     */
    async findAllByPacienteId(
        pacienteId: number,
    ): Promise<RecetaMedicaEntity[]> {
        return this.ormRepository
            .createQueryBuilder('receta')
            .innerJoinAndSelect('receta.registroAtencion', 'registro')
            .innerJoinAndSelect('registro.cita', 'cita')
            .innerJoinAndSelect('cita.paciente', 'paciente')
            .innerJoinAndSelect('receta.medico', 'medico')
            .innerJoinAndSelect('medico.persona', 'persona')
            .leftJoinAndSelect('medico.especialidades', 'especialidades')
            .leftJoinAndSelect('receta.medicamentos', 'medicamentos')
            .leftJoinAndSelect('medicamentos.medicamento', 'medicamento')
            .leftJoinAndSelect('medicamento.presentacion', 'presentacion')
            .leftJoinAndSelect('medicamentos.viaAdministracion', 'via')
            .leftJoinAndSelect('medicamentos.unidadMedida', 'unidad')
            .where('paciente.usuarioId = :pacienteId', { pacienteId })
            .orderBy('receta.fechaHoraCreacion', 'DESC')
            .getMany();
    }
}
