import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('paises')
export class PaisEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre: string;
}
