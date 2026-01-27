import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('estados_usuario')
export class EstadoUsuarioEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;
}
