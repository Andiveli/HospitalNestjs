import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { MedicoEntity } from '../medicos/medicos.entity';
import { DiaAtencionEntity } from './dia-atencion.entity';

@Entity('horarios_medico')
export class HorarioMedicoEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'hora_inicio', type: 'time' })
    horaInicio!: string;

    @Column({ name: 'hora_fin', type: 'time' })
    horaFin!: string;

    @ManyToOne(() => DiaAtencionEntity)
    @JoinColumn({ name: 'dia_id' })
    dia!: DiaAtencionEntity;

    @ManyToOne(() => MedicoEntity)
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;
}
