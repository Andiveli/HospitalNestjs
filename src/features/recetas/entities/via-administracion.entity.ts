import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('vias_administracion')
export class ViaAdministracionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    nombre!: string;
}
