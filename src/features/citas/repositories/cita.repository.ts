import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, Not, Between, In } from 'typeorm';
import { CitaEntity } from '../entities/cita.entity';
import { EstadoCitaEntity } from '../entities/estado-cita.entity';
import { EstadoCita } from '../constants/estado-cita.constants';

@Injectable()
export class CitaRepository {
    private readonly logger = new Logger(CitaRepository.name);

    constructor(
        @InjectRepository(CitaEntity)
        private readonly ormRepository: Repository<CitaEntity>,
        @InjectRepository(EstadoCitaEntity)
        private readonly estadoCitaRepository: Repository<EstadoCitaEntity>,
    ) {}

    /**
     * Crea una nueva cita en la base de datos
     * @param citaData - Datos parciales de la cita a crear
     * @returns La cita creada con todas sus relaciones cargadas
     */
    async create(citaData: Partial<CitaEntity>): Promise<CitaEntity> {
        const cita = this.ormRepository.create(citaData);
        const citaGuardada = await this.ormRepository.save(cita);

        // Cargar relaciones después de guardar
        const citaCompleta = await this.findById(citaGuardada.id);

        if (!citaCompleta) {
            throw new Error(
                'Error al crear la cita: no se pudo recuperar la cita guardada',
            );
        }

        return citaCompleta;
    }

    /**
     * Busca una cita por ID con todas sus relaciones básicas
     * @param id - ID de la cita
     * @returns La cita encontrada o null
     */
    async findById(id: number): Promise<CitaEntity | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: [
                'estado',
                'paciente',
                'paciente.person',
                'medico',
                'medico.persona',
                'medico.especialidades',
            ],
        });
    }

    /**
     * Busca una cita por ID con TODAS sus relaciones (incluyendo registro de atención)
     * @param id - ID de la cita
     * @returns La cita encontrada o null
     */
    async findByIdDetallada(id: number): Promise<CitaEntity | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: [
                'estado',
                'paciente',
                'paciente.person',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'registroAtencion',
                'registroAtencion.historiaClinica',
            ],
        });
    }

    /**
     * Obtiene las próximas N citas pendientes de un paciente
     * @param pacienteId - ID del paciente
     * @param limit - Cantidad de citas a devolver
     * @returns Array de citas pendientes ordenadas por fecha ascendente
     */
    async findProximasCitas(
        pacienteId: number,
        limit: number,
    ): Promise<CitaEntity[]> {
        const fecha = new Date();
        fecha.setMinutes(fecha.getMinutes() + 10);
        return this.ormRepository.find({
            where: {
                paciente: { usuarioId: pacienteId },
                fechaHoraInicio: MoreThan(fecha),
                estado: { nombre: EstadoCita.PENDIENTE },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'ASC',
            },
            take: limit,
        });
    }

    /**
     * Obtiene las últimas N citas atendidas de un paciente
     * @param pacienteId - ID del paciente
     * @param limit - Cantidad de citas a devolver
     * @returns Array de citas atendidas ordenadas por fecha descendente
     */
    async findRecientesCitas(
        pacienteId: number,
        limit: number,
    ): Promise<CitaEntity[]> {
        return this.ormRepository.find({
            where: {
                paciente: { usuarioId: pacienteId },
                estado: {
                    nombre: In([EstadoCita.ATENDIDA, EstadoCita.CANCELADA]),
                },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'DESC',
            },
            take: limit,
        });
    }

    /**
     * Obtiene todas las citas pendientes de un paciente con paginación
     * @param pacienteId - ID del paciente
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Tupla [citas, total]
     */
    async findAllPendientesPaginadas(
        pacienteId: number,
        page: number,
        limit: number,
    ): Promise<[CitaEntity[], number]> {
        const skip = (page - 1) * limit;

        return this.ormRepository.findAndCount({
            where: {
                paciente: { usuarioId: pacienteId },
                fechaHoraInicio: MoreThan(new Date()),
                estado: { nombre: EstadoCita.PENDIENTE },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'ASC',
            },
            skip,
            take: limit,
        });
    }

    /**
     * Obtiene todas las citas atendidas de un paciente con paginación
     * @param pacienteId - ID del paciente
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Tupla [citas, total]
     */
    async findAllAtendidasPaginadas(
        pacienteId: number,
        page: number,
        limit: number,
    ): Promise<[CitaEntity[], number]> {
        const skip = (page - 1) * limit;

        return this.ormRepository.findAndCount({
            where: {
                paciente: { usuarioId: pacienteId },
                estado: {
                    nombre: In([EstadoCita.ATENDIDA, EstadoCita.CANCELADA]),
                },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'DESC',
            },
            skip,
            take: limit,
        });
    }

    /**
     * Actualiza una cita existente
     * @param id - ID de la cita a actualizar
     * @param citaData - Datos parciales a actualizar
     * @returns La cita actualizada con relaciones cargadas
     */
    async update(
        id: number,
        citaData: Partial<CitaEntity>,
    ): Promise<CitaEntity | null> {
        await this.ormRepository.update(id, citaData);
        return this.findById(id);
    }

    /**
     * Verifica si existe un conflicto de horario para el médico en el rango especificado
     * @param medicoId - ID del médico
     * @param fechaInicio - Fecha/hora de inicio de la cita
     * @param fechaFin - Fecha/hora de fin de la cita
     * @param excludeCitaId - ID de la cita a excluir de la búsqueda (para updates)
     * @returns true si hay conflicto, false si no hay conflicto
     */
    async verificarConflictoHorario(
        medicoId: number,
        fechaInicio: Date,
        fechaFin: Date,
        excludeCitaId?: number,
    ): Promise<boolean> {
        this.logger.debug(
            `Verificando conflicto de horario: medicoId=${medicoId}, fechaInicio=${fechaInicio.toISOString()}, fechaFin=${fechaFin.toISOString()}, excludeCitaId=${excludeCitaId}`,
        );

        const whereConditions: Record<string, unknown> = {
            medico: { usuarioId: medicoId },
            estado: { nombre: EstadoCita.PENDIENTE },
        };

        // Si estamos actualizando, excluir la cita actual de la búsqueda
        if (excludeCitaId) {
            whereConditions.id = Not(excludeCitaId);
        }

        // Buscar citas que se solapen con el nuevo horario
        // Hay solapamiento si:
        // 1. La nueva cita empieza durante otra cita existente
        // 2. La nueva cita termina durante otra cita existente
        // 3. La nueva cita contiene completamente otra cita existente
        const query = this.ormRepository
            .createQueryBuilder('cita')
            .innerJoin('cita.medico', 'medico')
            .innerJoin('cita.estado', 'estado')
            .where('medico.usuarioId = :medicoId', { medicoId })
            .andWhere('estado.nombre = :estado', {
                estado: EstadoCita.PENDIENTE,
            })
            .andWhere(
                '((cita.fechaHoraInicio < :fechaFin AND cita.fechaHoraFin > :fechaInicio))',
                {
                    fechaInicio,
                    fechaFin,
                },
            )
            .andWhere(excludeCitaId ? 'cita.id != :excludeId' : '1=1', {
                excludeId: excludeCitaId,
            });

        const conflicto = await query.getCount();

        this.logger.debug(
            `Resultado conflicto: count=${conflicto}, hayConflicto=${conflicto > 0}`,
        );

        return conflicto > 0;
    }

    /**
     * Actualiza el estado de una cita
     * @param id - ID de la cita
     * @param estadoNombre - Nombre del nuevo estado (usar constantes de EstadoCita)
     * @returns La cita actualizada
     */
    async updateEstado(
        id: number,
        estadoNombre: string,
    ): Promise<CitaEntity | null> {
        // 1. Verificar que la cita existe
        const cita = await this.findById(id);
        if (!cita) {
            this.logger.warn(`Cita con ID ${id} no encontrada`);
            return null;
        }

        // 2. Buscar el estado por nombre
        const estado = await this.estadoCitaRepository.findOne({
            where: { nombre: estadoNombre },
        });

        if (!estado) {
            this.logger.error(
                `Estado "${estadoNombre}" no encontrado en la base de datos`,
            );
            return null;
        }

        // 3. Actualizar la cita con el nuevo estado
        await this.ormRepository.update(id, {
            estado: estado,
        });

        // 4. Retornar la cita actualizada
        return this.findById(id);
    }

    /**
     * Obtiene las citas pendientes de un médico para una fecha específica
     * @param medicoId - ID del médico
     * @param fecha - Fecha a consultar (formato YYYY-MM-DD)
     * @returns Array de citas pendientes del médico para esa fecha
     */
    async findCitasPendientesPorMedicoYFecha(
        medicoId: number,
        fecha: string,
    ): Promise<CitaEntity[]> {
        const inicioDia = new Date(fecha + 'T00:00:00');
        const finDia = new Date(fecha + 'T23:59:59');

        return this.ormRepository.find({
            where: {
                medico: { usuarioId: medicoId },
                fechaHoraInicio: Between(inicioDia, finDia),
                estado: { nombre: EstadoCita.PENDIENTE },
            },
        });
    }

    /**
     * Obtiene todas las citas de un médico para una fecha específica
     * @param medicoId - ID del médico
     * @param fecha - Fecha a consultar (formato YYYY-MM-DD)
     * @returns Array de citas del médico para esa fecha
     */
    async findCitasByMedicoYFecha(
        medicoId: number,
        fecha: string,
    ): Promise<CitaEntity[]> {
        const inicioDia = new Date(fecha + 'T00:00:00');
        const finDia = new Date(fecha + 'T23:59:59');

        return this.ormRepository.find({
            where: {
                medico: { usuarioId: medicoId },
                fechaHoraInicio: Between(inicioDia, finDia),
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'ASC',
            },
        });
    }

    /**
     * Obtiene las próximas N citas pendientes de un médico
     * @param medicoId - ID del médico
     * @param limit - Cantidad de citas a devolver
     * @returns Array de citas pendientes ordenadas por fecha ascendente
     */
    async findProximasCitasByMedico(
        medicoId: number,
        limit: number,
    ): Promise<CitaEntity[]> {
        const fecha = new Date();
        fecha.setMinutes(fecha.getMinutes() + 10);
        return this.ormRepository.find({
            where: {
                medico: { usuarioId: medicoId },
                fechaHoraInicio: MoreThan(fecha),
                estado: { nombre: EstadoCita.PENDIENTE },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'ASC',
            },
            take: limit,
        });
    }

    /**
     * Obtiene todas las citas de un médico con paginación
     * @param medicoId - ID del médico
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Tupla [citas, total]
     */
    async findAllCitasByMedicoPaginadas(
        medicoId: number,
        page: number,
        limit: number,
    ): Promise<[CitaEntity[], number]> {
        const skip = (page - 1) * limit;

        return this.ormRepository.findAndCount({
            where: {
                medico: { usuarioId: medicoId },
            },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'medico.especialidades',
                'paciente',
                'paciente.person',
            ],
            order: {
                fechaHoraInicio: 'DESC',
            },
            skip,
            take: limit,
        });
    }
}
