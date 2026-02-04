import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { DerivacionEntity } from './derivacion.entity';

@Entity('centros_salud')
export class CentroSaludEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'nombre', length: 150 })
    nombre!: string;

    @Column({ name: 'direccion', length: 150, nullable: true })
    direccion?: string;

    @Column({ name: 'telefono', length: 20, nullable: true })
    telefono?: string;

    @Column({ name: 'tipo_id' })
    tipoId!: number;

    @OneToMany(() => DerivacionEntity, (derivacion) => derivacion.centro)
    derivaciones?: DerivacionEntity[];
}
