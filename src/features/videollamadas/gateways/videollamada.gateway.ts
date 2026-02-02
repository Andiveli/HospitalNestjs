import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Logger, UsePipes, UseFilters } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsExceptionFilter } from '../../../common/filters';
import { WsValidationPipe } from '../../../common/pipes';
import { VideollamadaService } from '../services/videollamada.service';
import { JoinRoomDto } from '../dto/join-room.dto';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { WebRtcSignalDto } from '../dto/webrtc-signal.dto';
import {
    ToggleMicDto,
    ToggleCameraDto,
    RecordingControlDto,
    RecordingChunkDto,
} from '../dto/media-controls.dto';
import type { ParticipanteSesionEntity } from '../entities/participante-sesion.entity';

/**
 * Gateway para manejar videollamadas en tiempo real
 *
 * Namespace: /videollamadas
 * CORS: Habilitado para desarrollo
 *
 * Validación: Todos los mensajes entrantes son validados automáticamente
 * usando class-validator a través del WsValidationPipe.
 *
 * Manejo de errores: Los errores se capturan con WsExceptionFilter y se
 * envían al cliente en el evento 'exception'.
 *
 * Eventos principales:
 * - room:join - Unirse a una sala de videollamada
 * - room:leave - Salir de la sala
 * - webrtc:offer - Enviar oferta WebRTC
 * - webrtc:answer - Enviar respuesta WebRTC
 * - webrtc:ice-candidate - Enviar candidato ICE
 * - chat:message - Enviar mensaje de chat
 * - media:mic-toggle - Cambiar estado del micrófono
 * - media:camera-toggle - Cambiar estado de la cámara
 * - recording:control - Controlar grabación (start/stop/pause/resume)
 * - recording:chunk - Enviar chunk de grabación
 *
 * Eventos emitidos:
 * - room:joined - Confirmación de unión a sala con lista de participantes
 * - room:user-connected - Nuevo usuario conectado
 * - room:user-disconnected - Usuario desconectado
 * - webrtc:offer - Oferta WebRTC reenviada
 * - webrtc:answer - Respuesta WebRTC reenviada
 * - webrtc:ice-candidate - Candidato ICE reenviado
 * - chat:message - Mensaje de chat reenviado
 * - chat:error - Error al enviar mensaje
 * - media:state-update - Actualización de estado de media (mic/cámara)
 * - recording:state - Estado actual de la grabación
 * - recording:chunk-ack - Confirmación de chunk recibido
 * - participants:list - Lista actualizada de participantes
 * - exception - Error formateado (validación, excepciones, etc.)
 */
@UseFilters(new WsExceptionFilter())
@UsePipes(new WsValidationPipe())
@WebSocketGateway({
    namespace: '/videollamadas',
    cors: {
        origin: '*',
        credentials: true,
    },
})
export class VideoLlamadaGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(VideoLlamadaGateway.name);

    // Mapa para trackear socketId → participanteId (CRÍTICO para el fix)
    private socketToParticipant = new Map<string, number>();

    // Mapa para trackear socketId → citaId (para manejar desconexiones)
    private socketToCita = new Map<string, number>();

    // Mapa para trackear estado de grabación por cita
    private recordingState = new Map<
        number,
        {
            status: 'idle' | 'recording' | 'paused' | 'stopped';
            startedBy: number | null;
            startedAt: Date | null;
            chunks: number;
        }
    >();

    constructor(private readonly videollamadaService: VideollamadaService) {}

    /**
     * Emite un evento a una sala de forma segura
     * @param roomName - Nombre de la sala
     * @param event - Nombre del evento
     * @param payload - Datos a enviar
     * @param client - Socket del cliente (para fallback si server no está disponible)
     */
    private emitToRoom(
        roomName: string,
        event: string,
        payload: unknown,
        client: Socket,
    ): void {
        if (this.server) {
            this.server.to(roomName).emit(event, payload);
        } else {
            // Fallback: usar el cliente para broadcast
            this.logger.warn(
                `Server no disponible, usando client.to() para ${event}`,
            );
            client.to(roomName).emit(event, payload);
        }
    }

    /**
     * Emite un evento a un socket específico de forma segura
     * @param socketId - ID del socket destino
     * @param event - Nombre del evento
     * @param payload - Datos a enviar
     * @param client - Socket del cliente (para fallback)
     */
    private emitToSocket(
        socketId: string,
        event: string,
        payload: unknown,
        client: Socket,
    ): void {
        if (this.server) {
            this.server.to(socketId).emit(event, payload);
        } else {
            // Fallback: usar el cliente para enviar
            this.logger.warn(
                `Server no disponible, usando client.to() para ${event}`,
            );
            client.to(socketId).emit(event, payload);
        }
    }

    /**
     * Se ejecuta cuando el gateway se inicializa
     */
    afterInit(server: Server): void {
        // Asignar el servidor manualmente como backup
        if (!this.server) {
            this.server = server;
        }
        this.logger.log('WebSocket Gateway inicializado');
        this.logger.debug(`Server instance available: ${!!this.server}`);
    }

    /**
     * Se ejecuta cuando un cliente se conecta
     */
    handleConnection(client: Socket): void {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }

    /**
     * Se ejecuta cuando un cliente se desconecta
     */
    async handleDisconnect(client: Socket): Promise<void> {
        this.logger.log(`Cliente desconectado: ${client.id}`);

        try {
            const citaId = this.socketToCita.get(client.id);
            if (citaId) {
                await this.handleLeaveRoomInternal(client, citaId);
            }

            // Limpiar mappings
            this.socketToParticipant.delete(client.id);
            this.socketToCita.delete(client.id);
        } catch (error) {
            this.logger.error(
                `Error al manejar desconexión: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Cliente se une a una sala de videollamada
     */
    @SubscribeMessage('room:join')
    async handleJoinRoom(
        @MessageBody() data: JoinRoomDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, token, guestToken, nombreInvitado } = data;
            // Soportar tanto usuarioId como odontollamaId del frontend
            const usuarioId = data.usuarioId ?? data.odontollamaId;

            this.logger.log(
                `Usuario ${usuarioId || 'invitado'} intentando unirse a sala cita_${citaId}`,
            );

            // 1. Validar acceso (usuario registrado o invitado)
            let participante: ParticipanteSesionEntity | null = null;
            let citaIdFinal = citaId;

            if (guestToken) {
                // Es un invitado con código de acceso (ej: "PR0TBJQB93YM")
                this.logger.log(
                    `Procesando ingreso de invitado con código: ${guestToken}`,
                );
                const resultado =
                    await this.videollamadaService.procesarIngresoInvitado(
                        guestToken,
                        nombreInvitado,
                    );
                participante = resultado.participante;
                citaIdFinal = resultado.citaId;
            } else if (token) {
                // Es un invitado con token UUID (participante existente)
                participante =
                    await this.videollamadaService.buscarParticipantePorToken(
                        token,
                    );
            } else if (usuarioId) {
                // Buscar participante por usuarioId y citaId
                participante =
                    await this.videollamadaService.buscarParticipantePorUsuario(
                        citaId,
                        usuarioId,
                    );
            }

            if (!participante) {
                // Si no existe, crearlo (solo para usuarios registrados)
                if (usuarioId) {
                    const rol = await this.videollamadaService.determinarRol(
                        citaId,
                        usuarioId,
                    );
                    participante =
                        await this.videollamadaService.agregarParticipante(
                            citaId,
                            usuarioId,
                            null,
                            rol,
                            this.generarToken(),
                        );
                } else {
                    throw new Error(
                        'Token de invitación o código de acceso requerido',
                    );
                }
            }

            // 2. Guardar mappings (CRÍTICO para el fix)
            this.socketToParticipant.set(client.id, participante.id);
            this.socketToCita.set(client.id, citaIdFinal);

            // 3. Unirse a la sala
            const roomName = `cita_${citaIdFinal}`;
            await client.join(roomName);

            // 4. Notificar a otros participantes
            const userInfo = {
                socketId: client.id,
                participanteId: participante.id,
                usuarioId: participante.usuario?.id || null,
                nombre: this.obtenerNombreParticipante(
                    participante,
                    nombreInvitado,
                ),
                rol: participante.rol?.nombre || 'participante',
                micEnabled: participante.micActivo ?? true,
                cameraEnabled: participante.camaraActiva ?? true,
                isScreenSharing: participante.compartiendoPantalla ?? false,
                joinedAt: new Date().toISOString(),
            };

            client.to(roomName).emit('room:user-connected', userInfo);

            // 5. Obtener lista de participantes activos
            const participantesActivos =
                await this.videollamadaService.obtenerParticipantesActivos(
                    citaIdFinal,
                );

            // Mapear a formato de respuesta con sus socketIds
            const participantsList = await this.mapearParticipantesConSocket(
                participantesActivos,
                citaIdFinal,
            );

            // 6. Enviar confirmación al cliente con lista de participantes
            client.emit('room:joined', {
                success: true,
                room: roomName,
                userInfo,
                participants: participantsList,
            });

            this.logger.log(
                `Usuario ${userInfo.nombre} (ID: ${participante.id}) unido a sala ${roomName}`,
            );
        } catch (error) {
            this.logger.error(
                `Error al unir a sala: ${(error as Error).message}`,
            );
            client.emit('room:joined', {
                success: false,
                error: (error as Error).message,
            });
        }
    }

    /**
     * Cliente sale de una sala de videollamada
     */
    @SubscribeMessage('room:leave')
    async handleLeaveRoom(
        @MessageBody() data: { citaId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        await this.handleLeaveRoomInternal(client, data.citaId);

        // Limpiar mappings
        this.socketToParticipant.delete(client.id);
        this.socketToCita.delete(client.id);
    }

    /**
     * Manejo interno de salida de sala
     */
    private async handleLeaveRoomInternal(
        client: Socket,
        citaId: number,
    ): Promise<void> {
        try {
            const roomName = `cita_${citaId}`;

            // Registrar salida del participante en BD
            const participanteId = this.socketToParticipant.get(client.id);
            if (participanteId) {
                await this.videollamadaService.registrarSalidaParticipante(
                    participanteId,
                );
            }

            // Salir de la sala
            await client.leave(roomName);

            // Notificar a otros participantes
            client.to(roomName).emit('room:user-disconnected', {
                socketId: client.id,
                participanteId,
            });

            this.logger.log(`Usuario ${client.id} salió de sala ${roomName}`);
        } catch (error) {
            this.logger.error(
                `Error al salir de sala: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Cambia el estado del micrófono
     */
    @SubscribeMessage('media:mic-toggle')
    async handleMicToggle(
        @MessageBody() data: ToggleMicDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, enabled } = data;
            const participanteId = this.socketToParticipant.get(client.id);

            if (!participanteId) {
                throw new Error('Participante no encontrado');
            }

            // Actualizar estado en BD
            await this.videollamadaService.actualizarEstadoMedia(
                participanteId,
                { micActivo: enabled },
            );

            // Broadcast a todos en la sala
            const roomName = `cita_${citaId}`;
            const participante =
                await this.videollamadaService.obtenerParticipante(
                    participanteId,
                );

            this.emitToRoom(
                roomName,
                'media:state-update',
                {
                    socketId: client.id,
                    participanteId,
                    micEnabled: enabled,
                    cameraEnabled: participante?.camaraActiva ?? true,
                    nombre: participante
                        ? this.obtenerNombreParticipante(participante)
                        : 'Participante',
                    rol: participante?.rol?.nombre || 'participante',
                },
                client,
            );

            this.logger.log(
                `Mic ${enabled ? 'activado' : 'desactivado'} para participante ${participanteId}`,
            );
        } catch (error) {
            this.logger.error(
                `Error al cambiar estado de mic: ${(error as Error).message}`,
            );
            client.emit('media:error', {
                error: (error as Error).message,
            });
        }
    }

    /**
     * Cambia el estado de la cámara
     */
    @SubscribeMessage('media:camera-toggle')
    async handleCameraToggle(
        @MessageBody() data: ToggleCameraDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, enabled } = data;
            const participanteId = this.socketToParticipant.get(client.id);

            if (!participanteId) {
                throw new Error('Participante no encontrado');
            }

            // Actualizar estado en BD
            await this.videollamadaService.actualizarEstadoMedia(
                participanteId,
                { camaraActiva: enabled },
            );

            // Broadcast a todos en la sala
            const roomName = `cita_${citaId}`;
            const participante =
                await this.videollamadaService.obtenerParticipante(
                    participanteId,
                );

            this.emitToRoom(
                roomName,
                'media:state-update',
                {
                    socketId: client.id,
                    participanteId,
                    micEnabled: participante?.micActivo ?? true,
                    cameraEnabled: enabled,
                    nombre: participante
                        ? this.obtenerNombreParticipante(participante)
                        : 'Participante',
                    rol: participante?.rol?.nombre || 'participante',
                },
                client,
            );

            this.logger.log(
                `Cámara ${enabled ? 'activada' : 'desactivada'} para participante ${participanteId}`,
            );
        } catch (error) {
            this.logger.error(
                `Error al cambiar estado de cámara: ${(error as Error).message}`,
            );
            client.emit('media:error', {
                error: (error as Error).message,
            });
        }
    }

    /**
     * Controla la grabación (start/stop/pause/resume)
     */
    @SubscribeMessage('recording:control')
    async handleRecordingControl(
        @MessageBody() data: RecordingControlDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, action } = data;
            const participanteId = this.socketToParticipant.get(client.id);

            if (!participanteId) {
                throw new Error('Participante no encontrado');
            }

            const roomName = `cita_${citaId}`;
            let state = this.recordingState.get(citaId);

            switch (action) {
                case 'start':
                    // Solo permitir iniciar si no hay grabación activa
                    if (state?.status === 'recording') {
                        throw new Error('Ya hay una grabación en curso');
                    }

                    state = {
                        status: 'recording',
                        startedBy: participanteId,
                        startedAt: new Date(),
                        chunks: 0,
                    };
                    this.recordingState.set(citaId, state);

                    // Notificar a todos que la grabación inició
                    this.emitToRoom(
                        roomName,
                        'recording:state',
                        {
                            status: 'recording',
                            startedBy: participanteId,
                            startedAt: new Date().toISOString(),
                        },
                        client,
                    );

                    this.logger.log(
                        `Grabación iniciada por participante ${participanteId} en cita ${citaId}`,
                    );
                    break;

                case 'stop':
                    if (
                        state?.status !== 'recording' &&
                        state?.status !== 'paused'
                    ) {
                        throw new Error('No hay grabación activa para detener');
                    }

                    // Calcular duración
                    const duration = state.startedAt
                        ? Math.floor(
                              (Date.now() - state.startedAt.getTime()) / 1000,
                          )
                        : 0;

                    state.status = 'stopped';
                    this.recordingState.set(citaId, state);

                    // Notificar a todos que la grabación terminó
                    this.emitToRoom(
                        roomName,
                        'recording:state',
                        {
                            status: 'stopped',
                            startedBy: state.startedBy,
                            duration,
                        },
                        client,
                    );

                    this.logger.log(
                        `Grabación detenida en cita ${citaId}. Duración: ${duration}s`,
                    );
                    break;

                case 'pause':
                    if (state?.status !== 'recording') {
                        throw new Error('No hay grabación activa para pausar');
                    }

                    state.status = 'paused';
                    this.recordingState.set(citaId, state);

                    this.emitToRoom(
                        roomName,
                        'recording:state',
                        {
                            status: 'paused',
                            startedBy: state.startedBy,
                        },
                        client,
                    );

                    this.logger.log(`Grabación pausada en cita ${citaId}`);
                    break;

                case 'resume':
                    if (state?.status !== 'paused') {
                        throw new Error(
                            'No hay grabación pausada para continuar',
                        );
                    }

                    state.status = 'recording';
                    this.recordingState.set(citaId, state);

                    this.emitToRoom(
                        roomName,
                        'recording:state',
                        {
                            status: 'recording',
                            startedBy: state.startedBy,
                        },
                        client,
                    );

                    this.logger.log(`Grabación reanudada en cita ${citaId}`);
                    break;
            }
        } catch (error) {
            this.logger.error(
                `Error al controlar grabación: ${(error as Error).message}`,
            );
            client.emit('recording:state', {
                status: 'error',
                error: (error as Error).message,
            });
        }
    }

    /**
     * Recibe chunks de grabación desde el frontend
     */
    @SubscribeMessage('recording:chunk')
    async handleRecordingChunk(
        @MessageBody() data: RecordingChunkDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, chunkIndex, isLast } = data;
            const state = this.recordingState.get(citaId);

            if (!state || state.status !== 'recording') {
                throw new Error('No hay grabación activa');
            }

            state.chunks++;
            this.recordingState.set(citaId, state);

            // Aquí podrías:
            // 1. Guardar el chunk en disco temporalmente
            // 2. Enviar a S3 directamente
            // 3. Acumular y enviar al final

            // Por ahora, solo confirmamos recepción
            client.emit('recording:chunk-ack', {
                chunkIndex,
                received: true,
            });

            if (isLast) {
                this.logger.log(
                    `Último chunk recibido para cita ${citaId}. Total chunks: ${state.chunks}`,
                );
            }
        } catch (error) {
            this.logger.error(
                `Error al recibir chunk: ${(error as Error).message}`,
            );
            client.emit('recording:chunk-ack', {
                chunkIndex: data.chunkIndex,
                received: false,
                error: (error as Error).message,
            });
        }
    }

    /**
     * Maneja señales WebRTC de tipo Offer
     */
    @SubscribeMessage('webrtc:offer')
    handleOffer(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): void {
        try {
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.emitToSocket(data.to, 'webrtc:offer', payload, client);
            this.logger.log(`Offer enviado de ${client.id} a ${data.to}`);
        } catch (error) {
            this.logger.error(
                `Error al procesar offer: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja señales WebRTC de tipo Answer
     */
    @SubscribeMessage('webrtc:answer')
    handleAnswer(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): void {
        try {
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.emitToSocket(data.to, 'webrtc:answer', payload, client);
            this.logger.log(`Answer enviado de ${client.id} a ${data.to}`);
        } catch (error) {
            this.logger.error(
                `Error al procesar answer: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja candidatos ICE para WebRTC
     */
    @SubscribeMessage('webrtc:ice-candidate')
    handleIceCandidate(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): void {
        try {
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.emitToSocket(data.to, 'webrtc:ice-candidate', payload, client);
            this.logger.log(
                `ICE candidate enviado de ${client.id} a ${data.to}`,
            );
        } catch (error) {
            this.logger.error(
                `Error al procesar ICE candidate: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja mensajes de chat - FIX: ahora usa el participanteId correcto
     */
    @SubscribeMessage('chat:message')
    async handleChatMessage(
        @MessageBody() data: ChatMessageDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, contenidoTexto, contenidoUrl, tipoMensaje } = data;

            // FIX: Obtener el participanteId del mapping en lugar de hardcodear 0
            const participanteId = this.socketToParticipant.get(client.id);

            if (!participanteId) {
                throw new Error(
                    'Participante no encontrado. Debes unirte a la sala primero.',
                );
            }

            // 1. Guardar mensaje en base de datos con el participanteId correcto
            const mensajeGuardado =
                await this.videollamadaService.guardarMensaje(
                    citaId,
                    participanteId, // ← FIX: Ahora usa el ID correcto
                    contenidoTexto || null,
                    contenidoUrl || null,
                    tipoMensaje,
                );

            // 2. Obtener info del participante
            const participante =
                await this.videollamadaService.obtenerParticipante(
                    participanteId,
                );

            // 3. Emitir mensaje a todos en la sala
            const roomName = `cita_${citaId}`;
            const messagePayload = {
                id: mensajeGuardado.id,
                citaId,
                contenidoTexto,
                contenidoUrl,
                tipoMensaje,
                fechaHoraEnvio: mensajeGuardado.fechaHoraEnvio,
                from: client.id,
                participante: {
                    id: participanteId,
                    nombre: participante
                        ? this.obtenerNombreParticipante(participante)
                        : 'Participante',
                    rol: participante?.rol?.nombre || 'desconocido',
                },
            };

            this.emitToRoom(roomName, 'chat:message', messagePayload, client);

            this.logger.log(
                `Mensaje ${mensajeGuardado.id} enviado en sala ${roomName} por participante ${participanteId}`,
            );
        } catch (error) {
            this.logger.error(
                `Error al procesar mensaje: ${(error as Error).message}`,
            );
            client.emit('chat:error', {
                error: (error as Error).message,
            });
        }
    }

    /**
     * Método helper para mapear participantes BD a formato con socketId
     */
    private async mapearParticipantesConSocket(
        participantes: ParticipanteSesionEntity[],
        _citaId: number,
    ): Promise<
        Array<{
            socketId: string;
            participanteId: number;
            nombre: string;
            rol: string;
            micEnabled: boolean;
            cameraEnabled: boolean;
            isScreenSharing: boolean;
            joinedAt: string;
        }>
    > {
        const socketMap = new Map(
            Array.from(this.socketToParticipant.entries()).map(
                ([socketId, partId]) => [partId, socketId],
            ),
        );

        return participantes.map((p) => ({
            socketId: socketMap.get(p.id) || 'offline',
            participanteId: p.id,
            nombre: this.obtenerNombreParticipante(p),
            rol: p.rol?.nombre || 'participante',
            micEnabled: p.micActivo ?? true,
            cameraEnabled: p.camaraActiva ?? true,
            isScreenSharing: p.compartiendoPantalla ?? false,
            joinedAt:
                p.fechaHoraUnion?.toISOString() || new Date().toISOString(),
        }));
    }

    /**
     * Genera un token seguro para participantes usando crypto.randomUUID()
     * UUID v4 proporciona 122 bits de entropía, mucho más seguro que Math.random()
     */
    private generarToken(): string {
        return crypto.randomUUID();
    }

    /**
     * Obtiene el nombre para mostrar de un participante
     * Prioridad: nombre del usuario registrado > nombre de invitado > fallback genérico
     * @param participante - Entidad del participante
     * @param nombreInvitadoParam - Nombre proporcionado al unirse (opcional)
     * @returns Nombre para mostrar
     */
    private obtenerNombreParticipante(
        participante: ParticipanteSesionEntity,
        nombreInvitadoParam?: string,
    ): string {
        // 1. Si tiene usuario registrado, usar su nombre completo
        if (participante.usuario) {
            const { primerNombre, primerApellido } = participante.usuario;
            if (primerNombre && primerApellido) {
                return `${primerNombre} ${primerApellido}`;
            }
            if (primerNombre) {
                return primerNombre;
            }
        }

        // 2. Si tiene nombre guardado en el participante (invitado)
        if (participante.nombre) {
            return participante.nombre;
        }

        // 3. Si se proporcionó nombre al unirse
        if (nombreInvitadoParam) {
            return nombreInvitadoParam;
        }

        // 4. Fallback genérico
        return 'Participante';
    }

    // =========================================================================
    // MÉTODOS PÚBLICOS PARA USO EXTERNO (Job de expiración)
    // =========================================================================

    /**
     * Emite un aviso de tiempo restante a una sala
     * Usado por el job de expiración para notificar a los participantes
     *
     * @param citaId - ID de la cita/sala
     * @param minutosRestantes - Minutos restantes antes de que termine la sesión
     * @param fechaHoraFin - Fecha/hora de fin programada
     */
    emitirAvisoTiempo(
        citaId: number,
        minutosRestantes: number,
        fechaHoraFin: Date,
    ): void {
        const roomName = `cita_${citaId}`;

        if (this.server) {
            this.server.to(roomName).emit('room:time-warning', {
                citaId,
                minutosRestantes,
                fechaHoraFin: fechaHoraFin.toISOString(),
                mensaje: `La sesión finalizará en ${minutosRestantes} minuto${minutosRestantes > 1 ? 's' : ''}`,
            });

            this.logger.log(
                `Aviso de ${minutosRestantes} min enviado a sala ${roomName}`,
            );
        } else {
            this.logger.warn(
                `No se pudo enviar aviso de tiempo: server no disponible`,
            );
        }
    }

    /**
     * Emite notificación de que la sesión ha finalizado
     * Usado por el job de expiración para cerrar la sala automáticamente
     *
     * @param citaId - ID de la cita/sala
     * @param razon - Razón de la finalización
     */
    emitirSesionFinalizada(citaId: number, razon: string): void {
        const roomName = `cita_${citaId}`;

        if (this.server) {
            this.server.to(roomName).emit('room:session-ended', {
                citaId,
                razon,
                finalizadaEn: new Date().toISOString(),
                finalizadaPor: 'sistema',
            });

            this.logger.log(`Sesión finalizada emitida a sala ${roomName}`);

            // Desconectar a todos los sockets de la sala
            this.server
                .in(roomName)
                .fetchSockets()
                .then((sockets) => {
                    for (const socket of sockets) {
                        socket.leave(roomName);
                        // Limpiar mappings
                        this.socketToParticipant.delete(socket.id);
                        this.socketToCita.delete(socket.id);
                    }
                    this.logger.log(
                        `${sockets.length} sockets desconectados de sala ${roomName}`,
                    );
                })
                .catch((error) => {
                    this.logger.error(
                        `Error al desconectar sockets: ${error.message}`,
                    );
                });

            // Limpiar estado de grabación
            this.recordingState.delete(citaId);
        } else {
            this.logger.warn(
                `No se pudo emitir finalización: server no disponible`,
            );
        }
    }
}
