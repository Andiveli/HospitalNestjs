import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estilos_vida')
export class EstiloVidaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;
}
