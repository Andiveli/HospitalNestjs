import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Proveedores de almacenamiento S3-compatible soportados
 */
const STORAGE_PROVIDER = {
    AWS: 'aws',
    SUPABASE: 'supabase',
    MINIO: 'minio',
} as const;

type StorageProvider = (typeof STORAGE_PROVIDER)[keyof typeof STORAGE_PROVIDER];

/**
 * Interfaz para el resultado de subida de archivo
 */
interface UploadResult {
    key: string;
    bucket: string;
    provider: StorageProvider;
}

/**
 * Servicio de almacenamiento S3-compatible
 *
 * Soporta múltiples proveedores:
 * - AWS S3
 * - Supabase Storage
 * - MinIO (self-hosted)
 *
 * Configurar via variables de entorno:
 * - STORAGE_PROVIDER: 'aws' | 'supabase' | 'minio' (default: 'aws')
 * - STORAGE_ENDPOINT: URL del endpoint (requerido para supabase/minio)
 * - STORAGE_REGION: Región (default: 'us-east-1')
 * - STORAGE_ACCESS_KEY_ID: Access key
 * - STORAGE_SECRET_ACCESS_KEY: Secret key
 * - STORAGE_BUCKET: Nombre del bucket
 */
@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly provider: StorageProvider;
    private readonly logger = new Logger(S3Service.name);

    constructor(private readonly configService: ConfigService) {
        this.provider = this.getProvider();
        this.bucketName = this.getBucketName();
        this.s3Client = this.createS3Client();

        this.logger.log(
            `Storage inicializado: provider=${this.provider}, bucket=${this.bucketName}`,
        );
    }

    /**
     * Determina el proveedor de storage desde la configuración
     */
    private getProvider(): StorageProvider {
        const provider = this.configService.get<string>('STORAGE_PROVIDER');

        if (
            provider &&
            Object.values(STORAGE_PROVIDER).includes(
                provider as StorageProvider,
            )
        ) {
            return provider as StorageProvider;
        }

        // Fallback: detectar por variables legacy de AWS
        if (this.configService.get<string>('AWS_ACCESS_KEY_ID')) {
            return STORAGE_PROVIDER.AWS;
        }

        return STORAGE_PROVIDER.AWS;
    }

    /**
     * Obtiene el nombre del bucket según el proveedor
     */
    private getBucketName(): string {
        // Primero intentar la variable genérica
        const bucket = this.configService.get<string>('STORAGE_BUCKET');
        if (bucket) return bucket;

        // Fallback a variable legacy de AWS
        const awsBucket = this.configService.get<string>('AWS_S3_BUCKET');
        if (awsBucket) return awsBucket;

        throw new Error(
            'STORAGE_BUCKET o AWS_S3_BUCKET debe estar configurado',
        );
    }

    /**
     * Crea el cliente S3 según el proveedor configurado
     */
    private createS3Client(): S3Client {
        const region =
            this.configService.get<string>('STORAGE_REGION') ||
            this.configService.get<string>('AWS_REGION') ||
            'us-east-1';

        const accessKeyId =
            this.configService.get<string>('STORAGE_ACCESS_KEY_ID') ||
            this.configService.get<string>('AWS_ACCESS_KEY_ID');

        const secretAccessKey =
            this.configService.get<string>('STORAGE_SECRET_ACCESS_KEY') ||
            this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

        if (!accessKeyId || !secretAccessKey) {
            throw new Error(
                'Las credenciales de storage no están configuradas',
            );
        }

        const baseConfig = {
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        };

        // Configuración específica por proveedor
        switch (this.provider) {
            case STORAGE_PROVIDER.SUPABASE: {
                const endpoint =
                    this.configService.get<string>('STORAGE_ENDPOINT');
                if (!endpoint) {
                    throw new Error(
                        'STORAGE_ENDPOINT es requerido para Supabase',
                    );
                }
                return new S3Client({
                    ...baseConfig,
                    endpoint,
                    forcePathStyle: true, // Requerido para Supabase
                });
            }

            case STORAGE_PROVIDER.MINIO: {
                const endpoint =
                    this.configService.get<string>('STORAGE_ENDPOINT');
                if (!endpoint) {
                    throw new Error('STORAGE_ENDPOINT es requerido para MinIO');
                }
                return new S3Client({
                    ...baseConfig,
                    endpoint,
                    forcePathStyle: true, // Requerido para MinIO
                });
            }

            case STORAGE_PROVIDER.AWS:
            default:
                return new S3Client(baseConfig);
        }
    }

    /**
     * Sube un archivo al storage
     * @param file - Archivo a subir
     * @param key - Ruta/key del archivo en el bucket
     * @returns Información del archivo subido
     */
    async uploadFile(
        file: Express.Multer.File,
        key: string,
    ): Promise<UploadResult> {
        const uploadParams = {
            Bucket: this.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            await this.s3Client.send(new PutObjectCommand(uploadParams));

            this.logger.debug(`Archivo subido: ${key}`);

            return {
                key,
                bucket: this.bucketName,
                provider: this.provider,
            };
        } catch (error) {
            this.logger.error(`Error subiendo archivo: ${key}`, error);
            throw new Error(
                `Error uploading file to storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Genera una URL firmada temporal para descargar un archivo
     * @param key - Ruta/key del archivo
     * @param expiresIn - Tiempo de expiración en segundos (default: 3600 = 1 hora)
     * @param forceDownload - Si es true, fuerza la descarga en lugar de visualización
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
            const url = await getSignedUrl(
                this.s3Client,
                new GetObjectCommand(getObjectParams),
                { expiresIn },
            );

            this.logger.debug(`URL firmada generada para: ${key}`);
            return url;
        } catch (error) {
            this.logger.error(`Error generando URL firmada: ${key}`, error);
            throw new Error(
                `Error generating signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Elimina un archivo del storage
     * @param key - Ruta/key del archivo a eliminar
     */
    async deleteFile(key: string): Promise<void> {
        const deleteParams = {
            Bucket: this.bucketName,
            Key: key,
        };

        try {
            await this.s3Client.send(new DeleteObjectCommand(deleteParams));
            this.logger.debug(`Archivo eliminado: ${key}`);
        } catch (error) {
            this.logger.error(`Error eliminando archivo: ${key}`, error);
            throw new Error(
                `Error deleting file from storage: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    /**
     * Genera una clave única para el archivo
     * @param originalName - Nombre original del archivo
     * @param folder - Carpeta/prefijo para organizar (ej: ID de historia clínica)
     * @returns Clave única (ej: documentos/123/1699999999999-abc123.pdf)
     */
    generateS3Key(originalName: string, folder: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 8);
        const extension = originalName.split('.').pop() || 'bin';
        return `documentos/${folder}/${timestamp}-${random}.${extension}`;
    }

    /**
     * Obtiene el proveedor actual de storage
     * @returns Nombre del proveedor configurado
     */
    getStorageProvider(): StorageProvider {
        return this.provider;
    }

    /**
     * Obtiene el nombre del bucket actual
     * @returns Nombre del bucket
     */
    getBucket(): string {
        return this.bucketName;
    }
}
