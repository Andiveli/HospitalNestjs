import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegistroAtencionEntity } from '../citas/entities/registro-atencion.entity';
import { EstadoCita } from '../citas/constants/estado-cita.constants';
import { CreateRecetaDto } from './dto/create-receta.dto';
import {
    RecetaResponseDto,
    MedicamentoInfoDto,
    MedicoRecetaInfoDto,
    RecetasCitaResponseDto,
} from './dto/receta-response.dto';
import {
    RecetasPacienteResponseDto,
    RecetaPacienteDto,
    MedicamentoRecetaPacienteDto,
    MedicoRecetaPacienteDto,
} from './dto/recetas-paciente.dto';
import { RecetaMedicaEntity } from './entities/receta-medica.entity';
import { RecetaMedicamentoEntity } from './entities/receta-medicamento.entity';
import { RecetaMedicaRepository } from './repositories/receta-medica.repository';
import { MedicamentoRepository } from './repositories/medicamento.repository';

@Injectable()
export class RecetasService {
    constructor(
        private readonly recetaMedicaRepository: RecetaMedicaRepository,
        private readonly medicamentoRepository: MedicamentoRepository,
        @InjectRepository(RegistroAtencionEntity)
        private readonly registroAtencionRepository: Repository<RegistroAtencionEntity>,
    ) {}

    /**
     * Crea una nueva receta médica
     * Solo los médicos pueden crear recetas y solo cuando la cita está "Atendida"
     * @param createRecetaDto - Datos de la receta a crear
     * @param medicoId - ID del médico autenticado
     * @returns RecetaResponseDto con la información de la receta creada
     */
    async createReceta(
        createRecetaDto: CreateRecetaDto,
        medicoId: number,
    ): Promise<RecetaResponseDto> {
        const { registroAtencionId, observaciones, medicamentos } =
            createRecetaDto;

        const registroAtencion = await this.registroAtencionRepository.findOne({
            where: { citaId: registroAtencionId },
            relations: ['cita', 'cita.estado', 'cita.medico'],
        });

        if (!registroAtencion) {
            throw new NotFoundException(
                `Registro de atención con ID ${registroAtencionId} no encontrado`,
            );
        }

        if (registroAtencion.cita.estado.nombre !== EstadoCita.ATENDIDA) {
            throw new BadRequestException(
                `Solo se pueden crear recetas para citas en estado "Atendida". Estado actual: ${registroAtencion.cita.estado.nombre}`,
            );
        }

        if (registroAtencion.cita.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'Solo el médico asignado a la cita puede crear recetas para esta atención',
            );
        }

        const existeReceta =
            await this.recetaMedicaRepository.existsByRegistroAtencionId(
                registroAtencionId,
            );

        if (existeReceta) {
            throw new ConflictException(
                `Ya existe una receta médica para el registro de atención ${registroAtencionId}`,
            );
        }

        const medicamentoIds = medicamentos.map((m) => m.medicamentoId);
        const medicamentosExisten =
            await this.medicamentoRepository.existenMedicamentos(
                medicamentoIds,
            );

        if (!medicamentosExisten) {
            throw new BadRequestException(
                'Uno o más medicamentos no existen en el sistema',
            );
        }

        const viaIds = medicamentos.map((m) => m.viaAdministracionId);
        const viasExisten =
            await this.medicamentoRepository.existenViasAdministracion(viaIds);

        if (!viasExisten) {
            throw new BadRequestException(
                'Una o más vías de administración no existen en el sistema',
            );
        }

        const unidadIds = medicamentos.map((m) => m.unidadMedidaId);
        const unidadesExisten =
            await this.medicamentoRepository.existenUnidadesMedida(unidadIds);

        if (!unidadesExisten) {
            throw new BadRequestException(
                'Una o más unidades de medida no existen en el sistema',
            );
        }

        const recetaMedicamentos: Partial<RecetaMedicamentoEntity>[] =
            medicamentos.map((med) => ({
                medicamentoId: med.medicamentoId,
                duracion: med.duracion,
                frecuencia: med.frecuencia,
                cantidad: med.cantidad,
                viaAdministracionId: med.viaAdministracionId,
                unidadMedidaId: med.unidadMedidaId,
                indicaciones: med.indicaciones,
            }));

        const recetaData: Partial<RecetaMedicaEntity> = {
            registroAtencionId,
            medicoId,
            fechaHoraCreacion: new Date(),
            observaciones,
            medicamentos: recetaMedicamentos as RecetaMedicamentoEntity[],
        };

        const recetaGuardada =
            await this.recetaMedicaRepository.create(recetaData);

        return this.mapToResponseDto(recetaGuardada);
    }

    /**
     * Obtiene una receta médica por ID de registro de atención
     * @param registroAtencionId - ID del registro de atención
     * @returns RecetaResponseDto o null si no existe
     */
    async getRecetaByRegistroAtencionId(
        registroAtencionId: number,
    ): Promise<RecetasCitaResponseDto> {
        const receta =
            await this.recetaMedicaRepository.findByRegistroAtencionId(
                registroAtencionId,
            );

        if (!receta) {
            return {
                citaId: registroAtencionId,
                tieneReceta: false,
            };
        }

        return {
            citaId: registroAtencionId,
            tieneReceta: true,
            receta: this.mapToResponseDto(receta),
        };
    }

    /**
     * Verifica si una cita tiene receta médica
     * @param citaId - ID de la cita
     * @returns true si tiene receta, false si no
     */
    async citaTieneReceta(citaId: number): Promise<boolean> {
        return this.recetaMedicaRepository.existsByRegistroAtencionId(citaId);
    }

    /**
     * Obtiene todos los medicamentos disponibles
     * @returns Lista de medicamentos
     */
    async getMedicamentos(): Promise<
        Array<{
            id: number;
            nombre: string;
            principioActivo: string;
            concentracion?: string;
            presentacion: string;
        }>
    > {
        const medicamentos = await this.medicamentoRepository.findAll();

        return medicamentos.map((med) => ({
            id: med.id,
            nombre: med.nombre,
            principioActivo: med.principioActivo,
            concentracion: med.concentracion,
            presentacion: med.presentacion.nombre,
        }));
    }

    /**
     * Obtiene todas las vías de administración
     * @returns Lista de vías de administración
     */
    async getViasAdministracion(): Promise<
        Array<{ id: number; nombre: string }>
    > {
        const vias =
            await this.medicamentoRepository.findAllViasAdministracion();
        return vias.map((via) => ({
            id: via.id,
            nombre: via.nombre,
        }));
    }

    /**
     * Obtiene todas las unidades de medida
     * @returns Lista de unidades de medida
     */
    async getUnidadesMedida(): Promise<Array<{ id: number; nombre: string }>> {
        const unidades =
            await this.medicamentoRepository.findAllUnidadesMedida();
        return unidades.map((unidad) => ({
            id: unidad.id,
            nombre: unidad.nombre,
        }));
    }

    /**
     * Obtiene todas las recetas médicas de un paciente
     * @param pacienteId - ID del paciente
     * @returns RecetasPacienteResponseDto con todas las recetas, medicamentos, diagnósticos y observaciones
     */
    async getRecetasByPaciente(
        pacienteId: number,
    ): Promise<RecetasPacienteResponseDto> {
        const recetas =
            await this.recetaMedicaRepository.findAllByPacienteId(pacienteId);

        const recetasMapeadas: RecetaPacienteDto[] = recetas.map((receta) => {
            const medicoInfo: MedicoRecetaPacienteDto = {
                id: receta.medico.usuarioId,
                nombreCompleto: `${receta.medico.persona.primerNombre} ${receta.medico.persona.primerApellido}`,
                especialidad:
                    receta.medico.especialidades?.[0]?.nombre ||
                    'No especificada',
            };

            const medicamentosInfo: MedicamentoRecetaPacienteDto[] =
                receta.medicamentos?.map((rm: RecetaMedicamentoEntity) => ({
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

            return {
                id: receta.registroAtencionId,
                fechaHoraCreacion: receta.fechaHoraCreacion,
                medico: medicoInfo,
                diagnostico: receta.registroAtencion.diagnostico || '',
                observacionesAtencion:
                    receta.registroAtencion.observaciones || undefined,
                observacionesReceta: receta.observaciones || undefined,
                medicamentos: medicamentosInfo,
            };
        });

        return {
            pacienteId,
            totalRecetas: recetas.length,
            recetas: recetasMapeadas,
        };
    }

    /**
     * Mapea una entidad RecetaMedicaEntity a RecetaResponseDto
     * @param receta - Entidad de receta con relaciones cargadas
     * @returns RecetaResponseDto
     */
    private mapToResponseDto(receta: RecetaMedicaEntity): RecetaResponseDto {
        const medicoInfo: MedicoRecetaInfoDto = {
            id: receta.medico.usuarioId,
            nombre: receta.medico.persona.primerNombre,
            apellido: receta.medico.persona.primerApellido,
        };

        const medicamentosInfo: MedicamentoInfoDto[] =
            receta.medicamentos?.map((rm: RecetaMedicamentoEntity) => ({
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

        return {
            registroAtencionId: receta.registroAtencionId,
            fechaHoraCreacion: receta.fechaHoraCreacion,
            medico: medicoInfo,
            observaciones: receta.observaciones,
            medicamentos: medicamentosInfo,
        };
    }
}
