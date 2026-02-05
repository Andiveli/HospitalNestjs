import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { HistoriaClinicaRepository } from './repositories/historia-clinica.repository';
import {
    HistoriaClinicaCompletaDto,
    PacienteHistoriaDto,
    EnfermedadPacienteHistoriaDto,
    RegistroAtencionHistoriaDto,
    RecetaHistoriaDto,
    MedicamentoRecetaHistoriaDto,
    MedicoAtencionHistoriaDto,
    DocumentoHistoriaDto,
    HistoriaClinicaNoExisteDto,
} from './dto';

/**
 * Servicio para gestionar la historia clínica del paciente
 * Proporciona acceso a toda la información médica relevante
 */
@Injectable()
export class HistoriaClinicaService {
    constructor(
        private readonly historiaClinicaRepository: HistoriaClinicaRepository,
        @InjectRepository(PacientesEntity)
        private readonly pacientesRepository: Repository<PacientesEntity>,
    ) {}

    /**
     * Obtiene la historia clínica completa de un paciente
     * Incluye: datos del paciente, enfermedades, registros de atención,
     * recetas y documentos
     *
     * @param pacienteId - ID del paciente
     * @returns Historia clínica completa o indicador de que no existe
     */
    async obtenerHistoriaClinicaCompleta(
        pacienteId: number,
    ): Promise<HistoriaClinicaCompletaDto | HistoriaClinicaNoExisteDto> {
        // Verificar que el paciente existe
        const pacienteExiste = await this.pacientesRepository.findOne({
            where: { usuarioId: pacienteId },
        });

        if (!pacienteExiste) {
            throw new NotFoundException(
                `Paciente con ID ${pacienteId} no encontrado`,
            );
        }

        // Buscar historia clínica completa
        const historia =
            await this.historiaClinicaRepository.findCompletaByPacienteId(
                pacienteId,
            );

        if (!historia) {
            return {
                existe: false,
                message:
                    'El paciente no tiene historia clínica. Se creará automáticamente en la primera atención médica.',
            };
        }

        return this.mapToHistoriaClinicaCompleta(historia);
    }

    /**
     * Verifica si un paciente tiene historia clínica
     * @param pacienteId - ID del paciente
     */
    async tieneHistoriaClinica(pacienteId: number): Promise<boolean> {
        return this.historiaClinicaRepository.existsByPacienteId(pacienteId);
    }

    /**
     * Mapea la entidad de historia clínica a DTO completo
     */
    private mapToHistoriaClinicaCompleta(
        historia: HistoriaClinicaEntity,
    ): HistoriaClinicaCompletaDto {
        const paciente = historia.paciente;
        const person = paciente.person;

        // Mapear información del paciente
        const pacienteDto: PacienteHistoriaDto = {
            id: paciente.usuarioId,
            cedula: person.cedula,
            nombreCompleto: this.buildNombreCompleto(
                person.primerNombre,
                person.segundoNombre,
                person.primerApellido,
                person.segundoApellido,
            ),
            email: person.email,
            fechaNacimiento: this.formatDate(paciente.fechaNacimiento),
            edad: this.calcularEdad(paciente.fechaNacimiento),
            genero: person.genero?.nombre ?? 'No especificado',
            pais: paciente.pais?.nombre ?? 'No especificado',
            lugarResidencia: paciente.lugarResidencia ?? undefined,
            numeroCelular: paciente.numeroCelular ?? undefined,
            grupoSanguineo:
                paciente.grupoSanguineo?.nombre ?? 'No especificado',
            estiloVida: paciente.estiloVida?.nombre ?? 'No especificado',
        };

        // Mapear enfermedades del paciente
        const enfermedades: EnfermedadPacienteHistoriaDto[] =
            paciente.pacienteEnfermedades?.map((pe) => ({
                id: pe.enfermedadId,
                nombre: pe.enfermedad?.nombre ?? 'Sin nombre',
                descripcion: pe.enfermedad?.descripcion,
                tipoEnfermedad: pe.tipoEnfermedad?.nombre ?? 'Sin tipo',
                detalle: pe.detalle,
            })) ?? [];

        // Mapear registros de atención
        const registrosAtencion: RegistroAtencionHistoriaDto[] =
            historia.registrosAtencion?.map((registro) =>
                this.mapRegistroAtencion(registro),
            ) ?? [];

        // Mapear documentos
        const documentos: DocumentoHistoriaDto[] =
            historia.documentos?.map((doc) => ({
                id: doc.id,
                titulo: doc.titulo,
                url: doc.url,
                mimeType: doc.mimeType,
                tipoDocumento: doc.tipo?.nombre ?? 'Sin tipo',
                fechaHoraSubida: this.toISOStringSafe(doc.fechaHoraSubida),
            })) ?? [];

        return {
            id: historia.pacienteId,
            fechaHoraApertura: this.toISOStringSafe(historia.fechaHoraApertura),
            paciente: pacienteDto,
            enfermedades,
            registrosAtencion,
            documentos,
            totalAtenciones: registrosAtencion.length,
        };
    }

    /**
     * Mapea un registro de atención a DTO
     */
    private mapRegistroAtencion(
        registro: HistoriaClinicaEntity['registrosAtencion'][0],
    ): RegistroAtencionHistoriaDto {
        const cita = registro.cita;
        const medico = cita?.medico;
        const medicoPersona = medico?.persona;

        // Información del médico
        const medicoDto: MedicoAtencionHistoriaDto = {
            id: medico?.usuarioId ?? 0,
            nombreCompleto: medicoPersona
                ? `Dr. ${medicoPersona.primerNombre} ${medicoPersona.primerApellido}`
                : 'Médico no disponible',
            especialidad:
                medico?.especialidades?.[0]?.nombre ?? 'Sin especialidad',
        };

        // Mapear receta si existe
        let recetaDto: RecetaHistoriaDto | undefined;
        if (registro.recetaMedica) {
            const receta = registro.recetaMedica;
            const medicamentos: MedicamentoRecetaHistoriaDto[] =
                receta.medicamentos?.map((rm) => ({
                    id: rm.medicamento?.id ?? 0,
                    nombre: rm.medicamento?.nombre ?? 'Sin nombre',
                    principioActivo:
                        rm.medicamento?.principioActivo ??
                        'Sin principio activo',
                    concentracion: rm.medicamento?.concentracion,
                    duracion: rm.duracion,
                    frecuencia: rm.frecuencia,
                    cantidad: rm.cantidad,
                    viaAdministracion:
                        rm.viaAdministracion?.nombre ?? 'Sin vía',
                    unidadMedida: rm.unidadMedida?.nombre ?? 'Sin unidad',
                    indicaciones: rm.indicaciones,
                })) ?? [];

            recetaDto = {
                id: receta.registroAtencionId,
                fechaHoraCreacion: this.toISOStringSafe(
                    receta.fechaHoraCreacion,
                ),
                observaciones: receta.observaciones,
                medicamentos,
            };
        }

        return {
            id: registro.citaId,
            fechaHoraAtencion: this.toISOStringSafe(cita?.fechaHoraInicio),
            fechaHoraCreacion: this.toISOStringSafe(registro.fechaHoraCreacion),
            motivoCita: registro.motivoCita,
            diagnostico: registro.diagnostico,
            observaciones: registro.observaciones,
            medico: medicoDto,
            receta: recetaDto,
        };
    }

    /**
     * Construye el nombre completo del paciente
     */
    private buildNombreCompleto(
        primerNombre: string,
        segundoNombre: string | null,
        primerApellido: string,
        segundoApellido: string | null,
    ): string {
        const partes = [
            primerNombre,
            segundoNombre,
            primerApellido,
            segundoApellido,
        ].filter(Boolean);
        return partes.join(' ');
    }

    /**
     * Convierte una fecha a ISO string de forma segura
     * Maneja tanto objetos Date como strings
     */
    private toISOStringSafe(date: Date | string | undefined | null): string {
        if (!date) return '';
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toISOString();
    }

    /**
     * Formatea una fecha a string ISO solo fecha
     * Maneja tanto objetos Date como strings
     */
    private formatDate(date: Date | string): string {
        const dateObj = date instanceof Date ? date : new Date(date);
        return dateObj.toISOString().split('T')[0];
    }

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     * Maneja tanto objetos Date como strings
     */
    private calcularEdad(fechaNacimiento: Date | string): number {
        const fechaNac =
            fechaNacimiento instanceof Date
                ? fechaNacimiento
                : new Date(fechaNacimiento);
        const hoy = new Date();
        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }

        return edad;
    }
}
