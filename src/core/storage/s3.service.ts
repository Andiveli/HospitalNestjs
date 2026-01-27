import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        this.s3Client = new S3Client({
            region: this.configService.get<string>('AWS_REGION') || 'us-east-1',
            credentials: {
                accessKeyId:
                    this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: this.configService.get<string>(
                    'AWS_SECRET_ACCESS_KEY',
                )!,
            },
        });
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET')!;
    }

    /**
     * Sube un archivo a S3
     * @param file - Archivo a subir
     * @param key - Ruta/key del archivo en S3
     * @returns URL del archivo en S3
     */
    async uploadFile(file: Express.Multer.File, key: string) {
        const uploadParams = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            await this.s3Client.send(new PutObjectCommand(uploadParams));
        } catch (error) {
            throw new Error(
                `Error uploading file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Genera una URL firmada temporal para descargar un archivo
     * @param key - Ruta/key del archivo en S3
     * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
     * @returns URL firmada temporal
     */
    async getSignedUrl(
        key: string,
        expiresIn: number = 3600,
        forceDownload: boolean = false,
    ): Promise<string> {
        const getObjectParams = {
            Bucket: this.bucketName,
            Key: key,
            ResponseContentDisposition: forceDownload ? 'attachment' : 'inline',
        };

        try {
            return await getSignedUrl(
                this.s3Client,
                new GetObjectCommand(getObjectParams),
                { expiresIn },
            );
        } catch (error) {
            throw new Error(
                `Error generating signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Elimina un archivo de S3
     * @param key - Ruta/key del archivo en S3
     */
    async deleteFile(key: string): Promise<void> {
        const deleteParams = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            await this.s3Client.send(new DeleteObjectCommand(deleteParams));
        } catch (error) {
            throw new Error(
                `Error deleting file from S3: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Genera una clave única para el archivo en S3
     * @param originalName - Nombre original del archivo
     * @param historiaId - ID de la historia clínica
     * @returns Clave única para S3 (ej: documentos/123/uuid-documento.pdf)
     */
    generateS3Key(originalName: string, historiaId: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop();
        return `documentos/${historiaId}/${timestamp}-${random}.${extension}`;
    }
}
