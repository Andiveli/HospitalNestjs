import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para enviar mensajes de chat
 */
export class ChatMessageDto {
    @ApiProperty({
        description: 'ID de la cita/sesión',
        example: 123,
    })
    @IsNumber()
    @IsNotEmpty()
    citaId!: number;

    @ApiProperty({
        description: 'Contenido del mensaje de texto',
        example: 'Hola, ¿cómo estás?',
        required: false,
    })
    @IsString()
    @IsOptional()
    contenidoTexto?: string;

    @ApiProperty({
        description: 'URL del archivo adjunto',
        example: 'https://example.com/archivo.pdf',
        required: false,
    })
    @IsString()
    @IsOptional()
    contenidoUrl?: string;

    @ApiProperty({
        description: 'Tipo de mensaje',
        example: 'texto',
        default: 'texto',
    })
    @IsString()
    @IsNotEmpty()
    tipoMensaje!: string;
}
