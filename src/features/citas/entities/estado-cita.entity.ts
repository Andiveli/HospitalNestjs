import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CitaEntity } from './cita.entity';

@Entity('estados_cita')
export class EstadoCitaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    nombre!: string;

    @OneToMany(() => CitaEntity, (cita) => cita.estado)
    citas!: CitaEntity[];
}
