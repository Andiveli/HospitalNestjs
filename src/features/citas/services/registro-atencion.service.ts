import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RegistroAtencionEntity } from '../entities/registro-atencion.entity';
import { HistoriaClinicaEntity } from '../entities/historia-clinica.entity';
import { CitaEntity } from '../entities/cita.entity';
import { EstadoCita } from '../constants/estado-cita.constants';
import { CrearRegistroAtencionDto } from '../dto/crear-registro-atencion.dto';
import {
    RegistroAtencionCreadoResponseDto,
    MedicoRegistroInfoDto,
    PacienteRegistroInfoDto,
    HistoriaClinicaInfoDto,
    RecetaRegistroInfoDto,
    MedicamentoRegistroInfoDto,
} from '../dto/registro-atencion-response.dto';
import { RecetaMedicaRepository } from '../../recetas/repositories/receta-medica.repository';
import { MedicamentoRepository } from '../../recetas/repositories/medicamento.repository';
import { RecetaMedicaEntity } from '../../recetas/entities/receta-medica.entity';
import { RecetaMedicamentoEntity } from '../../recetas/entities/receta-medicamento.entity';

@Injectable()
export class RegistroAtencionService {
    private readonly logger = new Logger(RegistroAtencionService.name);

    constructor(
        @InjectRepository(RegistroAtencionEntity)
        private readonly registroAtencionRepository: Repository<RegistroAtencionEntity>,
        @InjectRepository(HistoriaClinicaEntity)
        private readonly historiaClinicaRepository: Repository<HistoriaClinicaEntity>,
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
        private readonly recetaMedicaRepository: RecetaMedicaRepository,
        private readonly medicamentoRepository: MedicamentoRepository,
        private readonly dataSource: DataSource,
    ) {}

    /**
     * Crea un registro de atención médica completo
     * - Verifica/Crea la historia clínica del paciente
     * - Crea el registro de atención con diagnóstico y observaciones
     * - Opcionalmente crea la receta médica con medicamentos
     *
     * @param dto - Datos del registro de atención
     * @param medicoId - ID del médico autenticado
     * @returns Registro de atención creado con toda la información
     */
    async crearRegistroAtencion(
        dto: CrearRegistroAtencionDto,
        medicoId: number,
    ): Promise<RegistroAtencionCreadoResponseDto> {
        const {
            citaId,
            diagnostico,
            observaciones,
            observacionesReceta,
            medicamentos,
        } = dto;

        // 1. Verificar que la cita existe y está en estado "Atendida"
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: [
                'estado',
                'medico',
                'medico.persona',
                'paciente',
                'paciente.person',
            ],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        if (cita.estado.nombre !== EstadoCita.ATENDIDA) {
            throw new BadRequestException(
                `Solo se pueden crear registros de atención para citas en estado "Atendida". Estado actual: ${cita.estado.nombre}`,
            );
        }

        // 2. Verificar que el médico autenticado es el médico de la cita
        if (cita.medico.usuarioId !== medicoId) {
            throw new ForbiddenException(
                'Solo el médico asignado a la cita puede crear el registro de atención',
            );
        }

        // 3. Verificar que no existe ya un registro de atención para esta cita
        const registroExistente = await this.registroAtencionRepository.findOne(
            {
                where: { citaId },
            },
        );

        if (registroExistente) {
            throw new BadRequestException(
                `Ya existe un registro de atención para la cita ${citaId}`,
            );
        }

        // Obtener ID del paciente
        const pacienteId = cita.paciente.usuarioId;

        // 4. Verificar/Crear historia clínica (usando transacción para integridad)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        let registroAtencion: RegistroAtencionEntity;
        let recetaCreada: RecetaMedicaEntity | null = null;

        try {
            // Verificar si existe historia clínica
            let historiaClinica = await this.historiaClinicaRepository.findOne({
                where: { pacienteId },
            });

            // Si no existe, crearla
            if (!historiaClinica) {
                historiaClinica = this.historiaClinicaRepository.create({
                    pacienteId,
                    fechaHoraApertura: new Date(),
                });
                await queryRunner.manager.save(historiaClinica);
                this.logger.log(
                    `Historia clínica creada para paciente ${pacienteId}`,
                );
            }

            // 5. Crear el registro de atención
            registroAtencion = this.registroAtencionRepository.create({
                citaId,
                diagnostico,
                observaciones,
                fechaHoraCreacion: new Date(),
                historiaClinica,
            });
            await queryRunner.manager.save(registroAtencion);
            this.logger.log(`Registro de atención creado para cita ${citaId}`);

            // 6. Si hay medicamentos, crear la receta médica
            if (medicamentos && medicamentos.length > 0) {
                // Validar que existan medicamentos, vías y unidades
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
                    await this.medicamentoRepository.existenViasAdministracion(
                        viaIds,
                    );

                if (!viasExisten) {
                    throw new BadRequestException(
                        'Una o más vías de administración no existen en el sistema',
                    );
                }

                const unidadIds = medicamentos.map((m) => m.unidadMedidaId);
                const unidadesExisten =
                    await this.medicamentoRepository.existenUnidadesMedida(
                        unidadIds,
                    );

                if (!unidadesExisten) {
                    throw new BadRequestException(
                        'Una o más unidades de medida no existen en el sistema',
                    );
                }

                // Preparar medicamentos para la receta
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

                // Crear la receta médica
                const recetaData: Partial<RecetaMedicaEntity> = {
                    registroAtencionId: citaId,
                    medicoId,
                    fechaHoraCreacion: new Date(),
                    observaciones: observacionesReceta,
                    medicamentos:
                        recetaMedicamentos as RecetaMedicamentoEntity[],
                };

                const receta = this.dataSource
                    .getRepository(RecetaMedicaEntity)
                    .create(recetaData);
                await queryRunner.manager.save(receta);

                // Recuperar la receta completa con relaciones
                recetaCreada =
                    await this.recetaMedicaRepository.findByRegistroAtencionId(
                        citaId,
                    );

                this.logger.log(`Receta médica creada para cita ${citaId}`);
            }

            // Confirmar transacción
            await queryRunner.commitTransaction();
        } catch (error) {
            // Revertir transacción en caso de error
            await queryRunner.rollbackTransaction();
            this.logger.error(
                `Error al crear registro de atención: ${(error as Error).message}`,
            );
            throw error;
        } finally {
            await queryRunner.release();
        }

        // 7. Mapear respuesta
        return this.mapToResponseDto(registroAtencion, cita, recetaCreada);
    }

    /**
     * Mapea las entidades a DTO de respuesta
     */
    private mapToResponseDto(
        registro: RegistroAtencionEntity,
        cita: CitaEntity,
        receta: RecetaMedicaEntity | null,
    ): RegistroAtencionCreadoResponseDto {
        // Información del médico
        const medicoInfo: MedicoRegistroInfoDto = {
            id: cita.medico.usuarioId,
            nombreCompleto: `${cita.medico.persona.primerNombre} ${cita.medico.persona.primerApellido}`,
            especialidad:
                cita.medico.especialidades?.[0]?.nombre || 'No especificada',
        };

        // Información del paciente
        const pacienteInfo: PacienteRegistroInfoDto = {
            id: cita.paciente.usuarioId,
            nombreCompleto: `${cita.paciente.person.primerNombre} ${cita.paciente.person.primerApellido}`,
        };

        // Información de la historia clínica
        const historiaInfo: HistoriaClinicaInfoDto = {
            id: cita.paciente.usuarioId,
            fechaHoraApertura:
                registro.historiaClinica.fechaHoraApertura.toISOString(),
        };

        // Información de la receta (si existe)
        let recetaInfo: RecetaRegistroInfoDto | undefined;
        if (receta) {
            const medicamentosInfo: MedicamentoRegistroInfoDto[] =
                receta.medicamentos?.map((rm) => ({
                    id: rm.medicamento.id,
                    nombre: rm.medicamento.nombre,
                    principioActivo: rm.medicamento.principioActivo,
                    concentracion: rm.medicamento.concentracion,
                    duracion: rm.duracion,
                    frecuencia: rm.frecuencia,
                    cantidad: rm.cantidad,
                    viaAdministracion: rm.viaAdministracion.nombre,
                    unidadMedida: rm.unidadMedida.nombre,
                    indicaciones: rm.indicaciones,
                })) || [];

            recetaInfo = {
                id: receta.registroAtencionId,
                fechaHoraCreacion: receta.fechaHoraCreacion.toISOString(),
                observaciones: receta.observaciones,
                medicamentos: medicamentosInfo,
            };
        }

        return {
            id: registro.citaId,
            diagnostico: registro.diagnostico || '',
            observaciones: registro.observaciones,
            fechaHoraCreacion: registro.fechaHoraCreacion.toISOString(),
            medico: medicoInfo,
            paciente: pacienteInfo,
            historiaClinica: historiaInfo,
            receta: recetaInfo,
        };
    }
}
