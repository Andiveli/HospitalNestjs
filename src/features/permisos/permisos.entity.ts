import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { RolesEntity } from '../roles/roles.entity';

@Entity('permisos')
export class PermisosEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;

    @Column('varchar', { length: 255, nullable: true, name: 'descripcion' })
    descripcion!: string;

    @ManyToMany(() => RolesEntity, (rol) => rol.permisos)
    roles!: RolesEntity[];
}
