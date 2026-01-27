import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    ConflictException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitaRepository } from './repositories/cita.repository';
import { MedicoEntity } from '../medicos/medicos.entity';
import { EstadoCitaEntity } from './entities/estado-cita.entity';
import { CreateCitaDto } from './dto/create-cita.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import {
    CitaResponseDto,
    MedicoInfo,
    PacienteInfo,
} from './dto/cita-response.dto';
import { CitaDetalladaResponseDto } from './dto/cita-detallada-response.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';
import { CitaEntity } from './entities/cita.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import {
    EstadoCita,
    CITA_DURACION_MINUTOS,
    CITA_HORAS_MINIMAS_MODIFICACION,
} from './constants/estado-cita.constants';

@Injectable()
export class CitasService {
    private readonly logger = new Logger(CitasService.name);

    constructor(
        private readonly citaRepository: CitaRepository,
        @InjectRepository(MedicoEntity)
        private readonly medicoRepository: Repository<MedicoEntity>,
        @InjectRepository(EstadoCitaEntity)
        private readonly estadoCitaRepository: Repository<EstadoCitaEntity>,
    ) {}

    /**
     * Crea una nueva cita médica
     * @param createCitaDto - Datos de la cita a crear
     * @param pacienteId - ID del paciente que agenda la cita (viene del token JWT)
     * @returns CitaResponseDto con la información de la cita creada
     */
    async createCita(
        createCitaDto: CreateCitaDto,
        pacienteId: number,
    ): Promise<CitaResponseDto> {
        const { medicoId, fechaHoraInicio, telefonica } = createCitaDto;

        // 1. Validar que el médico existe
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
            relations: ['persona', 'especialidades'],
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        // 2. Calcular fecha de fin (+30 minutos)
        const fechaInicio = new Date(fechaHoraInicio);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMinutes(fechaFin.getMinutes() + CITA_DURACION_MINUTOS);

        // 3. Validar que la fecha es futura
        const ahora = new Date();
        if (fechaInicio <= ahora) {
            throw new BadRequestException(
                'La fecha de la cita debe ser posterior a la fecha actual',
            );
        }

        // 4. Validar que no haya conflictos de horario con el médico
        const hayConflicto =
            await this.citaRepository.verificarConflictoHorario(
                medicoId,
                fechaInicio,
                fechaFin,
            );

        if (hayConflicto) {
            throw new ConflictException(
                'El médico ya tiene una cita agendada en ese horario. Por favor selecciona otro horario disponible.',
            );
        }

        // 5. Obtener el estado "pendiente"
        const estadoPendiente = await this.estadoCitaRepository.findOne({
            where: { nombre: EstadoCita.PENDIENTE },
        });

        if (!estadoPendiente) {
            throw new Error(
                'Error de configuración: estado "pendiente" no encontrado en la base de datos',
            );
        }

        // 6. Crear la cita
        const citaData: Partial<CitaEntity> = {
            medico: { usuarioId: medicoId } as MedicoEntity,
            paciente: { usuarioId: pacienteId } as PacientesEntity,
            fechaHoraCreacion: new Date(),
            fechaHoraInicio: fechaInicio,
            fechaHoraFin: fechaFin,
            telefonica: telefonica || true,
            estado: estadoPendiente,
        };

        const citaGuardada = await this.citaRepository.create(citaData);

        // 7. Mapear a DTO de respuesta
        return this.mapToResponseDto(citaGuardada);
    }

    /**
     * Obtiene las próximas 3 citas pendientes del paciente
     * @param pacienteId - ID del paciente autenticado
     * @returns Array de hasta 3 citas pendientes (vacío si no tiene citas)
     */
    async getProximasCitas(pacienteId: number): Promise<CitaResponseDto[]> {
        const citas = await this.citaRepository.findProximasCitas(
            pacienteId,
            3,
        );

        // Defensivo: retornar array vacío si no hay resultados
        if (!citas || citas.length === 0) {
            return [];
        }

        return citas.map((cita) => this.mapToResponseDto(cita));
    }

    /**
     * Obtiene las últimas 4 citas atendidas del paciente
     * @param pacienteId - ID del paciente autenticado
     * @returns Array de hasta 4 citas atendidas (vacío si no tiene citas atendidas)
     */
    async getRecientesCitasAtendidas(
        pacienteId: number,
    ): Promise<CitaResponseDto[]> {
        const citas = await this.citaRepository.findRecientesCitasAtendidas(
            pacienteId,
            4,
        );

        // Defensivo: retornar array vacío si no hay resultados
        if (!citas || citas.length === 0) {
            return [];
        }

        return citas.map((cita) => this.mapToResponseDto(cita));
    }

    /**
     * Obtiene todas las citas pendientes del paciente con paginación
     * @param pacienteId - ID del paciente autenticado
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Respuesta paginada con citas pendientes (puede estar vacía)
     */
    async getAllCitasPendientes(
        pacienteId: number,
        page: number,
        limit: number,
    ): Promise<PaginatedResponseDto<CitaResponseDto>> {
        const [citas, total] =
            await this.citaRepository.findAllPendientesPaginadas(
                pacienteId,
                page,
                limit,
            );

        // Defensivo: manejar array vacío
        const data =
            citas && citas.length > 0
                ? citas.map((cita) => this.mapToResponseDto(cita))
                : [];

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtiene todas las citas atendidas del paciente con paginación
     * @param pacienteId - ID del paciente autenticado
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Respuesta paginada con citas atendidas (puede estar vacía)
     */
    async getAllCitasAtendidas(
        pacienteId: number,
        page: number,
        limit: number,
    ): Promise<PaginatedResponseDto<CitaResponseDto>> {
        const [citas, total] =
            await this.citaRepository.findAllAtendidasPaginadas(
                pacienteId,
                page,
                limit,
            );

        // Defensivo: manejar array vacío
        const data =
            citas && citas.length > 0
                ? citas.map((cita) => this.mapToResponseDto(cita))
                : [];

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Obtiene una cita específica por ID con todos sus detalles
     * @param id - ID de la cita
     * @param pacienteId - ID del paciente autenticado
     * @returns Cita detallada con diagnóstico, recetas y derivaciones
     */
    async getCitaById(
        id: number,
        pacienteId: number,
    ): Promise<CitaDetalladaResponseDto> {
        const cita = await this.citaRepository.findByIdDetallada(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        // Validar que la cita pertenece al paciente autenticado
        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para acceder a esta cita',
            );
        }

        return this.mapToDetalladaResponseDto(cita);
    }

    /**
     * Actualiza una cita existente
     * @param id - ID de la cita a actualizar
     * @param updateCitaDto - Nuevos datos de la cita
     * @param pacienteId - ID del paciente autenticado
     * @returns CitaResponseDto con la cita actualizada
     */
    async updateCita(
        id: number,
        updateCitaDto: UpdateCitaDto,
        pacienteId: number,
    ): Promise<CitaResponseDto> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findById(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        // 2. Verificar que la cita pertenece al paciente
        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para modificar esta cita',
            );
        }

        // 3. Verificar que la cita está en estado "pendiente"
        if (cita.estado.nombre !== EstadoCita.PENDIENTE) {
            throw new BadRequestException(
                `Solo se pueden modificar citas con estado "pendiente". Estado actual: ${cita.estado.nombre}`,
            );
        }

        // 4. Verificar regla de 72 horas
        const ahora = new Date();
        const horasHastaCita =
            (cita.fechaHoraInicio.getTime() - ahora.getTime()) /
            (1000 * 60 * 60);

        if (horasHastaCita < CITA_HORAS_MINIMAS_MODIFICACION) {
            throw new BadRequestException(
                `Solo se pueden modificar citas con al menos ${CITA_HORAS_MINIMAS_MODIFICACION} horas de anticipación. Faltan ${Math.floor(horasHastaCita)} horas para tu cita.`,
            );
        }

        // 5. Validar que se proporcionó nueva fecha
        if (!updateCitaDto.fechaHoraInicio) {
            throw new BadRequestException(
                'Debes proporcionar una nueva fecha y hora para la cita',
            );
        }

        // 6. Validar nueva fecha
        const nuevaFechaInicio = new Date(updateCitaDto.fechaHoraInicio);
        if (nuevaFechaInicio <= ahora) {
            throw new BadRequestException(
                'La nueva fecha de la cita debe ser posterior a la fecha actual',
            );
        }

        // 7. Calcular nueva fecha de fin
        const nuevaFechaFin = new Date(nuevaFechaInicio);
        nuevaFechaFin.setMinutes(
            nuevaFechaFin.getMinutes() + CITA_DURACION_MINUTOS,
        );

        // 8. Verificar conflictos de horario con el médico
        const hayConflicto =
            await this.citaRepository.verificarConflictoHorario(
                cita.medico.usuarioId,
                nuevaFechaInicio,
                nuevaFechaFin,
                id, // Excluir esta cita de la búsqueda
            );

        if (hayConflicto) {
            throw new ConflictException(
                'El médico ya tiene una cita agendada en ese horario. Por favor selecciona otro horario.',
            );
        }

        // 9. Actualizar la cita
        const citaActualizada = await this.citaRepository.update(id, {
            fechaHoraInicio: nuevaFechaInicio,
            fechaHoraFin: nuevaFechaFin,
            telefonica:
                updateCitaDto.telefonica !== undefined
                    ? updateCitaDto.telefonica
                    : cita.telefonica,
        });

        if (!citaActualizada) {
            throw new Error('Error al actualizar la cita');
        }

        return this.mapToResponseDto(citaActualizada);
    }

    /**
     * Cancela una cita (soft delete)
     * @param id - ID de la cita a cancelar
     * @param pacienteId - ID del paciente autenticado
     * @returns Mensaje de confirmación
     */
    async deleteCita(
        id: number,
        pacienteId: number,
    ): Promise<{ message: string }> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findById(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        // 2. Verificar que la cita pertenece al paciente
        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para cancelar esta cita',
            );
        }

        // 3. Verificar que la cita está en estado "pendiente"
        if (cita.estado.nombre !== EstadoCita.PENDIENTE) {
            throw new BadRequestException(
                `Solo se pueden cancelar citas con estado "pendiente". Estado actual: ${cita.estado.nombre}`,
            );
        }

        // 4. Verificar regla de 72 horas
        const ahora = new Date();
        const horasHastaCita =
            (cita.fechaHoraInicio.getTime() - ahora.getTime()) /
            (1000 * 60 * 60);

        if (horasHastaCita < CITA_HORAS_MINIMAS_MODIFICACION) {
            throw new BadRequestException(
                `Solo se pueden cancelar citas con al menos ${CITA_HORAS_MINIMAS_MODIFICACION} horas de anticipación. Faltan ${Math.floor(horasHastaCita)} horas para tu cita.`,
            );
        }

        // 5. Cambiar estado a "cancelada" (soft delete)
        this.logger.log(
            `Intentando cancelar cita ID ${id}, estado actual: "${cita.estado.nombre}"`,
        );

        const citaCancelada = await this.citaRepository.updateEstado(
            id,
            EstadoCita.CANCELADA,
        );

        this.logger.log(
            `Resultado updateEstado: ${citaCancelada ? 'SUCCESS' : 'FAILED'}`,
        );

        if (!citaCancelada) {
            throw new BadRequestException('Error al cancelar la cita');
        }

        return {
            message: `Cita del ${cita.fechaHoraInicio.toLocaleDateString()} cancelada exitosamente`,
        };
    }

    /**
     * Mapea una entidad CitaEntity a CitaResponseDto
     * @param cita - Entidad de cita con relaciones cargadas
     * @returns CitaResponseDto
     */
    private mapToResponseDto(cita: CitaEntity): CitaResponseDto {
        const medicoInfo: MedicoInfo = {
            id: cita.medico.usuarioId,
            nombre: cita.medico.persona.primerNombre,
            apellido: cita.medico.persona.primerApellido,
            especialidad:
                cita.medico.especialidades &&
                cita.medico.especialidades.length > 0
                    ? cita.medico.especialidades[0].nombre
                    : 'No especificada',
        };

        const pacienteInfo: PacienteInfo = {
            id: cita.paciente.usuarioId,
            nombre: cita.paciente.person.primerNombre,
            apellido: cita.paciente.person.primerApellido,
        };

        return {
            id: cita.id,
            fechaHoraCreacion: cita.fechaHoraCreacion,
            fechaHoraInicio: cita.fechaHoraInicio,
            fechaHoraFin: cita.fechaHoraFin,
            telefonica: cita.telefonica,
            estado: cita.estado.nombre,
            medico: medicoInfo,
            paciente: pacienteInfo,
        };
    }

    /**
     * Mapea una entidad CitaEntity a CitaDetalladaResponseDto
     * @param cita - Entidad de cita con TODAS las relaciones cargadas
     * @returns CitaDetalladaResponseDto
     */
    private mapToDetalladaResponseDto(
        cita: CitaEntity,
    ): CitaDetalladaResponseDto {
        const baseDto = this.mapToResponseDto(cita);

        return {
            ...baseDto,
            motivoCita: cita.registroAtencion?.motivoCita || undefined,
            diagnostico: cita.registroAtencion?.diagnostico || undefined,
            observaciones: cita.registroAtencion?.observaciones || undefined,
            tieneReceta: false, // TODO: Implementar cuando exista el módulo de recetas
            tieneDerivaciones: false, // TODO: Implementar cuando exista el módulo de derivaciones
        };
    }
}
