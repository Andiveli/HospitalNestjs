import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('grupos_sanguineos')
export class GrupoSanguineoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre: string;
}
