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
import { ExcepcionHorarioEntity } from '../excepcion-horario.entity';
import { MedicoEntity } from '../../medicos/medicos.entity';
import { ExcepcionesHorarioRepository } from '../repositories/excepciones-horario.repository';
import { CreateExcepcionDto } from '../dto/create-excepcion.dto';
import { UpdateExcepcionDto } from '../dto/update-excepcion.dto';
import {
    ExcepcionResponseDto,
    MedicoExcepcionInfoDto,
} from '../dto/excepcion-response.dto';

@Injectable()
export class ExcepcionesHorarioService {
    private readonly logger = new Logger(ExcepcionesHorarioService.name);

    constructor(
        private readonly excepcionesRepository: ExcepcionesHorarioRepository,
        @InjectRepository(MedicoEntity)
        private readonly medicoRepository: Repository<MedicoEntity>,
    ) {}

    /**
     * Crea una nueva excepción de horario para un médico
     * @param dto - Datos de la excepción
     * @param medicoId - ID del médico autenticado
     * @returns La excepción creada
     */
    async create(
        dto: CreateExcepcionDto,
        medicoId: number,
    ): Promise<ExcepcionResponseDto> {
        const { fecha, horaInicio, horaFin, motivo } = dto;

        // 1. Validar que el médico exista
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
            relations: ['persona', 'especialidades'],
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        // 2. Validar que no exista otra excepción para la misma fecha
        const existeExcepcion =
            await this.excepcionesRepository.findByMedicoYFecha(
                medicoId,
                new Date(fecha),
            );

        if (existeExcepcion) {
            throw new ConflictException(
                `Ya existe una excepción para la fecha ${fecha}. Use el endpoint de actualización para modificarla.`,
            );
        }

        // 3. Validar que la fecha sea futura (no permitir excepciones en el pasado)
        const fechaExcepcion = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaExcepcion < hoy) {
            throw new BadRequestException(
                'No se pueden crear excepciones para fechas pasadas',
            );
        }

        // 4. Si se proporcionan horas, validar que horaFin > horaInicio
        if (horaInicio && horaFin) {
            if (horaFin <= horaInicio) {
                throw new BadRequestException(
                    'La hora de fin debe ser mayor a la hora de inicio',
                );
            }
        }

        // 5. Crear la excepción
        const excepcion = new ExcepcionHorarioEntity();
        excepcion.fecha = fechaExcepcion;
        excepcion.horaInicio = horaInicio;
        excepcion.horaFin = horaFin;
        excepcion.motivo = motivo;
        excepcion.confirmada = dto.confirmada ?? false;
        excepcion.medico = medico;

        const guardada = await this.excepcionesRepository.create(excepcion);

        this.logger.log(
            `Excepción creada para médico ${medicoId} en fecha ${fecha}`,
        );

        return this.mapToResponseDto(guardada);
    }

    /**
     * Obtiene todas las excepciones del médico autenticado
     * @param medicoId - ID del médico
     * @returns Lista de excepciones
     */
    async findByMedico(medicoId: number): Promise<ExcepcionResponseDto[]> {
        console.log(
            '-------------------------------------------------------------------CALLING FIND BY MEDICO-------------------------------------------------------------------',
        );
        console.log(medicoId, typeof medicoId);
        const excepciones =
            await this.excepcionesRepository.findByMedico(medicoId);

        return excepciones.map((e) => this.mapToResponseDto(e));
    }

    /**
     * Obtiene las excepciones futuras del médico (desde hoy en adelante)
     * @param medicoId - ID del médico
     * @returns Lista de excepciones futuras
     */
    async findFuturasByMedico(
        medicoId: number,
    ): Promise<ExcepcionResponseDto[]> {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const excepciones =
            await this.excepcionesRepository.findFuturasByMedico(medicoId, hoy);

        return excepciones.map((e) => this.mapToResponseDto(e));
    }

    /**
     * Actualiza una excepción existente
     * @param id - ID de la excepción
     * @param dto - Datos a actualizar
     * @param medicoId - ID del médico autenticado
     * @returns La excepción actualizada
     */
    async update(
        id: number,
        dto: UpdateExcepcionDto,
        medicoId: number,
    ): Promise<ExcepcionResponseDto> {
        // 1. Verificar que la excepción exista y pertenezca al médico
        const excepcion = await this.excepcionesRepository.findById(id);

        if (!excepcion) {
            throw new NotFoundException(`Excepción con ID ${id} no encontrada`);
        }

        if (excepcion.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'No tiene permiso para modificar esta excepción',
            );
        }

        // 2. Si se cambia la fecha, validar que no sea pasada y no exista otra
        if (dto.fecha) {
            const nuevaFecha = new Date(dto.fecha);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            if (nuevaFecha < hoy) {
                throw new BadRequestException(
                    'No se pueden asignar fechas pasadas',
                );
            }

            // Verificar que no exista otra excepción en esa fecha
            const existeOtra =
                await this.excepcionesRepository.findByMedicoYFechaExcluyendoId(
                    medicoId,
                    nuevaFecha,
                    id,
                );

            if (existeOtra) {
                throw new ConflictException(
                    `Ya existe otra excepción para la fecha ${dto.fecha}`,
                );
            }

            excepcion.fecha = nuevaFecha;
        }

        // 3. Validar horas si se proporcionan
        const horaInicioFinal = dto.horaInicio ?? excepcion.horaInicio;
        const horaFinFinal = dto.horaFin ?? excepcion.horaFin;

        if (
            horaInicioFinal &&
            horaFinFinal &&
            horaFinFinal <= horaInicioFinal
        ) {
            throw new BadRequestException(
                'La hora de fin debe ser mayor a la hora de inicio',
            );
        }

        // 4. Actualizar campos
        if (dto.horaInicio !== undefined)
            excepcion.horaInicio = dto.horaInicio || undefined;
        if (dto.horaFin !== undefined)
            excepcion.horaFin = dto.horaFin || undefined;
        if (dto.motivo !== undefined)
            excepcion.motivo = dto.motivo || undefined;
        if (dto.confirmada !== undefined) excepcion.confirmada = dto.confirmada;

        const actualizada = await this.excepcionesRepository.save(excepcion);

        this.logger.log(`Excepción ${id} actualizada por médico ${medicoId}`);

        return this.mapToResponseDto(actualizada);
    }

    /**
     * Elimina una excepción
     * @param id - ID de la excepción
     * @param medicoId - ID del médico autenticado
     */
    async delete(id: number, medicoId: number): Promise<void> {
        // 1. Verificar que exista y pertenezca al médico
        const excepcion = await this.excepcionesRepository.findById(id);

        if (!excepcion) {
            throw new NotFoundException(`Excepción con ID ${id} no encontrada`);
        }

        if (excepcion.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'No tiene permiso para eliminar esta excepción',
            );
        }

        await this.excepcionesRepository.delete(id);

        this.logger.log(`Excepción ${id} eliminada por médico ${medicoId}`);
    }

    /**
     * Obtiene todas las excepciones de todos los médicos (vista admin)
     * @returns Lista de excepciones agrupadas por médico
     */
    async findAll(): Promise<
        Array<{
            medico: MedicoExcepcionInfoDto;
            totalExcepciones: number;
            excepciones: ExcepcionResponseDto[];
        }>
    > {
        // Obtener todos los médicos con excepciones
        const excepciones = await this.excepcionesRepository.findAll();

        // Agrupar por médico
        const grouped = excepciones.reduce(
            (acc, excepcion) => {
                const medicoId = excepcion.medico.usuarioId;

                if (!acc[medicoId]) {
                    const medico = excepcion.medico;
                    acc[medicoId] = {
                        medico: {
                            id: medico.usuarioId,
                            nombreCompleto: `${medico.persona.primerNombre} ${medico.persona.primerApellido}`,
                            especialidad: medico.especialidades?.[0]?.nombre,
                        },
                        totalExcepciones: 0,
                        excepciones: [],
                    };
                }

                acc[medicoId].totalExcepciones++;
                acc[medicoId].excepciones.push(
                    this.mapToResponseDto(excepcion),
                );

                return acc;
            },
            {} as Record<
                number,
                {
                    medico: MedicoExcepcionInfoDto;
                    totalExcepciones: number;
                    excepciones: ExcepcionResponseDto[];
                }
            >,
        );

        return Object.values(grouped);
    }

    /**
     * Obtiene excepciones de un médico específico (vista admin)
     * @param medicoId - ID del médico
     * @returns Excepciones del médico
     */
    async findByMedicoIdAdmin(medicoId: number): Promise<{
        medico: MedicoExcepcionInfoDto;
        totalExcepciones: number;
        excepciones: ExcepcionResponseDto[];
    }> {
        // Verificar que el médico existe
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
            relations: ['persona', 'especialidades'],
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        const excepciones =
            await this.excepcionesRepository.findByMedico(medicoId);

        return {
            medico: {
                id: medico.usuarioId,
                nombreCompleto: `${medico.persona.primerNombre} ${medico.persona.primerApellido}`,
                especialidad: medico.especialidades?.[0]?.nombre,
            },
            totalExcepciones: excepciones.length,
            excepciones: excepciones.map((e) => this.mapToResponseDto(e)),
        };
    }

    /**
     * Mapea una entidad a DTO de respuesta
     */
    private mapToResponseDto(
        excepcion: ExcepcionHorarioEntity,
    ): ExcepcionResponseDto {
        const diaCompleto = !excepcion.horaInicio && !excepcion.horaFin;

        // MySQL devuelve DATE como string, no como objeto Date
        const fechaStr =
            excepcion.fecha instanceof Date
                ? excepcion.fecha.toISOString().split('T')[0]
                : String(excepcion.fecha).split('T')[0];

        return {
            id: excepcion.id,
            fecha: fechaStr,
            horaInicio: excepcion.horaInicio || null,
            horaFin: excepcion.horaFin || null,
            motivo: excepcion.motivo || null,
            diaCompleto,
            confirmada: excepcion.confirmada ?? false,
        };
    }
}
