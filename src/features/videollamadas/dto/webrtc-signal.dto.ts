import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para señalización WebRTC (offer, answer, ICE candidate)
 */
export class WebRtcSignalDto {
    @ApiProperty({
        description: 'ID del socket del destinatario',
        example: 'socket-abc-123',
    })
    @IsString()
    @IsNotEmpty()
    to!: string;

    @ApiProperty({
        description: 'Tipo de señal',
        example: 'offer',
        enum: ['offer', 'answer', 'ice-candidate'],
    })
    @IsString()
    @IsNotEmpty()
    type!: 'offer' | 'answer' | 'ice-candidate';

    @ApiProperty({
        description: 'Payload de la señal WebRTC',
        example: { sdp: '...', type: 'offer' },
    })
    @IsObject()
    @IsOptional()
    payload?: unknown;
}
