import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitaEntity } from '../../citas/entities/cita.entity';
import { InvitacionVideollamadaRepository } from '../repositories';
import { InvitacionVideollamadaEntity } from '../entities';

/**
 * DTO de respuesta al generar link de invitado
 */
export interface GenerarLinkResponse {
    linkInvitacion: string;
    codigoAcceso: string;
    expiraEn: string;
}

/**
 * DTO de respuesta al validar código de acceso
 */
export interface ValidarCodigoResponse {
    valido: boolean;
    citaId: number;
    nombreSesion: string;
    nombreMedico: string;
    nombrePaciente: string;
    fechaHoraInicio: Date;
    nombreInvitado: string;
    rolInvitado: string;
}

@Injectable()
export class InvitacionesService {
    private readonly logger = new Logger(InvitacionesService.name);

    constructor(
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
        private readonly invitacionRepository: InvitacionVideollamadaRepository,
    ) {}

    /**
     * Genera un link de invitación para un acompañante/invitado a la videollamada
     * @param citaId - ID de la cita
     * @param usuarioId - ID del usuario que genera el link (médico o paciente)
     * @param nombreInvitado - Nombre del invitado
     * @param rolInvitado - Rol del invitado (por defecto "invitado")
     * @returns Link de invitación y código de acceso
     */
    async generarLinkInvitado(
        citaId: number,
        usuarioId: number,
        nombreInvitado: string,
        rolInvitado: string = 'invitado',
    ): Promise<GenerarLinkResponse> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: [
                'medico',
                'medico.persona',
                'paciente',
                'paciente.person',
            ],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Verificar que el usuario que invita es médico o paciente de la cita
        const esMedico = cita.medico.usuarioId === usuarioId;
        const esPaciente = cita.paciente.usuarioId === usuarioId;

        if (!esMedico && !esPaciente) {
            throw new ForbiddenException(
                'Solo el médico o paciente de la cita pueden generar invitaciones',
            );
        }

        // 3. Calcular fecha de expiración (24 horas)
        const fechaHoraExpiracion = new Date();
        fechaHoraExpiracion.setHours(fechaHoraExpiracion.getHours() + 24);

        // 4. Crear invitación en la base de datos
        const invitacion = await this.invitacionRepository.crearInvitacion(
            citaId,
            usuarioId,
            nombreInvitado,
            rolInvitado,
            fechaHoraExpiracion,
        );

        // 5. Construir el link de invitación
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const linkInvitacion = `${frontendUrl}/videollamada/invitado/${invitacion.codigoAcceso}`;

        this.logger.log(
            `Link de invitación generado para cita ${citaId} por usuario ${usuarioId} con código ${invitacion.codigoAcceso}`,
        );

        return {
            linkInvitacion,
            codigoAcceso: invitacion.codigoAcceso,
            expiraEn: '24 horas',
        };
    }

    /**
     * Valida un código de acceso y retorna la información de la sesión
     * @param codigoAcceso - Código de acceso del invitado
     * @returns Información de la sesión si el código es válido
     */
    async validarCodigoInvitado(
        codigoAcceso: string,
    ): Promise<ValidarCodigoResponse> {
        try {
            // 1. Buscar la invitación por código
            const invitacion =
                await this.invitacionRepository.buscarPorCodigoAcceso(
                    codigoAcceso,
                );

            if (!invitacion) {
                throw new NotFoundException('Código de acceso inválido');
            }

            // 2. Verificar que la invitación esté activa y no haya sido usada
            if (!invitacion.activo) {
                throw new ForbiddenException(
                    'El código de acceso ha sido desactivado',
                );
            }

            if (invitacion.usado) {
                throw new ForbiddenException(
                    'Este código de acceso ya fue utilizado',
                );
            }

            // 3. Verificar que no haya expirado
            const ahora = new Date();
            if (invitacion.fechaHoraExpiracion < ahora) {
                throw new ForbiddenException('El código de acceso ha expirado');
            }

            // 4. Verificar que la cita todavía existe y no esté cancelada
            if (!invitacion.cita) {
                throw new NotFoundException(
                    'La cita asociada a esta invitación ya no existe',
                );
            }

            if (invitacion.cita.estado.nombre === 'cancelada') {
                throw new ForbiddenException('Esta cita ha sido cancelada');
            }

            // 5. Marcar como usada la primera vez que se accede
            await this.invitacionRepository.marcarComoUsada(invitacion.id);

            // 6. Construir respuesta con información de la sesión
            const nombreMedico = `${invitacion.cita.medico.persona.primerNombre} ${invitacion.cita.medico.persona.primerApellido}`;
            const nombrePaciente = `${invitacion.cita.paciente.person.primerNombre} ${invitacion.cita.paciente.person.primerApellido}`;
            const nombreSesion = `Consulta - ${nombreMedico} / ${nombrePaciente}`;

            this.logger.log(
                `Código de acceso ${codigoAcceso} validado exitosamente para cita ${invitacion.citaId}`,
            );

            return {
                valido: true,
                citaId: invitacion.citaId,
                nombreSesion,
                nombreMedico,
                nombrePaciente,
                fechaHoraInicio: invitacion.cita.fechaHoraInicio,
                nombreInvitado: invitacion.nombreInvitado,
                rolInvitado: invitacion.rolInvitado,
            };
        } catch (error) {
            this.logger.warn(
                `Error al validar código de acceso ${codigoAcceso}: ${(error as Error).message}`,
            );
            throw error;
        }
    }

    /**
     * Verifica si un usuario tiene permisos para generar invitaciones para una cita
     * @param citaId - ID de la cita
     * @param usuarioId - ID del usuario
     * @returns true si tiene permisos, false si no
     */
    async puedeGenerarInvitacion(
        citaId: number,
        usuarioId: number,
    ): Promise<boolean> {
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: ['medico', 'paciente'],
        });

        if (!cita) {
            return false;
        }

        const esMedico = cita.medico.usuarioId === usuarioId;
        const esPaciente = cita.paciente.usuarioId === usuarioId;

        return esMedico || esPaciente;
    }

    /**
     * Obtiene las invitaciones generadas para una cita
     * @param citaId - ID de la cita
     * @returns Lista de invitaciones de la cita
     */
    async obtenerInvitacionesPorCita(
        citaId: number,
    ): Promise<InvitacionVideollamadaEntity[]> {
        return await this.invitacionRepository.buscarPorCita(citaId);
    }

    /**
     * Limpia las invitaciones expiradas
     * Este método debería ser llamado periódicamente (ej: cada hora)
     */
    async limpiarInvitacionesExpiradas(): Promise<void> {
        await this.invitacionRepository.limpiarExpiradas();
        this.logger.log('Invitaciones expiradas limpiadas exitosamente');
    }
}
