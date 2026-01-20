import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { HorarioMedicoEntity } from './horario-medico.entity';

@Entity('dias_atencion')
export class DiaAtencionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'nombre', length: 50 })
    nombre!: string;

    @OneToMany(() => HorarioMedicoEntity, (horario) => horario.dia)
    horarios!: HorarioMedicoEntity[];
}
