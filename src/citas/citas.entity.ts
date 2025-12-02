import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PacientesEntity } from 'src/pacientes/pacientes.entity';

@Entity('citas')
export class CitasEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('timestamp', { name: 'fecha_hora_creacion' })
    fechaHoraCreacion: Date;

    @Column('timestamp', { name: 'fecha_hora_inicio' })
    fechaHoraInicio: Date;

    @Column('timestamp', { name: 'fecha_hora_fin' })
    fechaHoraFin: Date;

    @Column('boolean', { default: false, name: 'telefonica' })
    telefonica: boolean;

    @ManyToOne(() => PacientesEntity, { nullable: false })
    @JoinColumn({ name: 'paciente_id' })
    paciente: PacientesEntity;

    @ManyToOne(() => PacientesEntity, { nullable: false })
    @JoinColumn({ name: 'medico_id' })
    medico: PacientesEntity;
}
