import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('enfermedades')
export class EnfermedadesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 150, name: 'nombre' })
    nombre: string;

    @Column('varchar', { length: 255, nullable: true, name: 'descripcion' })
    descripcion: string;
}
