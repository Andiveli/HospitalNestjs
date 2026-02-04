import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExcepcionHorarioEntity } from '../horario/excepcion-horario.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { MedicoEntity } from '../medicos/medicos.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { RecetasService } from '../recetas/recetas.service';
import {
    SesionConsultaRepository,
    ParticipanteSesionRepository,
} from '../videollamadas/repositories';
import { RolSesionEntity } from '../videollamadas/entities/rol-sesion.entity';
import {
    CITA_DURACION_MINUTOS,
    CITA_HORAS_MINIMAS_MODIFICACION,
    EstadoCita,
} from './constants/estado-cita.constants';
import {
    CitaDetalladaResponseDto,
    RecetaDetalleDto,
    MedicamentoRecetaDetalleDto,
} from './dto/cita-detallada-response.dto';
import {
    CitaResponseDto,
    MedicoInfoDto,
    PacienteInfoDto,
} from './dto/cita-response.dto';
import { CreateCitaDto } from './dto/create-cita.dto';
import { DiasAtencionResponseDto } from './dto/dias-atencion.dto';
import {
    DisponibilidadResponseDto,
    SlotDisponibleDto,
} from './dto/disponibilidad.dto';
import { MedicoDisponibleDto } from './dto/medico-disponible.dto';
import { PaginatedResponseDto } from './dto/pagination.dto';
import { UpdateCitaDto } from './dto/update-cita.dto';
import { CitaEntity } from './entities/cita.entity';
import { EstadoCitaEntity } from './entities/estado-cita.entity';
import { CitaRepository } from './repositories/cita.repository';

@Injectable()
export class CitasService {
    private readonly logger = new Logger(CitasService.name);

    constructor(
        private readonly citaRepository: CitaRepository,
        @InjectRepository(MedicoEntity)
        private readonly medicoRepository: Repository<MedicoEntity>,
        @InjectRepository(EstadoCitaEntity)
        private readonly estadoCitaRepository: Repository<EstadoCitaEntity>,
        @InjectRepository(HorarioMedicoEntity)
        private readonly horarioMedicoRepository: Repository<HorarioMedicoEntity>,
        @InjectRepository(ExcepcionHorarioEntity)
        private readonly excepcionHorarioRepository: Repository<ExcepcionHorarioEntity>,
        @InjectRepository(RolSesionEntity)
        private readonly rolSesionRepository: Repository<RolSesionEntity>,
        private readonly recetasService: RecetasService,
        private readonly sesionRepository: SesionConsultaRepository,
        private readonly participanteRepository: ParticipanteSesionRepository,
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

        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
            relations: ['persona', 'especialidades'],
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        if (!medico.activo) {
            throw new BadRequestException(
                'No se puede agendar una cita con este médico porque se encuentra inactivo',
            );
        }

        const fechaInicio = new Date(fechaHoraInicio);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMinutes(fechaFin.getMinutes() + CITA_DURACION_MINUTOS);

        const ahora = new Date();
        if (fechaInicio <= ahora) {
            throw new BadRequestException(
                'La fecha de la cita debe ser posterior a la fecha actual',
            );
        }

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

        // Validar que no haya excepción de horario para esta fecha/hora
        await this.validarExcepcionHorario(medicoId, fechaInicio);

        const estadoPendiente = await this.estadoCitaRepository.findOne({
            where: { nombre: EstadoCita.PENDIENTE },
        });

        if (!estadoPendiente) {
            throw new Error(
                'Error de configuración: estado "pendiente" no encontrado en la base de datos',
            );
        }

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
        const citas = await this.citaRepository.findRecientesCitas(
            pacienteId,
            4,
        );

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

        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para acceder a esta cita',
            );
        }

        return await this.mapToDetalladaResponseDto(cita);
    }

    /**
     * Obtiene una cita específica por ID para un médico
     * @param id - ID de la cita
     * @param medicoId - ID del médico autenticado
     * @returns Cita detallada con diagnóstico, recetas y derivaciones
     */
    async getCitaByIdMedico(
        id: number,
        medicoId: number,
    ): Promise<CitaDetalladaResponseDto> {
        const cita = await this.citaRepository.findByIdDetallada(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        if (cita.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'No tienes permiso para acceder a esta cita - solo el médico asignado puede verla',
            );
        }

        return await this.mapToDetalladaResponseDto(cita);
    }

    /**
     * Actualiza una cita existente
     * @param id - ID de la cita a actualizar
     * @param updateCitaDto - Nuevos datos de la cita
     * @param pacienteId - ID del paciente autenticado
     * @returns Objeto con la cita actualizada y metadata para invalidación de caché
     */
    async updateCita(
        id: number,
        updateCitaDto: UpdateCitaDto,
        pacienteId: number,
    ): Promise<{
        cita: CitaResponseDto;
        cacheMetadata: {
            medicoId: number;
            fechaAnterior: string;
            fechaNueva: string;
        };
    }> {
        const cita = await this.citaRepository.findById(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para modificar esta cita',
            );
        }

        if (cita.estado.nombre !== EstadoCita.PENDIENTE) {
            throw new BadRequestException(
                `Solo se pueden modificar citas con estado "pendiente". Estado actual: ${cita.estado.nombre}`,
            );
        }

        const ahora = new Date();
        const horasHastaCita =
            (cita.fechaHoraInicio.getTime() - ahora.getTime()) /
            (1000 * 60 * 60);

        if (horasHastaCita < CITA_HORAS_MINIMAS_MODIFICACION) {
            throw new BadRequestException(
                `Solo se pueden modificar citas con al menos ${CITA_HORAS_MINIMAS_MODIFICACION} horas de anticipación. Faltan ${Math.floor(horasHastaCita)} horas para tu cita.`,
            );
        }

        if (!updateCitaDto.fechaHoraInicio) {
            throw new BadRequestException(
                'Debes proporcionar una nueva fecha y hora para la cita',
            );
        }

        // Guardar fecha anterior para invalidación de caché
        const fechaAnterior = cita.fechaHoraInicio.toISOString().split('T')[0];
        const medicoId = cita.medico.usuarioId;

        const nuevaFechaInicio = new Date(updateCitaDto.fechaHoraInicio);
        if (nuevaFechaInicio <= ahora) {
            throw new BadRequestException(
                'La nueva fecha de la cita debe ser posterior a la fecha actual',
            );
        }

        const nuevaFechaFin = new Date(nuevaFechaInicio);
        nuevaFechaFin.setMinutes(
            nuevaFechaFin.getMinutes() + CITA_DURACION_MINUTOS,
        );

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

        const fechaNueva = nuevaFechaInicio.toISOString().split('T')[0];

        return {
            cita: this.mapToResponseDto(citaActualizada),
            cacheMetadata: {
                medicoId,
                fechaAnterior,
                fechaNueva,
            },
        };
    }

    /**
     * Cancela una cita (soft delete)
     * @param id - ID de la cita a cancelar
     * @param pacienteId - ID del paciente autenticado
     * @returns Mensaje de confirmación con datos para invalidación de caché
     */
    async deleteCita(
        id: number,
        pacienteId: number,
    ): Promise<{ message: string; medicoId: number; fecha: string }> {
        const cita = await this.citaRepository.findById(id);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${id} no encontrada`);
        }

        if (cita.paciente.usuarioId !== pacienteId) {
            throw new ForbiddenException(
                'No tienes permiso para cancelar esta cita',
            );
        }

        if (cita.estado.nombre !== EstadoCita.PENDIENTE) {
            throw new BadRequestException(
                `Solo se pueden cancelar citas con estado "pendiente". Estado actual: ${cita.estado.nombre}`,
            );
        }

        const ahora = new Date();
        const horasHastaCita =
            (cita.fechaHoraInicio.getTime() - ahora.getTime()) /
            (1000 * 60 * 60);

        if (horasHastaCita < CITA_HORAS_MINIMAS_MODIFICACION) {
            throw new BadRequestException(
                `Solo se pueden cancelar citas con al menos ${CITA_HORAS_MINIMAS_MODIFICACION} horas de anticipación. Faltan ${Math.floor(horasHastaCita)} horas para tu cita.`,
            );
        }

        const medicoId = cita.medico.usuarioId;
        const fecha = cita.fechaHoraInicio.toISOString().split('T')[0];

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
            medicoId,
            fecha,
        };
    }

    /**
     * Valida que no exista una excepción de horario para la fecha/hora de la cita
     * @param medicoId - ID del médico
     * @param fechaHoraInicio - Fecha y hora de inicio de la cita
     * @throws ConflictException si hay una excepción que bloquea la fecha/hora
     */
    private async validarExcepcionHorario(
        medicoId: number,
        fechaHoraInicio: Date,
    ): Promise<void> {
        const horaStr = fechaHoraInicio.toTimeString().slice(0, 5);

        const excepcion = await this.excepcionHorarioRepository.findOne({
            where: {
                medico: { usuarioId: medicoId },
                fecha: fechaHoraInicio,
            },
        });

        if (!excepcion) {
            return; // No hay excepción, todo OK
        }

        // Si es excepción de día completo (sin horas específicas)
        if (!excepcion.horaInicio && !excepcion.horaFin) {
            throw new ConflictException(
                excepcion.motivo ||
                    'El médico no atiende en esta fecha por una excepción de horario',
            );
        }

        // Si es excepción parcial, validar que la hora no esté en el rango
        if (excepcion.horaInicio && excepcion.horaFin) {
            if (
                horaStr >= excepcion.horaInicio &&
                horaStr < excepcion.horaFin
            ) {
                throw new ConflictException(
                    `El médico no atiende entre ${excepcion.horaInicio} y ${excepcion.horaFin}${excepcion.motivo ? ` (${excepcion.motivo})` : ''}`,
                );
            }
        }
    }

    /**
     * Mapea una entidad CitaEntity a CitaResponseDto
     * @param cita - Entidad de cita con relaciones cargadas
     * @returns CitaResponseDto
     */
    private mapToResponseDto(cita: CitaEntity): CitaResponseDto {
        const medicoInfo: MedicoInfoDto = {
            id: cita.medico.usuarioId,
            nombre: cita.medico.persona.primerNombre,
            apellido: cita.medico.persona.primerApellido,
            especialidad:
                cita.medico.especialidades &&
                cita.medico.especialidades.length > 0
                    ? cita.medico.especialidades[0].nombre
                    : 'No especificada',
        };

        const pacienteInfo: PacienteInfoDto = {
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
     * @param cita - Entidad CitaEntity
     * @returns CitaDetalladaResponseDto
     */
    private async mapToDetalladaResponseDto(
        cita: CitaEntity,
    ): Promise<CitaDetalladaResponseDto> {
        const baseDto = this.mapToResponseDto(cita);

        // Verificar si la cita tiene receta médica
        const tieneReceta = await this.recetasService.citaTieneReceta(cita.id);

        // Mapear la receta si existe
        let receta: RecetaDetalleDto | undefined;
        if (tieneReceta && cita.registroAtencion?.recetaMedica) {
            const recetaEntity = cita.registroAtencion.recetaMedica;
            const medicamentos: MedicamentoRecetaDetalleDto[] =
                recetaEntity.medicamentos?.map((rm) => ({
                    id: rm.medicamento.id,
                    nombre: rm.medicamento.nombre,
                    principioActivo: rm.medicamento.principioActivo,
                    concentracion: rm.medicamento.concentracion,
                    presentacion: rm.medicamento.presentacion.nombre,
                    duracion: rm.duracion,
                    frecuencia: rm.frecuencia,
                    cantidad: rm.cantidad,
                    viaAdministracion: rm.viaAdministracion.nombre,
                    unidadMedida: rm.unidadMedida.nombre,
                    indicaciones: rm.indicaciones,
                })) || [];

            receta = {
                id: recetaEntity.registroAtencionId,
                fechaHoraCreacion: recetaEntity.fechaHoraCreacion,
                observaciones: recetaEntity.observaciones,
                medicamentos,
            };
        }

        return {
            ...baseDto,
            motivoCita: cita.registroAtencion?.motivoCita || undefined,
            diagnostico: cita.registroAtencion?.diagnostico || undefined,
            observaciones: cita.registroAtencion?.observaciones || undefined,
            tieneReceta,
            tieneDerivaciones: false, // TODO: Implementar cuando exista el módulo de derivaciones
            receta,
        };
    }

    /**
     * Obtiene la lista de médicos disponibles
     * @param especialidadId - ID de especialidad para filtrar (opcional)
     * @returns Lista de médicos con sus especialidades
     */
    async getMedicosDisponibles(
        especialidadId?: number,
    ): Promise<MedicoDisponibleDto[]> {
        const queryBuilder = this.medicoRepository
            .createQueryBuilder('medico')
            .innerJoinAndSelect('medico.persona', 'persona')
            .leftJoinAndSelect('medico.especialidades', 'especialidad')
            .where('medico.activo = :activo', { activo: true });

        if (especialidadId) {
            queryBuilder.andWhere('especialidad.id = :especialidadId', {
                especialidadId,
            });
        }

        queryBuilder.orderBy('persona.primerApellido', 'ASC');

        const medicos = await queryBuilder.getMany();

        return medicos.map((medico) => this.mapToMedicoDisponibleDto(medico));
    }

    /**
     * Obtiene los días de atención de un médico
     * @param medicoId - ID del médico
     * @returns Lista de días de la semana en que atiende
     */
    async getDiasAtencion(medicoId: number): Promise<DiasAtencionResponseDto> {
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        if (!medico.activo) {
            throw new BadRequestException('El médico se encuentra inactivo');
        }

        const horarios = await this.horarioMedicoRepository.find({
            where: { medico: { usuarioId: medicoId } },
            relations: ['dia'],
            order: { dia: { id: 'ASC' } },
        });

        const diasAtencion = [...new Set(horarios.map((h) => h.dia.nombre))];

        return { diasAtencion };
    }

    /**
     * Mapea una entidad MedicoEntity a MedicoDisponibleDto
     */
    private mapToMedicoDisponibleDto(
        medico: MedicoEntity,
    ): MedicoDisponibleDto {
        return {
            id: medico.usuarioId,
            nombre: medico.persona.primerNombre,
            apellido: medico.persona.primerApellido,
            especialidades: (medico.especialidades || []).map((esp) => ({
                id: esp.id,
                nombre: esp.nombre,
            })),
        };
    }

    /**
     * Obtiene los slots disponibles de un médico para una fecha específica
     * Considera excepciones de horario (completas y parciales)
     * @param medicoId - ID del médico
     * @param fecha - Fecha a consultar (formato YYYY-MM-DD)
     * @returns DisponibilidadResponseDto con los slots disponibles
     */
    async getDisponibilidadMedico(
        medicoId: number,
        fecha: string,
    ): Promise<DisponibilidadResponseDto> {
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        if (!medico.activo) {
            throw new BadRequestException('El médico se encuentra inactivo');
        }

        const fechaDate = new Date(fecha + 'T00:00:00');
        const diaSemana = this.getDiaSemana(fechaDate);

        // Buscar excepciones para esta fecha
        const excepcion = await this.excepcionHorarioRepository.findOne({
            where: {
                medico: { usuarioId: medicoId },
                fecha: fechaDate,
            },
        });

        // Si hay excepción de día completo (sin horas específicas)
        if (excepcion && !excepcion.horaInicio && !excepcion.horaFin) {
            return {
                fecha,
                diaSemana,
                atiende: false,
                slots: [],
                mensaje: excepcion.motivo || 'El médico no atiende este día',
            };
        }

        const horario = await this.horarioMedicoRepository.findOne({
            where: {
                medico: { usuarioId: medicoId },
                dia: { nombre: diaSemana },
            },
            relations: ['dia'],
        });

        if (!horario) {
            return {
                fecha,
                diaSemana,
                atiende: false,
                slots: [],
                mensaje: `El médico no atiende los ${diaSemana.toLowerCase()}`,
            };
        }

        // Generar slots base según el horario del médico
        const slotsBase = this.generarSlots(
            horario.horaInicio,
            horario.horaFin,
        );

        // Obtener citas ya agendadas
        const citasAgendadas =
            await this.citaRepository.findCitasPendientesPorMedicoYFecha(
                medicoId,
                fecha,
            );

        const horasOcupadas = citasAgendadas.map((cita) => {
            const hora = cita.fechaHoraInicio.toTimeString().slice(0, 5);
            return hora;
        });

        // Si hay excepción parcial (con hora_inicio y hora_fin), agregar esas horas a ocupadas
        if (excepcion?.horaInicio && excepcion?.horaFin) {
            const slotsExcepcion = this.generarSlots(
                excepcion.horaInicio,
                excepcion.horaFin,
            );
            const horasExcepcion = slotsExcepcion.map(
                (slot) => slot.horaInicio,
            );
            horasOcupadas.push(...horasExcepcion);
        }

        // Filtrar slots disponibles (excluyendo citas y excepciones)
        const slotsDisponibles = slotsBase.filter(
            (slot) => !horasOcupadas.includes(slot.horaInicio),
        );

        // Si es hoy, filtrar horas pasadas
        const ahora = new Date();
        const esHoy = fecha === ahora.toISOString().split('T')[0];

        const slotsFiltrados = esHoy
            ? slotsDisponibles.filter((slot) => {
                  const [hora, minuto] = slot.horaInicio.split(':').map(Number);
                  const slotTime = new Date(fechaDate);
                  slotTime.setHours(hora, minuto, 0, 0);
                  return slotTime > ahora;
              })
            : slotsDisponibles;

        return {
            fecha,
            diaSemana,
            atiende: true,
            slots: slotsFiltrados,
            mensaje: excepcion?.motivo
                ? `Nota: ${excepcion.motivo} (horario reducido)`
                : undefined,
        };
    }

    /**
     * Obtiene el nombre del día de la semana en español
     */
    private getDiaSemana(fecha: Date): string {
        const dias = [
            'Domingo',
            'Lunes',
            'Martes',
            'Miércoles',
            'Jueves',
            'Viernes',
            'Sábado',
        ];
        return dias[fecha.getDay()];
    }

    /**
     * Genera slots de 30 minutos entre hora inicio y hora fin
     */
    private generarSlots(
        horaInicio: string,
        horaFin: string,
    ): SlotDisponibleDto[] {
        const slots: SlotDisponibleDto[] = [];
        const [inicioHora, inicioMin] = horaInicio.split(':').map(Number);
        const [finHora, finMin] = horaFin.split(':').map(Number);

        let currentHora = inicioHora;
        let currentMin = inicioMin;

        while (
            currentHora < finHora ||
            (currentHora === finHora && currentMin < finMin)
        ) {
            const horaInicioSlot = `${String(currentHora).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

            currentMin += CITA_DURACION_MINUTOS;
            if (currentMin >= 60) {
                currentHora += 1;
                currentMin -= 60;
            }

            if (
                currentHora > finHora ||
                (currentHora === finHora && currentMin > finMin)
            ) {
                break;
            }

            const horaFinSlot = `${String(currentHora).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

            slots.push({
                horaInicio: horaInicioSlot,
                horaFin: horaFinSlot,
            });
        }

        return slots;
    }

    /**
     * Obtiene las próximas citas pendientes de un médico
     * @param medicoId - ID del médico
     * @returns Array de citas pendientes ordenadas por fecha ascendente
     */
    async getProximasCitasMedico(medicoId: number): Promise<CitaResponseDto[]> {
        const citas = await this.citaRepository.findProximasCitasByMedico(
            medicoId,
            3,
        );

        return citas.map((cita) => this.mapToResponseDto(cita));
    }

    /**
     * Obtiene todas las citas de un médico con paginación
     * @param medicoId - ID del médico
     * @param page - Número de página
     * @param limit - Registros por página
     * @returns Respuesta paginada con todas las citas del médico
     */
    async getAllCitasMedico(
        medicoId: number,
        page: number,
        limit: number,
    ): Promise<PaginatedResponseDto<CitaResponseDto>> {
        const [citas, total] =
            await this.citaRepository.findAllCitasByMedicoPaginadas(
                medicoId,
                page,
                limit,
            );

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
     * Obtiene todas las citas de un médico para una fecha específica
     * @param medicoId - ID del médico
     * @param fecha - Fecha a consultar (formato YYYY-MM-DD)
     * @returns Array de citas del médico para esa fecha
     */
    async getCitasMedicoPorFecha(
        medicoId: number,
        fecha: string,
    ): Promise<CitaResponseDto[]> {
        const citas = await this.citaRepository.findCitasByMedicoYFecha(
            medicoId,
            fecha,
        );

        return citas.map((cita) => this.mapToResponseDto(cita));
    }

    /**
     * Finaliza una cita médica validando que el médico estuvo en la videollamada
     * por al menos 15 minutos
     *
     * @param citaId - ID de la cita
     * @param medicoId - ID del médico autenticado
     * @returns Cita finalizada
     */
    async finalizarCita(
        citaId: number,
        medicoId: number,
    ): Promise<CitaResponseDto> {
        const MINUTOS_MINIMOS_REQUERIDOS = 15;

        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findById(citaId);

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Verificar que el médico sea el asignado a la cita
        if (cita.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'Solo el médico asignado a la cita puede finalizarla',
            );
        }

        // 3. Verificar que la cita esté en estado pendiente
        if (cita.estado.nombre !== EstadoCita.PENDIENTE) {
            throw new BadRequestException(
                `Solo se pueden finalizar citas con estado "pendiente". Estado actual: ${cita.estado.nombre}`,
            );
        }

        // 4. Verificar que existe sesión de videollamada
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new BadRequestException(
                `No existe sesión de videollamada para la cita ${citaId}. Debe iniciar una videollamada antes de finalizar la cita.`,
            );
        }

        // 5. Buscar al médico como participante en la sesión
        const participanteMedico =
            await this.participanteRepository.findByUsuarioAndCita(
                medicoId,
                citaId,
            );

        if (!participanteMedico) {
            throw new BadRequestException(
                `El médico no participó en la videollamada de la cita ${citaId}`,
            );
        }

        // 6. Verificar que el participante tenga rol de médico
        const rolMedico = await this.rolSesionRepository.findOne({
            where: { nombre: 'medico' },
        });

        if (!rolMedico || participanteMedico.rol.id !== rolMedico.id) {
            throw new BadRequestException(
                'El participante encontrado no tiene rol de médico',
            );
        }

        // 7. Calcular tiempo de participación
        const fechaUnion = participanteMedico.fechaHoraUnion;
        const fechaSalida = participanteMedico.fechaHoraSalida;
        const estaActivo = fechaSalida === null;

        let minutosParticipacion = 0;

        if (estaActivo) {
            // Si sigue activo, calcular hasta ahora
            const ahora = new Date();
            minutosParticipacion =
                (ahora.getTime() - fechaUnion.getTime()) / (1000 * 60);
        } else if (fechaSalida) {
            // Si ya salió, calcular duración exacta
            minutosParticipacion =
                (fechaSalida.getTime() - fechaUnion.getTime()) / (1000 * 60);
        }

        // 8. Validar tiempo mínimo de 15 minutos
        if (minutosParticipacion < MINUTOS_MINIMOS_REQUERIDOS) {
            throw new BadRequestException(
                `El médico debe estar en la videollamada por al menos ${MINUTOS_MINIMOS_REQUERIDOS} minutos para poder finalizar la cita. ` +
                    `Tiempo actual: ${Math.floor(minutosParticipacion)} minutos. ` +
                    `${estaActivo ? 'La sesión aún está activa.' : 'La sesión ya finalizó.'}`,
            );
        }

        // 9. Buscar estado "atendida"
        const estadoAtendida = await this.estadoCitaRepository.findOne({
            where: { nombre: EstadoCita.ATENDIDA },
        });

        if (!estadoAtendida) {
            throw new Error(
                'Estado "atendida" no encontrado en la base de datos',
            );
        }

        // 10. Actualizar estado de la cita
        const citaActualizada = await this.citaRepository.update(citaId, {
            estado: estadoAtendida,
        });

        this.logger.log(
            `Cita ${citaId} finalizada por médico ${medicoId}. ` +
                `Tiempo de videollamada: ${Math.floor(minutosParticipacion)} minutos`,
        );

        return this.mapToResponseDto(citaActualizada!);
    }
}
