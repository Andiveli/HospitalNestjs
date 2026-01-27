import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { CitaEntity } from './cita.entity';
import { HistoriaClinicaEntity } from './historia-clinica.entity';

@Entity('registros_atencion')
export class RegistroAtencionEntity {
    @PrimaryColumn({ name: 'cita_id' })
    citaId!: number;

    @Column({ name: 'motivo_cita', type: 'text', nullable: true })
    motivoCita?: string;

    @Column({ type: 'text', nullable: true })
    diagnostico?: string;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;

    @Column({
        name: 'fecha_hora_creacion',
        type: 'timestamp',
    })
    fechaHoraCreacion!: Date;

    @OneToOne(() => CitaEntity, (cita) => cita.registroAtencion, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'cita_id' })
    cita!: CitaEntity;

    @ManyToOne(() => HistoriaClinicaEntity, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'historia_id' })
    historiaClinica!: HistoriaClinicaEntity;

    // TODO: Agregar relaciones cuando se creen los módulos
    // @OneToOne(() => RecetaMedicaEntity, (receta) => receta.registroAtencion)
    // recetaMedica?: RecetaMedicaEntity;

    // @OneToMany(() => DerivacionEntity, (derivacion) => derivacion.registroAtencion)
    // derivaciones?: DerivacionEntity[];
}
