import { DocumentsEntity } from 'src/features/documents/documents.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

/**
 * Entidad para historias clínicas de pacientes
 * Relaciona 1:1 con pacientes (paciente_id = usuario_id)
 * Relaciona 1:N con documentos (una historia tiene muchos documentos)
 */
@Entity('historias_clinicas')
export class HistoriaClinicaEntity {
    @PrimaryGeneratedColumn({ name: 'paciente_id' })
    pacienteId!: number;

    @Column({ type: 'timestamp', name: 'fecha_hora_apertura' })
    fechaHoraApertura!: Date;

    @OneToMany(() => DocumentsEntity, (documento) => documento.historia)
    documentos!: DocumentsEntity[];
}
