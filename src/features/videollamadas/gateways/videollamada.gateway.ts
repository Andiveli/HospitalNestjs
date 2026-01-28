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
import { Logger, Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { VideollamadaService } from '../services/videollamada.service';
import { JoinRoomDto } from '../dto/join-room.dto';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { WebRtcSignalDto } from '../dto/webrtc-signal.dto';

/**
 * Gateway para manejar videollamadas en tiempo real
 *
 * Namespace: /videollamadas
 * CORS: Habilitado para desarrollo
 *
 * Eventos principales:
 * - room:join - Unirse a una sala de videollamada
 * - room:leave - Salir de la sala
 * - webrtc:offer - Enviar oferta WebRTC
 * - webrtc:answer - Enviar respuesta WebRTC
 * - webrtc:ice-candidate - Enviar candidato ICE
 * - chat:message - Enviar mensaje de chat
 *
 * Eventos emitidos:
 * - room:joined - Confirmación de unión a sala
 * - room:user-connected - Nuevo usuario conectado
 * - room:user-disconnected - Usuario desconectado
 * - webrtc:offer - Oferta WebRTC reenviada
 * - webrtc:answer - Respuesta WebRTC reenviada
 * - webrtc:ice-candidate - Candidato ICE reenviado
 * - chat:message - Mensaje de chat reenviado
 */
@Injectable()
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

    constructor(private readonly videollamadaService: VideollamadaService) {}

    /**
     * Se ejecuta cuando el gateway se inicializa
     */
    afterInit(_server: Server): void {
        this.logger.log('WebSocket Gateway inicializado');
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
            // Intentar registrar salida del participante si estaba en una sala
            const rooms = Array.from(client.rooms);
            for (const room of rooms) {
                if (room.startsWith('cita_')) {
                    const citaId = parseInt(room.replace('cita_', ''));
                    try {
                        await this.handleLeaveRoomInternal(client, citaId);
                    } catch (_error) {
                        // Silenciar errores para no romper desconexión
                    }
                    break;
                }
            }
        } catch (error) {
            this.logger.error(
                `Error al manejar desconexión: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Cliente se une a una sala de videollamada
     *
     * @param data - Datos para unirse a la sala
     * @param client - Socket del cliente
     */
    @SubscribeMessage('room:join')
    async handleJoinRoom(
        @MessageBody() data: JoinRoomDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, usuarioId, token, nombreInvitado } = data;

            this.logger.log(
                `Usuario ${usuarioId || 'invitado'} intentando unirse a sala cita_${citaId}`,
            );

            // 1. Validar si es invitado con token
            let participante;
            if (!usuarioId && token) {
                // Es un invitado, validar token
                participante =
                    await this.videollamadaService.buscarParticipantePorToken(
                        token,
                    );
            }

            // 2. Unirse a la sala específica de la cita
            const roomName = `cita_${citaId}`;
            await client.join(roomName);

            // 3. Notificar a otros participantes que alguien se unió
            const userInfo = {
                socketId: client.id,
                usuarioId: participante?.usuario?.id || null,
                nombre:
                    participante?.nombre ||
                    nombreInvitado ||
                    `Usuario ${usuarioId}`,
                rol: participante?.rol?.nombre || 'desconocido',
            };

            // Emitir a todos en la sala (menos al cliente)
            client.to(roomName).emit('room:user-connected', userInfo);

            // 4. Enviar confirmación al cliente
            client.emit('room:joined', {
                success: true,
                room: roomName,
                userInfo,
            });

            this.logger.log(
                `Usuario unido a sala ${roomName}: ${userInfo.nombre}`,
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
     *
     * @param data - Datos de salida
     * @param client - Socket del cliente
     */
    @SubscribeMessage('room:leave')
    async handleLeaveRoom(
        @MessageBody() data: { citaId: number },
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        await this.handleLeaveRoomInternal(client, data.citaId);
    }

    /**
     * Manejo interno de salida de sala (reutilizado en handleDisconnect)
     */
    private async handleLeaveRoomInternal(
        client: Socket,
        citaId: number,
    ): Promise<void> {
        try {
            const roomName = `cita_${citaId}`;

            // Salir de la sala
            await client.leave(roomName);

            // Notificar a otros participantes
            client.to(roomName).emit('room:user-disconnected', {
                socketId: client.id,
            });

            this.logger.log(`Usuario ${client.id} salió de sala ${roomName}`);
        } catch (error) {
            this.logger.error(
                `Error al salir de sala: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja señales WebRTC de tipo Offer
     *
     * @param data - Datos del offer WebRTC
     * @param client - Socket del cliente que envía el offer
     */
    @SubscribeMessage('webrtc:offer')
    async handleOffer(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            // Enviar offer solo al destinatario específico
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.server.to(data.to).emit('webrtc:offer', payload);

            this.logger.log(`Offer enviado de ${client.id} a ${data.to}`);
        } catch (error) {
            this.logger.error(
                `Error al procesar offer: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja señales WebRTC de tipo Answer
     *
     * @param data - Datos del answer WebRTC
     * @param client - Socket del cliente que envía el answer
     */
    @SubscribeMessage('webrtc:answer')
    async handleAnswer(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            // Enviar answer solo al destinatario específico
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.server.to(data.to).emit('webrtc:answer', payload);

            this.logger.log(`Answer enviado de ${client.id} a ${data.to}`);
        } catch (error) {
            this.logger.error(
                `Error al procesar answer: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Maneja candidatos ICE para WebRTC
     *
     * @param data - Datos del candidato ICE
     * @param client - Socket del cliente que envía el candidato
     */
    @SubscribeMessage('webrtc:ice-candidate')
    async handleIceCandidate(
        @MessageBody() data: WebRtcSignalDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            // Enviar candidato ICE solo al destinatario específico
            const payload = {
                ...(data.payload || {}),
                from: client.id,
            };

            this.server.to(data.to).emit('webrtc:ice-candidate', payload);

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
     * Maneja mensajes de chat en la videollamada
     *
     * @param data - Datos del mensaje de chat
     * @param client - Socket del cliente que envía el mensaje
     */
    @SubscribeMessage('chat:message')
    async handleChatMessage(
        @MessageBody() data: ChatMessageDto,
        @ConnectedSocket() client: Socket,
    ): Promise<void> {
        try {
            const { citaId, contenidoTexto, contenidoUrl, tipoMensaje } = data;

            // 1. Guardar mensaje en base de datos
            // NOTA: Participante ID temporal hasta que tengamos tracking de participantes
            const mensajeGuardado =
                await this.videollamadaService.guardarMensaje(
                    citaId,
                    0, // Participante ID temporal
                    contenidoTexto || null,
                    contenidoUrl || null,
                    tipoMensaje,
                );

            // 2. Emitir mensaje a todos en la sala
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
                    // Aquí deberíamos tener info del participante
                    nombre: `Usuario ${client.id}`,
                    rol: 'desconocido',
                },
            };

            this.server.to(roomName).emit('chat:message', messagePayload);

            this.logger.log(
                `Mensaje de chat enviado en sala ${roomName} por ${client.id}`,
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
}
