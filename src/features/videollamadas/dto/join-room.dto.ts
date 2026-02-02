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
        description:
            'ID del usuario (alias de usuarioId para compatibilidad con frontend)',
        example: 456,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    odontollamaId?: number | null;

    @ApiProperty({
        description: 'Token de acceso UUID para participantes existentes',
        example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        required: false,
    })
    @IsString()
    @IsOptional()
    token?: string;

    @ApiProperty({
        description:
            'Código de acceso de invitación (alternativa a token para invitados)',
        example: 'PR0TBJQB93YM',
        required: false,
    })
    @IsString()
    @IsOptional()
    guestToken?: string;

    @ApiProperty({
        description: 'Nombre del invitado (solo para invitados sin cuenta)',
        example: 'María García',
        required: false,
    })
    @IsString()
    @IsOptional()
    nombreInvitado?: string;

    /**
     * Obtiene el ID del usuario, priorizando usuarioId sobre odontollamaId
     */
    getUsuarioId(): number | null | undefined {
        return this.usuarioId ?? this.odontollamaId;
    }
}
