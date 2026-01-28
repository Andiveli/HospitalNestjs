import {
    Injectable,
    NotFoundException,
    UnauthorizedException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitaEntity } from '../../citas/entities/cita.entity';
import { randomBytes } from 'crypto';

/**
 * Payload del token JWT para invitados
 */
export interface InvitadoTokenPayload {
    citaId: number;
    invitadoPor: number; // usuarioId del médico/paciente que invita
    nombreInvitado: string;
    rolInvitado: string; // "invitado" o "acompanante"
    tokenAcceso: string; // Token único para este participante
    iat?: number; // Issued at (timestamp)
    exp?: number; // Expiration (timestamp)
}

/**
 * DTO de respuesta al generar link de invitado
 */
export interface GenerarLinkResponse {
    linkInvitacion: string;
    token: string;
    expiraEn: string;
}

/**
 * DTO de respuesta al validar token de invitado
 */
export interface ValidarTokenResponse {
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
        private readonly jwtService: JwtService,
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
    ) {}

    /**
     * Genera un link de invitación para un acompañante/invitado a la videollamada
     * @param citaId - ID de la cita
     * @param usuarioId - ID del usuario que genera el link (médico o paciente)
     * @param nombreInvitado - Nombre del invitado
     * @param rolInvitado - Rol del invitado (por defecto "invitado")
     * @returns Link de invitación y token JWT
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

        // 3. Generar token de acceso único para este participante
        const tokenAcceso = this.generarTokenAcceso();

        // 4. Crear payload del JWT
        const payload: InvitadoTokenPayload = {
            citaId,
            invitadoPor: usuarioId,
            nombreInvitado,
            rolInvitado,
            tokenAcceso,
        };

        // 5. Firmar el token JWT con expiración de 24 horas
        const token = this.jwtService.sign(payload, {
            expiresIn: '24h',
        });

        // 6. Construir el link de invitación
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const linkInvitacion = `${frontendUrl}/videollamada/invitado/${token}`;

        this.logger.log(
            `Link de invitación generado para cita ${citaId} por usuario ${usuarioId}`,
        );

        return {
            linkInvitacion,
            token,
            expiraEn: '24 horas',
        };
    }

    /**
     * Valida un token de invitado y retorna la información de la sesión
     * @param token - Token JWT del invitado
     * @returns Información de la sesión si el token es válido
     */
    async validarTokenInvitado(token: string): Promise<ValidarTokenResponse> {
        try {
            // 1. Verificar y decodificar el token JWT
            const payload = this.jwtService.verify<InvitadoTokenPayload>(token);

            // 2. Verificar que la cita todavía existe
            const cita = await this.citaRepository.findOne({
                where: { id: payload.citaId },
                relations: [
                    'medico',
                    'medico.persona',
                    'paciente',
                    'paciente.person',
                    'estado',
                ],
            });

            if (!cita) {
                throw new NotFoundException(
                    'La cita asociada a esta invitación ya no existe',
                );
            }

            // 3. Verificar que la cita no esté cancelada
            if (cita.estado.nombre === 'cancelada') {
                throw new ForbiddenException('Esta cita ha sido cancelada');
            }

            // 4. Construir respuesta con información de la sesión
            const nombreMedico = `${cita.medico.persona.primerNombre} ${cita.medico.persona.primerApellido}`;
            const nombrePaciente = `${cita.paciente.person.primerNombre} ${cita.paciente.person.primerApellido}`;
            const nombreSesion = `Consulta - ${nombreMedico} / ${nombrePaciente}`;

            return {
                valido: true,
                citaId: payload.citaId,
                nombreSesion,
                nombreMedico,
                nombrePaciente,
                fechaHoraInicio: cita.fechaHoraInicio,
                nombreInvitado: payload.nombreInvitado,
                rolInvitado: payload.rolInvitado,
            };
        } catch (error) {
            // Token expirado, inválido o malformado
            this.logger.warn(
                `Token de invitado inválido: ${(error as Error).message}`,
            );
            throw new UnauthorizedException(
                'El link de invitación es inválido o ha expirado',
            );
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
     * Genera un token de acceso único para un participante
     * @returns Token aleatorio de 32 caracteres
     */
    private generarTokenAcceso(): string {
        return randomBytes(32).toString('hex');
    }
}
