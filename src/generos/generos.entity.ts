import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('generos')
export class GeneroEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre: string;

    @Column('char', { length: 1, name: 'codigo' })
    codigo: string;
}
