import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { PeopleEntity } from 'src/people/people.entity';
import { PermisosEntity } from 'src/permisos/permisos.entity';

@Entity('roles')
export class RolesEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, unique: true, name: 'nombre' })
    nombre!: string;

    @Column('varchar', { length: 255, nullable: true, name: 'descripcion' })
    descripcion!: string;

    @ManyToMany(() => PeopleEntity, (person) => person.roles)
    usuarios!: PeopleEntity[];

    @ManyToMany(() => PermisosEntity, (permiso) => permiso.roles)
    @JoinTable({
        name: 'roles_permisos',
        joinColumn: { name: 'rol_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permiso_id', referencedColumnName: 'id' },
    })
    permisos!: PermisosEntity[];
}
