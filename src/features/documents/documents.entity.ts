import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { TipoDocumentoEntity } from './tipo-documento.entity';
import { HistoriaClinicaEntity } from '../citas/entities/historia-clinica.entity';

/**
 * Entidad para documentos de historias clínicas
 * Relaciona con historias_clinicas (paciente_id) y tipo_documento (id)
 */
@Entity('documentos_hc')
export class DocumentsEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 150 })
    titulo!: string;

    @Column({ type: 'varchar', length: 255 })
    url!: string;

    @Column({ type: 'varchar', length: 100, name: 'tipo_mime' })
    mimeType!: string;

    @CreateDateColumn({ name: 'fecha_hora_subida' })
    fechaHoraSubida!: Date;

    @ManyToOne(() => TipoDocumentoEntity, { nullable: false })
    @JoinColumn({ name: 'tipo_id' })
    tipo!: TipoDocumentoEntity;

    @ManyToOne(() => HistoriaClinicaEntity, { nullable: false })
    @JoinColumn({ name: 'historia_id' })
    historia!: HistoriaClinicaEntity;
}
