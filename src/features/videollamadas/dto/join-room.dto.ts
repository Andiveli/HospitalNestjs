import { IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para unirse a una sala de videollamada vía WebSocket
 */
export class JoinRoomDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'ID del usuario (null para invitados)',
        example: 456,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    usuarioId?: number | null;

    @ApiProperty({
        description: 'Token de acceso JWT para invitados',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        required: false,
    })
    @IsString()
    @IsOptional()
    token?: string;

    @ApiProperty({
        description: 'Nombre del invitado (solo para invitados sin cuenta)',
        example: 'María García',
        required: false,
    })
    @IsString()
    @IsOptional()
    nombreInvitado?: string;
}
