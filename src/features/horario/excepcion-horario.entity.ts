import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MedicoEntity } from '../medicos/medicos.entity';

@Entity('excepcion_horario')
export class ExcepcionHorarioEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'fecha', type: 'date' })
    fecha!: Date;

    @Column({ name: 'hora_inicio', type: 'time', nullable: true })
    horaInicio?: string;

    @Column({ name: 'hora_fin', type: 'time', nullable: true })
    horaFin?: string;

    @Column({ name: 'motivo', length: 255, nullable: true })
    motivo?: string;

    @Column({ name: 'confirmada', type: 'boolean', default: false })
    confirmada!: boolean;

    @ManyToOne(() => MedicoEntity)
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;
}
