import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';
import { CitaEntity } from '../citas/entities/cita.entity';
import { EstadoCita } from '../citas/constants/estado-cita.constants';
import { RecetaMedicaRepository } from '../recetas/repositories/receta-medica.repository';
import { DocumentsEntity } from '../documents/documents.entity';
import {
    HistoriaClinicaResponseDto,
    PacienteHistoriaDto,
    EnfermedadHistoriaDto,
    CitaHistoriaDto,
    RecetaHistoriaDto,
    DocumentoHistoriaDto,
    ResumenHistoriaDto,
} from './dto/historia-clinica.dto';
import { RecetaMedicamentoEntity } from '../recetas/entities/receta-medicamento.entity';

@Injectable()
export class HistoriasClinicasService {
    constructor(
        @InjectRepository(PacientesEntity)
        private readonly pacienteRepository: Repository<PacientesEntity>,
        @InjectRepository(HistoriaClinicaEntity)
        private readonly historiaRepository: Repository<HistoriaClinicaEntity>,
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
        @InjectRepository(DocumentsEntity)
        private readonly documentoRepository: Repository<DocumentsEntity>,
        private readonly recetaMedicaRepository: RecetaMedicaRepository,
    ) {}

    /**
     * Obtiene la historia clínica completa de un paciente
     * @param pacienteId - ID del paciente
     * @param usuarioId - ID del usuario que solicita (paciente o médico)
     * @param rol - Rol del usuario (Paciente o Medico)
     * @returns HistoriaClinicaResponseDto con toda la información consolidada
     */
    async getHistoriaClinica(
        pacienteId: number,
        usuarioId: number,
        roles: string[],
    ): Promise<HistoriaClinicaResponseDto> {
        if (roles.includes('Paciente') && pacienteId !== usuarioId) {
            throw new ForbiddenException(
                'No tienes permiso para ver la historia clínica de otro paciente',
            );
        }

        if (roles.includes('Medico')) {
            const haAtendido = await this.verificarMedicoAtendioPaciente(
                usuarioId,
                pacienteId,
            );
            if (!haAtendido) {
                throw new ForbiddenException(
                    'No has atendido a este paciente, no puedes ver su historia clínica',
                );
            }
        }

        const paciente = await this.pacienteRepository.findOne({
            where: { usuarioId: pacienteId },
            relations: ['person', 'grupoSanguineo', 'estiloVida'],
        });

        if (!paciente) {
            throw new NotFoundException(
                `Paciente con ID ${pacienteId} no encontrado`,
            );
        }

        let historia = await this.historiaRepository.findOne({
            where: { pacienteId },
        });

        if (!historia) {
            historia = this.historiaRepository.create({
                pacienteId,
                fechaHoraApertura: new Date(),
            });
            historia = await this.historiaRepository.save(historia);
        }

        const pacienteConEnfermedades = await this.pacienteRepository.findOne({
            where: { usuarioId: pacienteId },
            relations: [
                'pacienteEnfermedades',
                'pacienteEnfermedades.enfermedad',
                'pacienteEnfermedades.enfermedad.tipo',
            ],
        });

        const citas = await this.citaRepository.find({
            where: { paciente: { usuarioId: pacienteId } },
            relations: [
                'medico',
                'medico.persona',
                'medico.especialidades',
                'estado',
                'registroAtencion',
            ],
            order: { fechaHoraInicio: 'DESC' },
            take: 20,
        });

        const documentos = await this.documentoRepository.find({
            where: { historia: { pacienteId } },
            relations: ['tipo'],
            order: { fechaHoraSubida: 'DESC' },
            take: 10,
        });

        const pacienteDto: PacienteHistoriaDto = {
            id: paciente.usuarioId,
            nombreCompleto: `${paciente.person.primerNombre} ${paciente.person.primerApellido}`,
            fechaNacimiento: paciente.fechaNacimiento,
            genero: paciente.person.genero?.nombre || 'No especificado',
            tipoSangre: paciente.grupoSanguineo?.nombre,
            estiloVida: paciente.estiloVida?.nombre,
        };

        const enfermedadesDto: EnfermedadHistoriaDto[] =
            pacienteConEnfermedades?.pacienteEnfermedades?.map((pe) => ({
                nombre: pe.enfermedad.nombre,
                tipo: pe.tipoEnfermedad?.nombre || 'No clasificada',
                observaciones: pe.detalle,
            })) || [];

        const citasDto: CitaHistoriaDto[] = await Promise.all(
            citas.map(async (cita) => {
                const tieneReceta =
                    await this.recetaMedicaRepository.existsByRegistroAtencionId(
                        cita.id,
                    );
                let recetaDto: RecetaHistoriaDto | undefined;

                if (tieneReceta && cita.registroAtencion) {
                    const receta =
                        await this.recetaMedicaRepository.findByRegistroAtencionId(
                            cita.id,
                        );
                    if (!receta)
                        throw new NotFoundException('Receta no encontrada');

                    recetaDto = {
                        id: receta.registroAtencionId,
                        fechaEmision: receta.fechaHoraCreacion,
                        medicoNombre: `${receta.medico.persona.primerNombre} ${receta.medico.persona.primerApellido}`,
                        medicoEspecialidad:
                            receta.medico.especialidades?.[0]?.nombre ||
                            'No especificada',
                        diagnostico: cita.registroAtencion.diagnostico || '',
                        observaciones: receta.observaciones,
                        medicamentos:
                            receta.medicamentos?.map(
                                (rm: RecetaMedicamentoEntity) => ({
                                    nombre: rm.medicamento.nombre,
                                    duracion: rm.duracion,
                                    frecuencia: rm.frecuencia,
                                    cantidad: rm.cantidad,
                                    viaAdministracion:
                                        rm.viaAdministracion.nombre,
                                }),
                            ) || [],
                    };
                }

                return {
                    id: cita.id,
                    fecha: cita.fechaHoraInicio,
                    estado: cita.estado.nombre,
                    medicoNombre: `${cita.medico.persona.primerNombre} ${cita.medico.persona.primerApellido}`,
                    medicoEspecialidad:
                        cita.medico.especialidades?.[0]?.nombre ||
                        'No especificada',
                    diagnostico:
                        cita.registroAtencion?.diagnostico || undefined,
                    observaciones:
                        cita.registroAtencion?.observaciones || undefined,
                    tieneReceta,
                    receta: recetaDto,
                };
            }),
        );

        const documentosDto: DocumentoHistoriaDto[] = documentos.map((doc) => ({
            id: doc.id,
            titulo: doc.titulo,
            tipo: doc.tipo?.nombre || 'No clasificado',
            fechaSubida: doc.fechaHoraSubida,
        }));

        const citasAtendidas = citas.filter(
            (c) => c.estado.nombre === EstadoCita.ATENDIDA,
        );
        const ultimaAtencion = citasAtendidas[0]?.fechaHoraInicio;
        const proximaCita = citas.find(
            (c) => c.estado.nombre === EstadoCita.PENDIENTE,
        )?.fechaHoraInicio;

        const resumenDto: ResumenHistoriaDto = {
            totalCitas: citas.length,
            totalRecetas: citasDto.filter((c) => c.tieneReceta).length,
            totalDocumentos: await this.documentoRepository.count({
                where: { historia: { pacienteId } },
            }),
            totalEnfermedades: enfermedadesDto.length,
            ultimaAtencion,
            proximaCita,
        };

        return {
            id: historia.pacienteId,
            paciente: pacienteDto,
            enfermedades: enfermedadesDto,
            citas: citasDto,
            documentos: documentosDto,
            resumen: resumenDto,
        };
    }

    /**
     * Verifica si un médico ha atendido al paciente
     * @param medicoId - ID del médico
     * @param pacienteId - ID del paciente
     * @returns true si el médico ha atendido al paciente
     */
    private async verificarMedicoAtendioPaciente(
        medicoId: number,
        pacienteId: number,
    ): Promise<boolean> {
        const count = await this.citaRepository.count({
            where: {
                medico: { usuarioId: medicoId },
                paciente: { usuarioId: pacienteId },
                estado: { nombre: EstadoCita.ATENDIDA },
            },
        });
        return count > 0;
    }
}
