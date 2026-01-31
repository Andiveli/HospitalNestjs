import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionConsultaRepository } from '../repositories/sesion-consulta.repository';
import { ParticipanteSesionRepository } from '../repositories/participante-sesion.repository';
import { MensajeChatRepository } from '../repositories/mensaje-chat.repository';
import { CitaEntity } from '../../citas/entities/cita.entity';
import { EstadoSesionEntity } from '../entities/estado-sesion.entity';
import { RolSesionEntity } from '../entities/rol-sesion.entity';
import { TipoMensajeEntity } from '../entities/tipo-mensaje.entity';
import { PeopleEntity } from '../../people/people.entity';
import { SesionConsultaEntity } from '../entities/sesion-consulta.entity';
import { ParticipanteSesionEntity } from '../entities/participante-sesion.entity';
import { MensajeChatEntity } from '../entities/mensaje-chat.entity';

@Injectable()
export class VideollamadaService {
    private readonly logger = new Logger(VideollamadaService.name);

    constructor(
        private readonly sesionRepository: SesionConsultaRepository,
        private readonly participanteRepository: ParticipanteSesionRepository,
        private readonly mensajeRepository: MensajeChatRepository,
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
        @InjectRepository(EstadoSesionEntity)
        private readonly estadoSesionRepository: Repository<EstadoSesionEntity>,
        @InjectRepository(RolSesionEntity)
        private readonly rolSesionRepository: Repository<RolSesionEntity>,
        @InjectRepository(TipoMensajeEntity)
        private readonly tipoMensajeRepository: Repository<TipoMensajeEntity>,
    ) {}

    /**
     * Valida que el usuario tenga permisos sobre la cita (sea paciente o médico)
     * @param cita - Entidad de la cita
     * @param usuarioId - ID del usuario a validar
     * @throws ForbiddenException si el usuario no tiene permisos
     */
    private validarPermisosCita(cita: CitaEntity, usuarioId: number): void {
        const esMedico = cita.medico.usuarioId === usuarioId;
        const esPaciente = cita.paciente.usuarioId === usuarioId;

        if (!esMedico && !esPaciente) {
            throw new ForbiddenException(
                'Solo el médico o paciente de la cita pueden realizar esta acción',
            );
        }
    }

    /**
     * Crea una nueva sesión de videollamada asociada a una cita
     * @param citaId - ID de la cita
     * @param usuarioId - ID del usuario que crea la sesión (paciente o médico)
     * @returns La sesión creada
     */
    async crearSesion(
        citaId: number,
        usuarioId: number,
    ): Promise<SesionConsultaEntity> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: [
                'paciente',
                'paciente.person',
                'medico',
                'medico.persona',
            ],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Validar que el usuario tenga permisos sobre la cita
        this.validarPermisosCita(cita, usuarioId);

        // 3. Verificar que no exista ya una sesión para esta cita
        const sesionExistente =
            await this.sesionRepository.existsByCitaId(citaId);

        if (sesionExistente) {
            throw new ConflictException(
                `Ya existe una sesión para la cita con ID ${citaId}`,
            );
        }

        // 3. Buscar el estado "activa"
        const estadoActiva = await this.estadoSesionRepository.findOne({
            where: { nombre: 'activa' },
        });

        if (!estadoActiva) {
            throw new Error(
                'Estado "activa" no encontrado en la tabla estados_sesion',
            );
        }

        // 4. Crear la sesión
        const nombreSesion = `Consulta - ${cita.medico.persona.primerNombre} ${cita.medico.persona.primerApellido} / ${cita.paciente.person.primerNombre} ${cita.paciente.person.primerApellido}`;

        const sesion = await this.sesionRepository.create({
            citaId,
            nombre: nombreSesion,
            fechaHoraInicio: new Date(),
            fechaHoraFin: cita.fechaHoraFin, // Fecha estimada de fin
            estado: estadoActiva,
            grabacionUrl: null,
        });

        this.logger.log(`Sesión creada para cita ID ${citaId}`);

        return sesion;
    }

    /**
     * Agrega un participante a una sesión existente
     * @param citaId - ID de la cita/sesión
     * @param usuarioId - ID del usuario (null para invitados)
     * @param nombreInvitado - Nombre del invitado (solo si usuarioId es null)
     * @param rolNombre - Nombre del rol (medico, paciente, invitado)
     * @param tokenAcceso - Token de acceso del participante
     * @returns El participante creado
     */
    async agregarParticipante(
        citaId: number,
        usuarioId: number | null,
        nombreInvitado: string | null,
        rolNombre: string,
        tokenAcceso: string,
    ): Promise<ParticipanteSesionEntity> {
        // 1. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        // 2. Buscar el rol
        const rol = await this.rolSesionRepository.findOne({
            where: { nombre: rolNombre },
        });

        if (!rol) {
            throw new NotFoundException(
                `Rol "${rolNombre}" no encontrado en la tabla roles_sesion`,
            );
        }

        // 3. Verificar si el usuario/invitado ya es participante
        const yaEsParticipante =
            await this.participanteRepository.existeParticipante(
                usuarioId,
                citaId,
            );

        if (yaEsParticipante) {
            throw new ConflictException(
                `El usuario ya es participante de esta sesión`,
            );
        }

        // 4. Crear el participante
        const participante = await this.participanteRepository.create({
            nombre: nombreInvitado,
            tokenAcceso,
            fechaHoraUnion: new Date(),
            fechaHoraSalida: null,
            rol,
            usuario: usuarioId ? ({ id: usuarioId } as PeopleEntity) : null,
            sesion,
        });

        this.logger.log(
            `Participante agregado a sesión ${citaId}: ${nombreInvitado || `Usuario ${usuarioId}`}`,
        );

        return participante;
    }

    /**
     * Registra la salida de un participante de la sesión
     * @param participanteId - ID del participante
     * @returns El participante actualizado
     */
    async registrarSalidaParticipante(
        participanteId: number,
    ): Promise<ParticipanteSesionEntity> {
        const participante =
            await this.participanteRepository.findById(participanteId);

        if (!participante) {
            throw new NotFoundException(
                `Participante con ID ${participanteId} no encontrado`,
            );
        }

        const participanteActualizado =
            await this.participanteRepository.registrarSalida(
                participanteId,
                new Date(),
            );

        this.logger.log(`Participante ${participanteId} salió de la sesión`);

        return participanteActualizado!;
    }

    /**
     * Guarda un mensaje en el chat de la sesión
     * @param citaId - ID de la cita/sesión
     * @param participanteId - ID del participante que envía el mensaje
     * @param contenidoTexto - Contenido del mensaje (puede ser null si es archivo)
     * @param contenidoUrl - URL del archivo (puede ser null si es texto)
     * @param tipoMensajeNombre - Tipo de mensaje (texto, archivo, imagen, etc.)
     * @returns El mensaje creado
     */
    async guardarMensaje(
        citaId: number,
        participanteId: number,
        contenidoTexto: string | null,
        contenidoUrl: string | null,
        tipoMensajeNombre: string,
    ): Promise<MensajeChatEntity> {
        // 1. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        // 2. Verificar que el participante existe
        const participante =
            await this.participanteRepository.findById(participanteId);

        if (!participante) {
            throw new NotFoundException(
                `Participante con ID ${participanteId} no encontrado`,
            );
        }

        // 3. Buscar el tipo de mensaje
        const tipoMensaje = await this.tipoMensajeRepository.findOne({
            where: { nombre: tipoMensajeNombre },
        });

        if (!tipoMensaje) {
            throw new NotFoundException(
                `Tipo de mensaje "${tipoMensajeNombre}" no encontrado`,
            );
        }

        // 4. Validar que hay contenido
        if (!contenidoTexto && !contenidoUrl) {
            throw new BadRequestException(
                'El mensaje debe contener texto o URL',
            );
        }

        // 5. Crear el mensaje
        const mensaje = await this.mensajeRepository.create({
            contenidoTexto,
            contenidoUrl,
            fechaHoraEnvio: new Date(),
            eliminado: false,
            tipoMensaje,
            sesion,
            participante,
        });

        this.logger.log(
            `Mensaje guardado en sesión ${citaId} por participante ${participanteId}`,
        );

        return mensaje;
    }

    /**
     * Obtiene todos los participantes activos de una sesión
     * @param citaId - ID de la cita/sesión
     * @returns Array de participantes activos
     */
    async obtenerParticipantesActivos(
        citaId: number,
    ): Promise<ParticipanteSesionEntity[]> {
        const participantes =
            await this.participanteRepository.findParticipantesActivos(citaId);

        return participantes;
    }

    /**
     * Obtiene el historial de mensajes de una sesión
     * @param citaId - ID de la cita/sesión
     * @param limit - Cantidad de mensajes a devolver
     * @returns Array de mensajes ordenados cronológicamente
     */
    async obtenerHistorialMensajes(
        citaId: number,
        limit: number = 50,
    ): Promise<MensajeChatEntity[]> {
        const mensajes = await this.mensajeRepository.findUltimosMensajes(
            citaId,
            limit,
        );

        // Invertir para que queden cronológicos (DESC → ASC)
        return mensajes.reverse();
    }

    /**
     * Finaliza una sesión de videollamada
     * @param citaId - ID de la cita/sesión
     * @param usuarioId - ID del usuario que finaliza la sesión (paciente o médico)
     * @returns La sesión finalizada
     */
    async finalizarSesion(
        citaId: number,
        usuarioId: number,
    ): Promise<SesionConsultaEntity> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: ['paciente', 'medico'],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Validar que el usuario tenga permisos sobre la cita
        this.validarPermisosCita(cita, usuarioId);

        // 3. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        // 4. Buscar el estado "finalizada"
        const estadoFinalizada = await this.estadoSesionRepository.findOne({
            where: { nombre: 'finalizada' },
        });

        if (!estadoFinalizada) {
            throw new Error(
                'Estado "finalizada" no encontrado en la tabla estados_sesion',
            );
        }

        const sesionFinalizada = await this.sesionRepository.update(citaId, {
            fechaHoraFin: new Date(),
            estado: estadoFinalizada,
        });

        this.logger.log(`Sesión ${citaId} finalizada`);

        return sesionFinalizada!;
    }

    /**
     * Obtiene la información completa de una sesión
     * @param citaId - ID de la cita/sesión
     * @param usuarioId - ID del usuario que solicita la sesión (paciente o médico)
     * @returns La sesión con todas sus relaciones
     */
    async obtenerSesion(
        citaId: number,
        usuarioId: number,
    ): Promise<SesionConsultaEntity> {
        // 1. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        // 2. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: ['paciente', 'medico'],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 3. Validar que el usuario tenga permisos sobre la cita
        this.validarPermisosCita(cita, usuarioId);

        return sesion;
    }

    /**
     * Busca un participante por su token de acceso
     * @param token - Token de acceso
     * @returns El participante encontrado
     */
    async buscarParticipantePorToken(
        token: string,
    ): Promise<ParticipanteSesionEntity> {
        const participante =
            await this.participanteRepository.findByToken(token);

        if (!participante) {
            throw new NotFoundException('Token de acceso inválido o expirado');
        }

        return participante;
    }

    /**
     * Guarda la URL de la grabación de una videollamada
     * @param citaId - ID de la cita
     * @param grabacionUrl - URL de la grabación en S3
     * @param usuarioId - ID del usuario que guarda la grabación (paciente o médico)
     * @returns Confirmación de guardado
     */
    async guardarGrabacion(
        citaId: number,
        grabacionUrl: string,
        usuarioId: number,
    ): Promise<void> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: ['paciente', 'medico'],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Validar que el usuario tenga permisos sobre la cita
        this.validarPermisosCita(cita, usuarioId);

        // 3. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        // 4. Actualizar la URL de grabación
        await this.sesionRepository.updateGrabacionUrl(citaId, grabacionUrl);

        this.logger.log(
            `Grabación guardada para cita ${citaId}: ${grabacionUrl}`,
        );
    }

    /**
     * Obtiene la URL de grabación de una videollamada
     * @param citaId - ID de la cita
     * @param usuarioId - ID del usuario que solicita la grabación (paciente o médico)
     * @returns URL de grabación o null si no existe
     */
    async obtenerGrabacion(
        citaId: number,
        usuarioId: number,
    ): Promise<string | null> {
        // 1. Verificar que la cita existe
        const cita = await this.citaRepository.findOne({
            where: { id: citaId },
            relations: ['paciente', 'medico'],
        });

        if (!cita) {
            throw new NotFoundException(`Cita con ID ${citaId} no encontrada`);
        }

        // 2. Validar que el usuario tenga permisos sobre la cita
        this.validarPermisosCita(cita, usuarioId);

        // 3. Verificar que la sesión existe
        const sesion = await this.sesionRepository.findByCitaId(citaId);

        if (!sesion) {
            throw new NotFoundException(
                `Sesión para cita ID ${citaId} no encontrada`,
            );
        }

        return sesion.grabacionUrl;
    }
}
