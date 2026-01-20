import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UploadDocumentDto {
    @ApiProperty({
        description: 'Título del documento',
        example: 'Radiografía de tórax',
        maxLength: 150,
    })
    @IsString()
    @IsNotEmpty({ message: 'El título es requerido' })
    @MaxLength(150, { message: 'El título no puede exceder 150 caracteres' })
    titulo!: string;

    @ApiProperty({
        description: 'Tipo de documento (nombre)',
        example: '1. Lab, 2. Imagenes, 3. Informes',
    })
    @IsNotEmpty({ message: 'El tipo de documento es requerido' })
    tipo!: number;
}

// DTO específico para Swagger en el upload
export class UploadDocumentWithFileDto {
    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'Archivo (PDF, JPEG, PNG, GIF, WebP - max 10MB)',
    })
    file!: Express.Multer.File;

    @ApiProperty({
        description: 'Título del documento',
        example: 'Radiografía de tórax',
        maxLength: 150,
    })
    titulo!: string;
}

export class DocumentResponseDto {
    @ApiProperty({
        description: 'ID del documento',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Título del documento',
        example: 'Radiografía de tórax',
    })
    titulo!: string;

    @ApiProperty({
        description: 'Tipo MIME del documento',
        example: 'application/pdf',
    })
    mimeType!: string;

    @ApiProperty({
        description: 'Fecha y hora de subida',
        example: '2023-01-15T10:30:00Z',
    })
    fechaHoraSubida!: Date;
}

export class GetDownloadUrlDto {
    @ApiProperty({
        description: 'URL de descarga firmada (válida por 1 hora)',
        example:
            'https://bucket.s3.amazonaws.com/documentos/123/file.pdf?X-Amz-Expires=3600...',
    })
    downloadUrl!: string;

    @ApiProperty({
        description: 'Tiempo de expiración de la URL (en segundos)',
        example: 3600,
    })
    expiresIn!: number;
}

// DTOs para respuestas de error
export class BadRequestErrorResponseDto {
    @ApiProperty({
        description: 'Mensaje de error',
        example:
            'Tipo de archivo no permitido. Tipos permitidos: application/pdf, image/jpeg, image/png, image/gif, image/webp',
    })
    message!: string;

    @ApiProperty({
        description: 'Código de error HTTP',
        example: 400,
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Tipo de error',
        example: 'Bad Request',
    })
    error!: string;
}

export class NotFoundErrorResponseDto {
    @ApiProperty({
        description: 'Mensaje de error',
        example: 'Documento no encontrado',
    })
    message!: string;

    @ApiProperty({
        description: 'Código de error HTTP',
        example: 404,
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Tipo de error',
        example: 'Not Found',
    })
    error!: string;
}

export class InternalServerErrorResponseDto {
    @ApiProperty({
        description: 'Mensaje de error',
        example:
            'Error uploading file to S3: The specified bucket does not exist',
    })
    message!: string;

    @ApiProperty({
        description: 'Código de error HTTP',
        example: 500,
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Tipo de error',
        example: 'Internal Server Error',
    })
    error!: string;
}

export class UnauthorizedErrorResponseDto {
    @ApiProperty({
        description: 'Mensaje de error',
        example: 'Unauthorized',
    })
    message!: string;

    @ApiProperty({
        description: 'Código de error HTTP',
        example: 401,
    })
    statusCode!: number;

    @ApiProperty({
        description: 'Tipo de error',
        example: 'Unauthorized',
    })
    error!: string;
}
