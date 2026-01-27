import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DocumentsEntity } from './documents.entity';

/**
 * Entidad para tipos de documentos médicos
 * Ej: PDF, Imagen, Video, DICOM, etc.
 */
@Entity('tipo_documento')
export class TipoDocumentoEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nombre!: string;

    @Column({ type: 'text', nullable: true })
    descripcion?: string;

    @OneToMany(() => DocumentsEntity, (documento) => documento.tipo)
    documentos!: DocumentsEntity[];
}
