import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// EVENTOS WebSocket - Documentación para Frontend
// ============================================================================
// Namespace: /videollamadas
// URL de conexión: ws://[host]:[port]/videollamadas
//
// EVENTOS CLIENTE → SERVIDOR (emit):
// - room:join          → JoinRoomDto (ver join-room.dto.ts)
// - room:leave         → RoomLeaveDto
// - chat:message       → ChatMessageDto (ver chat-message.dto.ts)
// - media:mic-toggle   → ToggleMicDto (ver media-controls.dto.ts)
// - media:camera-toggle → ToggleCameraDto (ver media-controls.dto.ts)
// - recording:control  → RecordingControlDto (ver media-controls.dto.ts)
// - recording:chunk    → RecordingChunkDto (ver media-controls.dto.ts)
// - webrtc:offer       → WebRtcSignalDto (ver webrtc-signal.dto.ts)
// - webrtc:answer      → WebRtcSignalDto (ver webrtc-signal.dto.ts)
// - webrtc:ice-candidate → WebRtcSignalDto (ver webrtc-signal.dto.ts)
//
// EVENTOS SERVIDOR → CLIENTE (on):
// - room:joined        → RoomJoinedEventDto
// - room:user-connected → UserConnectedEventDto
// - room:user-disconnected → UserDisconnectedEventDto
// - chat:message       → ChatMessageEventDto
// - chat:error         → ErrorEventDto
// - media:state-update → MediaStateUpdateEventDto
// - media:error        → ErrorEventDto
// - recording:state    → RecordingStateEventDto
// - recording:chunk-ack → RecordingChunkAckEventDto
// - webrtc:offer       → WebRtcSignalEventDto
// - webrtc:answer      → WebRtcSignalEventDto
// - webrtc:ice-candidate → WebRtcSignalEventDto
// - exception          → WsExceptionEventDto
// ============================================================================

// ----------------------------------------------------------------------------
// DTOs CLIENTE → SERVIDOR (Entrada)
// ----------------------------------------------------------------------------

/**
 * DTO para salir de una sala
 * Evento: room:leave
 */
export class RoomLeaveDto {
    @ApiProperty({
        description: 'ID de la cita/sesión de la que se sale',
        example: 123,
    })
    citaId!: number;
}

// ----------------------------------------------------------------------------
// DTOs SERVIDOR → CLIENTE (Salida/Respuestas)
// ----------------------------------------------------------------------------

/**
 * Información de un participante en la sala
 * Usado en múltiples eventos
 */
export class ParticipantInfoDto {
    @ApiProperty({
        description: 'ID del socket del participante',
        example: 'abc123xyz',
    })
    socketId!: string;

    @ApiProperty({
        description: 'ID del participante en la base de datos',
        example: 5,
    })
    participanteId!: number;

    @ApiPropertyOptional({
        description: 'ID del usuario (null si es invitado)',
        example: 42,
    })
    usuarioId?: number | null;

    @ApiProperty({
        description: 'Nombre del participante para mostrar',
        example: 'Dr. Juan Pérez',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Rol del participante en la sesión',
        example: 'medico',
        enum: ['medico', 'paciente', 'invitado', 'acompanante'],
    })
    rol!: string;

    @ApiProperty({
        description: 'Estado del micrófono',
        example: true,
    })
    micEnabled!: boolean;

    @ApiProperty({
        description: 'Estado de la cámara',
        example: true,
    })
    cameraEnabled!: boolean;

    @ApiProperty({
        description: 'Si está compartiendo pantalla',
        example: false,
    })
    isScreenSharing!: boolean;

    @ApiProperty({
        description: 'Fecha/hora de unión a la sala (ISO 8601)',
        example: '2024-01-15T10:30:00.000Z',
    })
    joinedAt!: string;
}

/**
 * Respuesta al unirse a una sala exitosamente
 * Evento: room:joined
 */
export class RoomJoinedEventDto {
    @ApiProperty({
        description: 'Indica si la unión fue exitosa',
        example: true,
    })
    success!: boolean;

    @ApiPropertyOptional({
        description: 'Nombre de la sala (solo si success=true)',
        example: 'cita_123',
    })
    room?: string;

    @ApiPropertyOptional({
        description: 'Información del usuario que se unió',
        type: ParticipantInfoDto,
    })
    userInfo?: ParticipantInfoDto;

    @ApiPropertyOptional({
        description: 'Lista de participantes activos en la sala',
        type: [ParticipantInfoDto],
    })
    participants?: ParticipantInfoDto[];

    @ApiPropertyOptional({
        description: 'Mensaje de error (solo si success=false)',
        example: 'Token de invitación requerido o sesión no encontrada',
    })
    error?: string;
}

/**
 * Notificación de nuevo usuario conectado a la sala
 * Evento: room:user-connected
 */
export class UserConnectedEventDto extends ParticipantInfoDto {}

/**
 * Notificación de usuario desconectado de la sala
 * Evento: room:user-disconnected
 */
export class UserDisconnectedEventDto {
    @ApiProperty({
        description: 'ID del socket del usuario que se desconectó',
        example: 'abc123xyz',
    })
    socketId!: string;

    @ApiPropertyOptional({
        description: 'ID del participante en la base de datos',
        example: 5,
    })
    participanteId?: number;
}

/**
 * Información del participante en mensajes de chat
 */
export class ChatParticipantInfoDto {
    @ApiProperty({
        description: 'ID del participante',
        example: 5,
    })
    id!: number;

    @ApiProperty({
        description: 'Nombre del participante',
        example: 'Dr. Juan Pérez',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Rol del participante',
        example: 'medico',
    })
    rol!: string;
}

/**
 * Mensaje de chat recibido
 * Evento: chat:message
 */
export class ChatMessageEventDto {
    @ApiProperty({
        description: 'ID único del mensaje en la base de datos',
        example: 789,
    })
    id!: number;

    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    citaId!: number;

    @ApiPropertyOptional({
        description: 'Contenido de texto del mensaje',
        example: 'Hola, ¿cómo está el paciente?',
    })
    contenidoTexto?: string;

    @ApiPropertyOptional({
        description: 'URL del archivo adjunto (imagen, documento, etc.)',
        example: 'https://storage.example.com/archivo.pdf',
    })
    contenidoUrl?: string;

    @ApiProperty({
        description: 'Tipo de mensaje',
        example: 'texto',
        enum: ['texto', 'imagen', 'archivo', 'audio'],
    })
    tipoMensaje!: string;

    @ApiProperty({
        description: 'Fecha/hora de envío (ISO 8601)',
        example: '2024-01-15T10:35:00.000Z',
    })
    fechaHoraEnvio!: Date;

    @ApiProperty({
        description: 'ID del socket del remitente',
        example: 'abc123xyz',
    })
    from!: string;

    @ApiProperty({
        description: 'Información del participante que envió el mensaje',
        type: ChatParticipantInfoDto,
    })
    participante!: ChatParticipantInfoDto;
}

/**
 * Actualización de estado de media (micrófono/cámara)
 * Evento: media:state-update
 */
export class MediaStateUpdateEventDto {
    @ApiProperty({
        description: 'ID del socket del participante',
        example: 'abc123xyz',
    })
    socketId!: string;

    @ApiProperty({
        description: 'ID del participante en la base de datos',
        example: 5,
    })
    participanteId!: number;

    @ApiProperty({
        description: 'Estado del micrófono',
        example: true,
    })
    micEnabled!: boolean;

    @ApiProperty({
        description: 'Estado de la cámara',
        example: false,
    })
    cameraEnabled!: boolean;

    @ApiProperty({
        description: 'Nombre del participante',
        example: 'Dr. Juan Pérez',
    })
    nombre!: string;

    @ApiProperty({
        description: 'Rol del participante',
        example: 'medico',
    })
    rol!: string;
}

/**
 * Estado de la grabación
 * Evento: recording:state
 */
export class RecordingStateEventDto {
    @ApiProperty({
        description: 'Estado actual de la grabación',
        example: 'recording',
        enum: ['idle', 'recording', 'paused', 'stopped', 'error'],
    })
    status!: 'idle' | 'recording' | 'paused' | 'stopped' | 'error';

    @ApiPropertyOptional({
        description: 'ID del participante que inició la grabación',
        example: 5,
    })
    startedBy?: number;

    @ApiPropertyOptional({
        description: 'Fecha/hora de inicio de la grabación (ISO 8601)',
        example: '2024-01-15T10:30:00.000Z',
    })
    startedAt?: string;

    @ApiPropertyOptional({
        description: 'Duración en segundos (solo cuando status=stopped)',
        example: 1800,
    })
    duration?: number;

    @ApiPropertyOptional({
        description: 'Mensaje de error (solo cuando status=error)',
        example: 'Ya hay una grabación en curso',
    })
    error?: string;
}

/**
 * Confirmación de recepción de chunk de grabación
 * Evento: recording:chunk-ack
 */
export class RecordingChunkAckEventDto {
    @ApiProperty({
        description: 'Índice del chunk recibido',
        example: 5,
    })
    chunkIndex!: number;

    @ApiProperty({
        description: 'Si el chunk fue recibido correctamente',
        example: true,
    })
    received!: boolean;

    @ApiPropertyOptional({
        description: 'Mensaje de error si received=false',
        example: 'No hay grabación activa',
    })
    error?: string;
}

/**
 * Señal WebRTC reenviada (offer, answer, ice-candidate)
 * Eventos: webrtc:offer, webrtc:answer, webrtc:ice-candidate
 */
export class WebRtcSignalEventDto {
    @ApiProperty({
        description: 'ID del socket del remitente',
        example: 'abc123xyz',
    })
    from!: string;

    @ApiPropertyOptional({
        description:
            'SDP de la oferta/respuesta (para offer/answer). Objeto RTCSessionDescriptionInit',
        example: { type: 'offer', sdp: 'v=0\r\no=- 123456...' },
    })
    sdp?: {
        type: 'offer' | 'answer';
        sdp: string;
    };

    @ApiPropertyOptional({
        description:
            'Candidato ICE (para ice-candidate). Objeto RTCIceCandidateInit',
        example: {
            candidate:
                'candidate:123 1 udp 2130706431 192.168.1.1 54321 typ host',
            sdpMid: '0',
            sdpMLineIndex: 0,
        },
    })
    candidate?: {
        candidate: string;
        sdpMid?: string;
        sdpMLineIndex?: number;
    };

    @ApiPropertyOptional({
        description: 'Payload adicional (datos extra si los hubiera)',
    })
    payload?: unknown;
}

/**
 * Error genérico en eventos
 * Eventos: chat:error, media:error
 */
export class ErrorEventDto {
    @ApiProperty({
        description: 'Mensaje de error',
        example: 'Participante no encontrado. Debes unirte a la sala primero.',
    })
    error!: string;
}

/**
 * Excepción de WebSocket (errores de validación, etc.)
 * Evento: exception
 */
export class WsExceptionEventDto {
    @ApiProperty({
        description: 'Código de estado HTTP equivalente',
        example: 400,
    })
    status!: number;

    @ApiProperty({
        description: 'Mensaje de error legible',
        example: 'Error de validación',
    })
    message!: string;

    @ApiPropertyOptional({
        description:
            'Detalles adicionales del error (ej: errores de validación)',
        example: ['citaId must be a number', 'usuarioId should not be empty'],
    })
    errors?: string[];

    @ApiProperty({
        description: 'Timestamp del error (ISO 8601)',
        example: '2024-01-15T10:30:00.000Z',
    })
    timestamp!: string;
}

// ----------------------------------------------------------------------------
// DTOs PARA EVENTOS DE TIEMPO Y EXPIRACIÓN DE SESIÓN
// ----------------------------------------------------------------------------

/**
 * Aviso de tiempo restante en la sesión
 * Evento: room:time-warning
 *
 * Se emite automáticamente 5 minutos y 1 minuto antes de que termine la sesión.
 * El frontend debería mostrar una notificación al usuario.
 */
export class TimeWarningEventDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Minutos restantes antes de que termine la sesión',
        example: 5,
    })
    minutosRestantes!: number;

    @ApiProperty({
        description: 'Fecha/hora de fin programada (ISO 8601)',
        example: '2024-01-15T11:00:00.000Z',
    })
    fechaHoraFin!: string;

    @ApiProperty({
        description: 'Mensaje legible para mostrar al usuario',
        example: 'La sesión finalizará en 5 minutos',
    })
    mensaje!: string;
}

/**
 * Notificación de sesión finalizada automáticamente
 * Evento: room:session-ended
 *
 * Se emite cuando la sesión es finalizada automáticamente por el sistema
 * al llegar la hora de fin programada. El frontend debería cerrar la
 * videollamada y mostrar un mensaje al usuario.
 */
export class SessionEndedEventDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Razón de la finalización',
        example:
            'La sesión ha finalizado automáticamente al llegar la hora programada',
    })
    razon!: string;

    @ApiProperty({
        description: 'Fecha/hora en que se finalizó la sesión (ISO 8601)',
        example: '2024-01-15T11:00:00.000Z',
    })
    finalizadaEn!: string;

    @ApiProperty({
        description: 'Quién finalizó la sesión',
        example: 'sistema',
        enum: ['sistema', 'medico', 'paciente'],
    })
    finalizadaPor!: string;
}
