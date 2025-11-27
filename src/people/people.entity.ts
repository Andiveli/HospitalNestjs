import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('people')
export class PeopleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 100 })
    nombre: string;

    @Column('varchar', { length: 100 })
    apellido: string;

    @Column('varchar', { unique: true, length: 100 })
    email: string;

    @Column('varchar', { length: 100 })
    password: string;

    @Column('tinyint', { default: false })
    confirmado: boolean;

    @Column('varchar', { nullable: false, default: 'paciente', length: 50 })
    rol: string;

    @Column('varchar', { nullable: true, length: 255 })
    token: string | null;
}
