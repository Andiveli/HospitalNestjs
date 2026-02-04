import { DocumentsEntity } from 'src/features/documents/documents.entity';
import { PacientesEntity } from 'src/features/pacientes/pacientes.entity';
import {
    Entity,
    PrimaryColumn,
    Column,
    OneToMany,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { RegistroAtencionEntity } from './registro-atencion.entity';

/**
 * Entidad para historias clínicas de pacientes
 * Relaciona 1:1 con pacientes (paciente_id = usuario_id)
 * Relaciona 1:N con documentos (una historia tiene muchos documentos)
 * Relaciona 1:N con registros de atención (una historia tiene muchos registros)
 */
@Entity('historias_clinicas')
export class HistoriaClinicaEntity {
    @PrimaryColumn({ name: 'paciente_id' })
    pacienteId!: number;

    @Column({ type: 'timestamp', name: 'fecha_hora_apertura' })
    fechaHoraApertura!: Date;

    @OneToOne(() => PacientesEntity)
    @JoinColumn({ name: 'paciente_id', referencedColumnName: 'usuarioId' })
    paciente!: PacientesEntity;

    @OneToMany(() => DocumentsEntity, (documento) => documento.historia)
    documentos!: DocumentsEntity[];

    @OneToMany(
        () => RegistroAtencionEntity,
        (registro) => registro.historiaClinica,
    )
    registrosAtencion!: RegistroAtencionEntity[];
}
