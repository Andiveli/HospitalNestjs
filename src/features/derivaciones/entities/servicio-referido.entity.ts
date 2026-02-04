import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { DerivacionEntity } from './derivacion.entity';

@Entity('servicios_referidos')
export class ServicioReferidoEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'nombre', length: 150 })
    nombre!: string;

    @ManyToMany(() => DerivacionEntity, (derivacion) => derivacion.servicios)
    derivaciones?: DerivacionEntity[];
}
