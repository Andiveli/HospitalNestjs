import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipos_enfermedad')
export class TiposEnfermedadEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre: string;
}
