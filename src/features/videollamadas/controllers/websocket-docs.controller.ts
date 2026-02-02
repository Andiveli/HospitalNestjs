import { Controller, Get } from '@nestjs/common';
import {
    ApiTags,
    ApiExtraModels,
    ApiOperation,
    ApiOkResponse,
} from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import {
    RoomLeaveDto,
    ParticipantInfoDto,
    RoomJoinedEventDto,
    UserConnectedEventDto,
    UserDisconnectedEventDto,
    ChatParticipantInfoDto,
    ChatMessageEventDto,
    MediaStateUpdateEventDto,
    RecordingStateEventDto,
    RecordingChunkAckEventDto,
    WebRtcSignalEventDto,
    ErrorEventDto,
    WsExceptionEventDto,
    TimeWarningEventDto,
    SessionEndedEventDto,
} from '../dto/websocket-events.dto';
import { JoinRoomDto } from '../dto/join-room.dto';
import { ChatMessageDto } from '../dto/chat-message.dto';
import {
    ToggleMicDto,
    ToggleCameraDto,
    RecordingControlDto,
    RecordingChunkDto,
} from '../dto/media-controls.dto';
import { WebRtcSignalDto } from '../dto/webrtc-signal.dto';

/**
 * Documentación de la API WebSocket de Videollamadas
 *
 * Este controlador documenta los eventos WebSocket en Swagger.
 * Ver los Schemas para la estructura de cada evento.
 */
@ApiTags('WebSocket - Videollamadas (Documentación)')
@ApiExtraModels(
    // DTOs Cliente → Servidor
    JoinRoomDto,
    RoomLeaveDto,
    ChatMessageDto,
    ToggleMicDto,
    ToggleCameraDto,
    RecordingControlDto,
    RecordingChunkDto,
    WebRtcSignalDto,
    // DTOs Servidor → Cliente
    ParticipantInfoDto,
    RoomJoinedEventDto,
    UserConnectedEventDto,
    UserDisconnectedEventDto,
    ChatParticipantInfoDto,
    ChatMessageEventDto,
    MediaStateUpdateEventDto,
    RecordingStateEventDto,
    RecordingChunkAckEventDto,
    WebRtcSignalEventDto,
    ErrorEventDto,
    WsExceptionEventDto,
    // DTOs de tiempo/expiración
    TimeWarningEventDto,
    SessionEndedEventDto,
)
@Controller('websocket-docs')
export class WebSocketDocsController {
    /**
     * Documentación de eventos WebSocket para videollamadas
     *
     * Este endpoint retorna la documentación de todos los eventos WebSocket.
     * Ver la sección "Schemas" en Swagger para la estructura de cada DTO.
     */
    @Get()
    @Public()
    @ApiOperation({
        summary: 'Documentación de eventos WebSocket',
        description: `
## Conexión WebSocket

\`\`\`javascript
import { io } from 'socket.io-client';

const socket = io('http://[host]:[port]/videollamadas', {
    transports: ['websocket'],
});
\`\`\`

## Flujo típico de uso

1. **Crear sesión** (HTTP): \`POST /video-rooms/:citaId/create\`
2. **Conectar WebSocket** al namespace \`/videollamadas\`
3. **Unirse a sala**: emit \`room:join\` con \`JoinRoomDto\`
4. **Escuchar eventos**: \`room:joined\`, \`room:user-connected\`, etc.
5. **Establecer WebRTC**: intercambiar offers/answers/ice-candidates
6. **Chat**: emit \`chat:message\`, escuchar \`chat:message\`
7. **Controles de media**: emit \`media:mic-toggle\`, \`media:camera-toggle\`
8. **Salir**: emit \`room:leave\` o desconectar

---

## Eventos Cliente → Servidor (emit)

| Evento | DTO | Descripción |
|--------|-----|-------------|
| \`room:join\` | JoinRoomDto | Unirse a una sala de videollamada |
| \`room:leave\` | RoomLeaveDto | Salir de la sala |
| \`chat:message\` | ChatMessageDto | Enviar mensaje de chat |
| \`media:mic-toggle\` | ToggleMicDto | Activar/desactivar micrófono |
| \`media:camera-toggle\` | ToggleCameraDto | Activar/desactivar cámara |
| \`recording:control\` | RecordingControlDto | Controlar grabación (start/stop/pause/resume) |
| \`recording:chunk\` | RecordingChunkDto | Enviar chunk de grabación |
| \`webrtc:offer\` | WebRtcSignalDto | Enviar oferta WebRTC |
| \`webrtc:answer\` | WebRtcSignalDto | Enviar respuesta WebRTC |
| \`webrtc:ice-candidate\` | WebRtcSignalDto | Enviar candidato ICE |

---

## Eventos Servidor → Cliente (on)

| Evento | DTO | Descripción |
|--------|-----|-------------|
| \`room:joined\` | RoomJoinedEventDto | Confirmación de unión a sala |
| \`room:user-connected\` | UserConnectedEventDto | Nuevo usuario en la sala |
| \`room:user-disconnected\` | UserDisconnectedEventDto | Usuario salió de la sala |
| \`room:time-warning\` | TimeWarningEventDto | Aviso de tiempo restante (5 min, 1 min) |
| \`room:session-ended\` | SessionEndedEventDto | Sesión finalizada automáticamente |
| \`chat:message\` | ChatMessageEventDto | Mensaje de chat recibido |
| \`chat:error\` | ErrorEventDto | Error al enviar mensaje |
| \`media:state-update\` | MediaStateUpdateEventDto | Cambio de estado mic/cámara |
| \`media:error\` | ErrorEventDto | Error de media |
| \`recording:state\` | RecordingStateEventDto | Estado de la grabación |
| \`recording:chunk-ack\` | RecordingChunkAckEventDto | Confirmación de chunk recibido |
| \`webrtc:offer\` | WebRtcSignalEventDto | Oferta WebRTC recibida |
| \`webrtc:answer\` | WebRtcSignalEventDto | Respuesta WebRTC recibida |
| \`webrtc:ice-candidate\` | WebRtcSignalEventDto | Candidato ICE recibido |
| \`exception\` | WsExceptionEventDto | Error/excepción del servidor |

---

## Ejemplo de uso (JavaScript/TypeScript)

\`\`\`typescript
import { io, Socket } from 'socket.io-client';

// Conectar
const socket: Socket = io('http://localhost:3000/videollamadas', {
    transports: ['websocket'],
});

// Unirse a sala
socket.emit('room:join', {
    citaId: 123,
    usuarioId: 456, // o odontollamaId
});

// Escuchar confirmación
socket.on('room:joined', (data: RoomJoinedEventDto) => {
    if (data.success) {
        console.log('Unido a sala:', data.room);
        console.log('Participantes:', data.participants);
    } else {
        console.error('Error:', data.error);
    }
});

// Escuchar nuevos usuarios
socket.on('room:user-connected', (user: UserConnectedEventDto) => {
    console.log('Nuevo usuario:', user.nombre);
});

// Enviar mensaje de chat
socket.emit('chat:message', {
    citaId: 123,
    contenidoTexto: 'Hola!',
    tipoMensaje: 'texto',
});

// Recibir mensajes
socket.on('chat:message', (msg: ChatMessageEventDto) => {
    console.log(\`\${msg.participante.nombre}: \${msg.contenidoTexto}\`);
});

// Controles de media
socket.emit('media:mic-toggle', { citaId: 123, enabled: false });
socket.emit('media:camera-toggle', { citaId: 123, enabled: true });

// WebRTC signaling
socket.emit('webrtc:offer', {
    to: 'socket-id-destino',
    type: 'offer',
    payload: { sdp: rtcOffer.sdp, type: 'offer' },
});

socket.on('webrtc:offer', (data: WebRtcSignalEventDto) => {
    // Procesar oferta y enviar respuesta
});

// Salir
socket.emit('room:leave', { citaId: 123 });
\`\`\`

---

**Ver la sección "Schemas" en Swagger para la estructura detallada de cada DTO.**
        `,
    })
    @ApiOkResponse({
        description: 'Documentación de eventos WebSocket',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Documentación de WebSocket disponible',
                },
                namespace: {
                    type: 'string',
                    example: '/videollamadas',
                },
                eventos: {
                    type: 'object',
                    properties: {
                        clienteServidor: {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'room:join',
                                'room:leave',
                                'chat:message',
                                'media:mic-toggle',
                                'media:camera-toggle',
                                'recording:control',
                                'recording:chunk',
                                'webrtc:offer',
                                'webrtc:answer',
                                'webrtc:ice-candidate',
                            ],
                        },
                        servidorCliente: {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'room:joined',
                                'room:user-connected',
                                'room:user-disconnected',
                                'room:time-warning',
                                'room:session-ended',
                                'chat:message',
                                'chat:error',
                                'media:state-update',
                                'media:error',
                                'recording:state',
                                'recording:chunk-ack',
                                'webrtc:offer',
                                'webrtc:answer',
                                'webrtc:ice-candidate',
                                'exception',
                            ],
                        },
                    },
                },
                schemas: {
                    type: 'object',
                    description:
                        'Ver sección "Schemas" en Swagger para estructura de DTOs',
                    properties: {
                        entrada: {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'JoinRoomDto',
                                'RoomLeaveDto',
                                'ChatMessageDto',
                                'ToggleMicDto',
                                'ToggleCameraDto',
                                'RecordingControlDto',
                                'RecordingChunkDto',
                                'WebRtcSignalDto',
                            ],
                        },
                        salida: {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'RoomJoinedEventDto',
                                'UserConnectedEventDto',
                                'UserDisconnectedEventDto',
                                'TimeWarningEventDto',
                                'SessionEndedEventDto',
                                'ChatMessageEventDto',
                                'MediaStateUpdateEventDto',
                                'RecordingStateEventDto',
                                'RecordingChunkAckEventDto',
                                'WebRtcSignalEventDto',
                                'ErrorEventDto',
                                'WsExceptionEventDto',
                            ],
                        },
                    },
                },
            },
        },
    })
    getWebSocketDocs() {
        return {
            message: 'Documentación de WebSocket disponible',
            namespace: '/videollamadas',
            eventos: {
                clienteServidor: [
                    'room:join',
                    'room:leave',
                    'chat:message',
                    'media:mic-toggle',
                    'media:camera-toggle',
                    'recording:control',
                    'recording:chunk',
                    'webrtc:offer',
                    'webrtc:answer',
                    'webrtc:ice-candidate',
                ],
                servidorCliente: [
                    'room:joined',
                    'room:user-connected',
                    'room:user-disconnected',
                    'room:time-warning',
                    'room:session-ended',
                    'chat:message',
                    'chat:error',
                    'media:state-update',
                    'media:error',
                    'recording:state',
                    'recording:chunk-ack',
                    'webrtc:offer',
                    'webrtc:answer',
                    'webrtc:ice-candidate',
                    'exception',
                ],
            },
            schemas: {
                entrada: [
                    'JoinRoomDto',
                    'RoomLeaveDto',
                    'ChatMessageDto',
                    'ToggleMicDto',
                    'ToggleCameraDto',
                    'RecordingControlDto',
                    'RecordingChunkDto',
                    'WebRtcSignalDto',
                ],
                salida: [
                    'RoomJoinedEventDto',
                    'UserConnectedEventDto',
                    'UserDisconnectedEventDto',
                    'TimeWarningEventDto',
                    'SessionEndedEventDto',
                    'ChatMessageEventDto',
                    'MediaStateUpdateEventDto',
                    'RecordingStateEventDto',
                    'RecordingChunkAckEventDto',
                    'WebRtcSignalEventDto',
                    'ErrorEventDto',
                    'WsExceptionEventDto',
                ],
            },
        };
    }
}
