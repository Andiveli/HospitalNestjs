import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para crear una sala de videollamada
 */
export enum RoomType {
    CONSULTA = 'consulta',
    URGENCIA = 'urgencia',
    SEGUIMIENTO = 'seguimiento',
}

export class CreateRoomDto {
    @ApiProperty({
        description: 'Tipo de sala de videollamada',
        example: 'consulta',
        enum: ['consulta', 'urgencia', 'seguimiento'],
    })
    @IsEnum(RoomType)
    @IsOptional()
    tipo?: RoomType;

    @ApiProperty({
        description: 'Título personalizado de la sala',
        example: 'Consulta con Dr. Pérez',
        required: false,
    })
    @IsString()
    @IsOptional()
    titulo?: string;

    @ApiProperty({
        description: 'Descripción adicional de la sala',
        example: 'Consulta de seguimiento post-operatorio',
        required: false,
    })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({
        description: 'Duración estimada en minutos',
        example: 30,
        required: false,
    })
    @IsString()
    @IsOptional()
    duracionMinutos?: number;

    @ApiProperty({
        description: 'Permitir grabación de la sesión',
        example: true,
        required: false,
    })
    @IsString()
    @IsOptional()
    permitirGrabacion?: boolean;
}
