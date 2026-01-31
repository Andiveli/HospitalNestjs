import { ApiProperty } from '@nestjs/swagger';

/**
 * Participante en la sala de videollamada
 */
export class ParticipanteDto {
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

    @ApiProperty({
        description: 'ID del socket del participante',
        example: 'socket_abc123',
    })
    socketId!: string;
}

/**
 * Configuración WebRTC para la sala
 */
export class WebRtcConfigDto {
    @ApiProperty({
        description: 'Servidores STUN para NAT traversal',
        example: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
        ],
        type: [String],
    })
    stunServers!: string[];

    @ApiProperty({
        description: 'Servidores TURN para relay',
        example: ['turn:turn.example.com:3478'],
        type: [String],
        required: false,
    })
    turnServers?: string[];
}

/**
 * Datos de la sala creada
 */
export class CreateRoomDataDto {
    @ApiProperty({
        description: 'ID único de la sala',
        example: 'room_abc123',
    })
    sessionId!: string;

    @ApiProperty({
        description: 'ID de la cita asociada',
        example: 123,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Nombre descriptivo de la sesión',
        example: 'Consulta - Dr. Juan Pérez / María García',
    })
    nombreSesion!: string;

    @ApiProperty({
        description: 'Fecha de inicio de la sesión',
        example: '2024-01-15T14:30:00Z',
        format: 'date-time',
    })
    fechaInicio!: Date;

    @ApiProperty({
        description: 'Configuración WebRTC',
    })
    webRtcConfig!: WebRtcConfigDto;

    @ApiProperty({
        description: 'Lista de participantes',
        type: [ParticipanteDto],
    })
    participantes!: ParticipanteDto[];
}

/**
 * DTO de respuesta para creación de sala de videollamada
 */
export class CreateRoomResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Sala de videollamada creada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la sala creada',
    })
    data!: CreateRoomDataDto;
}

/**
 * Servidor ICE para configuración WebRTC
 */
export class IceServerDto {
    @ApiProperty({
        description: 'URLs del servidor ICE',
        example: 'stun:stun.l.google.com:19302',
    })
    urls!: string | string[];
}

/**
 * Configuración ICE para WebRTC
 */
export class WebRtcJoinConfigDto {
    @ApiProperty({
        description: 'Servidores ICE para conexión WebRTC',
        type: [IceServerDto],
    })
    iceServers!: IceServerDto[];
}

/**
 * Datos de información de unión a sala
 */
export class JoinInfoDataDto {
    @ApiProperty({
        description: 'ID de la sesión',
        example: 'room_123',
    })
    sessionId!: string;

    @ApiProperty({
        description: 'Indica si se puede unir a la sala',
        example: true,
    })
    canJoin!: boolean;

    @ApiProperty({
        description: 'Razón si no se puede unir',
        example: null,
        nullable: true,
    })
    reason!: string | null;

    @ApiProperty({
        description: 'Configuración WebRTC',
    })
    webRtcConfig!: WebRtcJoinConfigDto;

    @ApiProperty({
        description: 'Cantidad de participantes actual',
        example: 2,
    })
    participantsCount!: number;

    @ApiProperty({
        description: 'Máximo de participantes permitidos',
        example: 10,
    })
    maxParticipants!: number;
}

/**
 * DTO de respuesta para información de unión a sala
 */
export class JoinInfoResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Información de sala obtenida',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la sala',
    })
    data!: JoinInfoDataDto;
}

/**
 * Datos del link de invitado generado
 */
export class GuestLinkDataDto {
    @ApiProperty({
        description: 'URL completa para compartir',
        example: 'https://app.hospital.com/videollamada/invitado/ABC123XY',
    })
    linkInvitacion!: string;

    @ApiProperty({
        description: 'Código de acceso único (8 caracteres)',
        example: 'ABC123XY',
    })
    codigoAcceso!: string;

    @ApiProperty({
        description: 'Tiempo de validez',
        example: '24 horas',
    })
    expiraEn!: string;

    @ApiProperty({
        description: 'Rol asignado al invitado',
        example: 'acompanante',
    })
    rolInvitado!: string;
}

/**
 * DTO de respuesta para generación de link de invitado
 */
export class GuestLinkResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Link de invitado generado exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos del link generado',
    })
    data!: GuestLinkDataDto;
}

/**
 * DTO de respuesta para procesamiento de señal WebRTC
 */
export class SignalResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Señal procesada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'ID único de la señal procesada',
        example: 'signal_abc123',
    })
    signalId!: string;

    @ApiProperty({
        description: 'Timestamp de la señal',
        example: '2024-01-15T14:35:00Z',
        format: 'date-time',
    })
    timestamp!: string;
}

/**
 * Datos de la sala terminada
 */
export class EndRoomDataDto {
    @ApiProperty({
        description: 'ID de la sesión',
        example: 'room_123',
    })
    sessionId!: string;

    @ApiProperty({
        description: 'Hora de terminación',
        example: '2024-01-15T15:30:00Z',
        format: 'date-time',
    })
    terminationTime!: string;

    @ApiProperty({
        description: 'Duración en segundos',
        example: 3600,
    })
    duration!: number;

    @ApiProperty({
        description: 'Total participantes al terminar',
        example: 3,
    })
    participantCount!: number;

    @ApiProperty({
        description: 'URL de grabación si está disponible',
        example: 'https://s3.amazonaws.com/recordings/session_123.mp4',
        nullable: true,
    })
    recordingUrl!: string | null;
}

/**
 * DTO de respuesta para terminación de sala
 */
export class EndRoomResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Sala terminada exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la sesión terminada',
    })
    data!: EndRoomDataDto;
}

/**
 * DTO de respuesta para sala terminada (DELETE endpoint)
 * Alias de EndRoomResponseDto para consistencia con el nombre del endpoint
 */
export class SalaTerminadaResponseDto extends EndRoomResponseDto {}

/**
 * DTO de respuesta al guardar grabación
 */
export class GrabacionGuardadaResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Grabación guardada exitosamente',
    })
    message!: string;
}

/**
 * DTO de respuesta al obtener grabación
 */
export class GrabacionObtenidaResponseDto {
    @ApiProperty({
        description: 'URL completa del video o null si no existe',
        example: 'https://s3.amazonaws.com/bucket/grabaciones/cita_123.mp4',
        nullable: true,
    })
    grabacionUrl!: string | null;

    @ApiProperty({
        description: 'Indica si existe una grabación para esta cita',
        example: true,
    })
    existeGrabacion!: boolean;
}
