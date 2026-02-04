import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaClinicaEntity } from '../../citas/entities/historia-clinica.entity';

/**
 * Repositorio para operaciones de Historia Clínica
 * Encapsula las queries complejas para obtener toda la información
 * relacionada con la historia clínica del paciente
 */
@Injectable()
export class HistoriaClinicaRepository {
    constructor(
        @InjectRepository(HistoriaClinicaEntity)
        private readonly ormRepository: Repository<HistoriaClinicaEntity>,
    ) {}

    /**
     * Busca la historia clínica por ID de paciente
     * @param pacienteId - ID del paciente (usuario_id)
     */
    async findByPacienteId(
        pacienteId: number,
    ): Promise<HistoriaClinicaEntity | null> {
        return this.ormRepository.findOne({
            where: { pacienteId },
        });
    }

    /**
     * Verifica si existe una historia clínica para el paciente
     * @param pacienteId - ID del paciente
     */
    async existsByPacienteId(pacienteId: number): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { pacienteId },
        });
        return count > 0;
    }

    /**
     * Obtiene la historia clínica completa con todas sus relaciones
     * Incluye: paciente, registros de atención, recetas, documentos
     * @param pacienteId - ID del paciente
     */
    async findCompletaByPacienteId(
        pacienteId: number,
    ): Promise<HistoriaClinicaEntity | null> {
        return this.ormRepository.findOne({
            where: { pacienteId },
            relations: [
                // Paciente y sus datos básicos
                'paciente',
                'paciente.person',
                'paciente.person.genero',
                'paciente.pais',
                'paciente.grupoSanguineo',
                'paciente.estiloVida',
                // Enfermedades del paciente
                'paciente.pacienteEnfermedades',
                'paciente.pacienteEnfermedades.enfermedad',
                'paciente.pacienteEnfermedades.tipoEnfermedad',
                // Registros de atención
                'registrosAtencion',
                'registrosAtencion.cita',
                'registrosAtencion.cita.medico',
                'registrosAtencion.cita.medico.persona',
                'registrosAtencion.cita.medico.especialidades',
                // Recetas de cada registro
                'registrosAtencion.recetaMedica',
                'registrosAtencion.recetaMedica.medicamentos',
                'registrosAtencion.recetaMedica.medicamentos.medicamento',
                'registrosAtencion.recetaMedica.medicamentos.viaAdministracion',
                'registrosAtencion.recetaMedica.medicamentos.unidadMedida',
                // Documentos
                'documentos',
                'documentos.tipo',
            ],
            order: {
                registrosAtencion: {
                    fechaHoraCreacion: 'DESC',
                },
            },
        });
    }

    /**
     * Obtiene solo los registros de atención de una historia clínica
     * con paginación
     * @param pacienteId - ID del paciente
     * @param limit - Cantidad de registros a obtener
     * @param offset - Cantidad de registros a saltar
     */
    async findRegistrosAtencion(
        pacienteId: number,
        limit: number = 10,
        offset: number = 0,
    ): Promise<HistoriaClinicaEntity | null> {
        const queryBuilder = this.ormRepository
            .createQueryBuilder('historia')
            .leftJoinAndSelect('historia.registrosAtencion', 'registro')
            .leftJoinAndSelect('registro.cita', 'cita')
            .leftJoinAndSelect('cita.medico', 'medico')
            .leftJoinAndSelect('medico.persona', 'medicoPersona')
            .leftJoinAndSelect('medico.especialidades', 'especialidades')
            .leftJoinAndSelect('registro.recetaMedica', 'receta')
            .leftJoinAndSelect('receta.medicamentos', 'recetaMedicamentos')
            .leftJoinAndSelect('recetaMedicamentos.medicamento', 'medicamento')
            .leftJoinAndSelect(
                'recetaMedicamentos.viaAdministracion',
                'viaAdministracion',
            )
            .leftJoinAndSelect(
                'recetaMedicamentos.unidadMedida',
                'unidadMedida',
            )
            .where('historia.pacienteId = :pacienteId', { pacienteId })
            .orderBy('registro.fechaHoraCreacion', 'DESC')
            .skip(offset)
            .take(limit);

        return queryBuilder.getOne();
    }

    /**
     * Cuenta el total de registros de atención de una historia clínica
     * @param pacienteId - ID del paciente
     */
    async countRegistrosAtencion(pacienteId: number): Promise<number> {
        const result = await this.ormRepository
            .createQueryBuilder('historia')
            .leftJoin('historia.registrosAtencion', 'registro')
            .where('historia.pacienteId = :pacienteId', { pacienteId })
            .select('COUNT(registro.citaId)', 'count')
            .getRawOne<{ count: string }>();

        return parseInt(result?.count ?? '0', 10);
    }
}
