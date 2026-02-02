import { IsBoolean, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cambiar estado de micrófono
 * Cliente → Servidor
 */
export class ToggleMicDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'Estado del micrófono',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    enabled!: boolean;
}

/**
 * DTO para cambiar estado de cámara
 * Cliente → Servidor
 */
export class ToggleCameraDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'Estado de la cámara',
        example: true,
    })
    @IsBoolean()
    @IsNotEmpty()
    enabled!: boolean;
}

/**
 * Payload para broadcast de estado de media
 * Servidor → Cliente
 */
export class MediaStateUpdateDto {
    @ApiProperty({
        description: 'ID del socket del participante',
        example: 'socket_abc123',
    })
    @IsString()
    @IsNotEmpty()
    socketId!: string;

    @ApiProperty({
        description: 'ID del participante en BD',
        example: 456,
    })
    @IsNumber()
    @IsNotEmpty()
    participanteId!: number;

    @ApiProperty({
        description: 'Estado del micrófono',
        example: true,
    })
    @IsBoolean()
    micEnabled!: boolean;

    @ApiProperty({
        description: 'Estado de la cámara',
        example: true,
    })
    @IsBoolean()
    cameraEnabled!: boolean;

    @ApiProperty({
        description: 'Nombre del participante',
        example: 'Dr. Juan Pérez',
    })
    @IsString()
    nombre!: string;

    @ApiProperty({
        description: 'Rol del participante',
        example: 'medico',
    })
    @IsString()
    rol!: string;
}

/**
 * DTO para iniciar/detener grabación
 * Cliente → Servidor
 */
export class RecordingControlDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'Acción a realizar',
        example: 'start',
        enum: ['start', 'stop', 'pause', 'resume'],
    })
    @IsString()
    @IsNotEmpty()
    action!: 'start' | 'stop' | 'pause' | 'resume';
}

/**
 * Payload para estado de grabación
 * Servidor → Cliente
 */
export class RecordingStateDto {
    @ApiProperty({
        description: 'Estado actual de la grabación',
        example: 'recording',
        enum: ['idle', 'recording', 'paused', 'stopped', 'error'],
    })
    @IsString()
    @IsNotEmpty()
    status!: 'idle' | 'recording' | 'paused' | 'stopped' | 'error';

    @ApiProperty({
        description: 'ID del participante que inició la grabación',
        example: 456,
        required: false,
    })
    @IsNumber()
    startedBy?: number;

    @ApiProperty({
        description: 'Tiempo de grabación en segundos',
        example: 125,
        required: false,
    })
    @IsNumber()
    duration?: number;

    @ApiProperty({
        description: 'Timestamp de inicio',
        example: '2026-02-01T10:30:00.000Z',
        required: false,
    })
    @IsString()
    startedAt?: string;

    @ApiProperty({
        description: 'Mensaje de error (si status es error)',
        example: 'Permiso denegado para grabar',
        required: false,
    })
    @IsString()
    error?: string;
}

/**
 * DTO para notificar que un chunk de grabación está listo
 * Cliente → Servidor
 */
export class RecordingChunkDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'Número de chunk',
        example: 1,
    })
    @IsNumber()
    @IsNotEmpty()
    chunkIndex!: number;

    @ApiProperty({
        description: 'Datos del chunk en base64',
        example: 'data:video/webm;base64,AAA...',
    })
    @IsString()
    @IsNotEmpty()
    data!: string;

    @ApiProperty({
        description: 'Es el último chunk',
        example: false,
    })
    @IsBoolean()
    @IsNotEmpty()
    isLast!: boolean;
}

/**
 * Payload para lista de participantes activos
 * Servidor → Cliente
 */
export class ParticipantsListDto {
    @ApiProperty({
        description: 'Lista de participantes en la sala',
        type: 'array',
    })
    participants!: Array<{
        socketId: string;
        participanteId: number;
        nombre: string;
        rol: string;
        micEnabled: boolean;
        cameraEnabled: boolean;
        isScreenSharing: boolean;
        joinedAt: string;
    }>;
}
