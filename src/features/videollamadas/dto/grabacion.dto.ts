import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

/**
 * DTO para guardar la URL de grabación de videollamada
 */
export class GuardarGrabacionDto {
    @ApiProperty({
        description: 'URL completa del video de grabación subido a S3',
        example: 'https://s3.amazonaws.com/bucket/grabaciones/cita_123.mp4',
        format: 'uri',
    })
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    grabacionUrl!: string;
}

/**
 * DTO de respuesta al guardar grabación
 */
export class GuardarGrabacionResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Grabación guardada exitosamente',
    })
    message!: string;
}

/**
 * DTO de respuesta al obtener grabación
 */
export class ObtenerGrabacionResponseDto {
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
