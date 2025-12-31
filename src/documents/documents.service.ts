import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentsEntity } from './documents.entity';
import { S3Service } from './s3.service';
import { TipoDocumentoEntity } from './tipo-documento.entity';
import { HistoriaClinicaEntity } from '../citas/historia-clinica.entity';
import {
    UploadDocumentDto,
    DocumentResponseDto,
    GetDownloadUrlDto,
} from './dto/documents.dto';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentsEntity)
        private readonly documentsRepository: Repository<DocumentsEntity>,
        @InjectRepository(TipoDocumentoEntity)
        private readonly tipoDocRepo: Repository<TipoDocumentoEntity>,
        @InjectRepository(HistoriaClinicaEntity)
        private readonly historiaClinicaRepository: Repository<HistoriaClinicaEntity>,
        private readonly s3Service: S3Service,
    ) {}

    /**
     * Sube un documento a S3 y guarda su metadata en la base de datos
     *
     * Flujo:
     * 1. Valida el archivo (tamaño y tipo permitido)
     * 2. Busca la historia clínica del paciente
     * 3. Busca el tipo de documento especificado
     * 4. Genera una clave única para S3
     * 5. Sube el archivo a S3
     * 6. Guarda la metadata en la base de datos
     *
     * @param file - Archivo a subir (PDF, JPEG, PNG, GIF, WebP - max 10MB)
     * @param dto - Datos del documento (título y tipo de documento)
     * @param pacienteId - ID del paciente al que pertenece el documento
     * @returns Documento creado con sus relaciones (id, título, S3 key, metadata)
     * @throws {BadRequestException} Si el archivo no es válido
     * @throws {NotFoundException} Si no existe historia clínica o tipo de documento
     */
    async uploadDocument(
        file: Express.Multer.File,
        dto: UploadDocumentDto,
        pacienteId: number,
    ): Promise<DocumentResponseDto> {
        this.validateFile(file);

        const historia = await this.validarHistoria(pacienteId);
        const tipo = await this.tipoDocRepo.findOne({
            where: { id: dto.tipo },
        });
        if (!tipo)
            throw new NotFoundException(
                `Tipo de documento no encontrado en la base de datos`,
            );

        const s3Key = this.s3Service.generateS3Key(
            file.originalname,
            historia.pacienteId.toString(),
        );

        await this.s3Service.uploadFile(file, s3Key);

        const document = this.documentsRepository.create({
            titulo: dto.titulo,
            url: s3Key,
            mimeType: file.mimetype,
            fechaHoraSubida: new Date(),
            tipo,
            historia,
        });

        const savedDocument = await this.documentsRepository.save(document);
        return this.mapToDtoConRelaciones(savedDocument);
    }

    /**
     * Obtiene todos los documentos de una historia clínica del paciente
     *
     * Busca todos los documentos asociados a la historia clínica de un paciente,
     * ordenados por fecha de subida descendente (más recientes primero).
     * Incluye las relaciones con tipo de documento e historia clínica.
     *
     * @param pacienteId - ID del paciente cuyos documentos se quieren obtener
     * @returns Lista de documentos del paciente con sus relaciones ordenados por fecha
     * @throws {NotFoundException} Si el paciente no tiene historia clínica creada
     */
    async getDocumentsByHistoria(
        pacienteId: number,
    ): Promise<DocumentResponseDto[]> {
        const historiaExists = await this.validarHistoria(pacienteId);
        const documents = await this.documentsRepository.find({
            where: { historia: historiaExists },
            relations: ['tipo', 'historia'],
            order: { fechaHoraSubida: 'DESC' },
        });
        return documents.map((doc) => this.mapToDtoConRelaciones(doc));
    }

    /**
     * Genera una URL de descarga firmada para un documento
     *
     * Crea una URL temporal y segura para acceder a un archivo en S3.
     * La URL incluye una firma AWS que expira en 1 hora por defecto.
     * Puede forzar la descarga del archivo en lugar de visualización.
     *
     * @param documentId - ID del documento a descargar
     * @param force - Si es true, fuerza la descarga (Content-Disposition: attachment)
     * @returns Objeto con URL firmada y tiempo de expiración
     * @throws {NotFoundException} Si el documento no existe
     */
    async getDownloadUrl(
        documentId: number,
        force?: boolean,
    ): Promise<GetDownloadUrlDto> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException('Documento no encontrado');
        }
        const s3Key = document.url;
        const expiresIn = 3600;
        const downloadUrl = await this.s3Service.getSignedUrl(
            s3Key,
            expiresIn,
            force,
        );

        return {
            downloadUrl,
            expiresIn,
        };
    }

    /**
     * Elimina un documento del sistema (S3 y base de datos)
     *
     * Elimina permanentemente un documento:
     * 1. Busca el documento en la base de datos
     * 2. Elimina el archivo de S3 usando la key almacenada
     * 3. Elimina el registro de la base de datos
     *
     * @param documentId - ID del documento a eliminar
     * @throws {NotFoundException} Si el documento no existe
     */
    async deleteDocument(documentId: number): Promise<void> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
        });

        if (!document) {
            throw new NotFoundException('Documento no encontrado');
        }
        await this.s3Service.deleteFile(document.url);
        await this.documentsRepository.delete(documentId);
    }

    /**
     * Obtiene todos los tipos de documento disponibles
     *
     * Retorna la lista completa de tipos de documento configurados en el sistema.
     * Estos se usan para categorizar y filtrar los documentos médicos.
     *
     * @returns Lista de tipos de documento con id, nombre y descripción
     */
    async getTiposDocumento(): Promise<TipoDocumentoEntity[]> {
        return await this.tipoDocRepo.find();
    }

    /**
     * Obtiene documentos de una historia clínica filtrados por tipo específico
     *
     * Filtra los documentos de un paciente por categoría/tipo específico.
     * Útil para mostrar solo radiologías, laboratorios, informes, etc.
     *
     * @param filtro - Nombre exacto del tipo de documento (ej: "Laboratorio", "Radiología")
     * @param userId - ID del paciente propietario de los documentos
     * @returns Lista de documentos del tipo especificado ordenados por fecha
     * @throws {NotFoundException} Si el tipo de documento no existe
     */
    async getDocumentsByHistoriaFiltro(
        filtro: string,
        userId: number,
    ): Promise<DocumentResponseDto[]> {
        const tipo = await this.validarTipo(filtro);
        const historiaExists = await this.validarHistoria(userId);
        const documents = await this.documentsRepository.find({
            where: { tipo: tipo, historia: historiaExists },
            relations: ['tipo', 'historia'],
            order: { fechaHoraSubida: 'DESC' },
        });
        return documents.map((doc) => this.mapToDtoConRelaciones(doc));
    }

    private async validarTipo(filtro: string) {
        const tipo = await this.tipoDocRepo.findOne({
            where: { nombre: filtro.trim() },
        });
        if (!tipo) {
            throw new NotFoundException(
                `Tipo de documento "${filtro}" no encontrado.`,
            );
        }
        return tipo;
    }

    private async validarHistoria(userId: number) {
        const historiaExists = await this.historiaClinicaRepository.findOne({
            where: { pacienteId: userId },
        });
        if (!historiaExists)
            throw new NotFoundException(
                'Aun no tienes una historia clínica creada',
            );
        return historiaExists;
    }

    /**
     * Valida que el archivo cumpla con las restricciones de seguridad
     *
     * Verifica:
     * - Tipo MIME permitido (solo formatos seguros)
     * - Tamaño máximo (10MB para prevenir abusos)
     *
     * @param file - Archivo a validar
     * @throws {BadRequestException} Si el archivo no cumple las validaciones
     */
    private validateFile(file: Express.Multer.File): void {
        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];

        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Tipo de archivo no permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
            );
        }

        if (file.size > maxSize) {
            throw new BadRequestException(
                `El archivo excede el tamaño máximo permitido de 10MB`,
            );
        }
    }

    /**
     * Mapea una entidad documento a DTO con relaciones incluidas
     *
     * Transforma la entidad de base de datos a un DTO seguro para la API,
     * extrayendo solo los datos necesarios y formateándolos correctamente.
     *
     * @param document - Entidad de documento con relaciones cargadas
     * @returns DTO con estructura optimizada para el frontend
     */
    private mapToDtoConRelaciones(
        document: DocumentsEntity,
    ): DocumentResponseDto {
        return {
            id: document.id,
            titulo: document.titulo,
            mimeType: document.mimeType,
            fechaHoraSubida: document.fechaHoraSubida,
        };
    }

    /**
     * Obtiene un documento específico por ID con sus relaciones
     *
     * Busca un documento específico incluyendo sus relaciones
     * para obtener información completa del tipo e historia clínica.
     *
     * @param documentId - ID del documento a buscar
     * @returns Documento completo con relaciones
     * @throws {NotFoundException} Si el documento no existe
     */
    async getDocumentoById(documentId: number): Promise<DocumentResponseDto> {
        const document = await this.documentsRepository.findOne({
            where: { id: documentId },
            relations: ['tipo', 'historia'],
        });

        if (!document) {
            throw new NotFoundException('Documento no encontrado');
        }

        return this.mapToDtoConRelaciones(document);
    }
}
