import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EstadoUsuarioEntity } from '../estado-vida/estado-vida.entity';
import { GeneroEntity } from '../generos/generos.entity';
import { RolesEntity } from '../roles/roles.entity';
import { MedicoEntity } from '../medicos/medicos.entity';

@Entity('usuarios')
export class PeopleEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('char', { unique: true, length: 10, name: 'cedula' })
    cedula!: string;

    @Column('varchar', { length: 100, name: 'primer_nombre' })
    primerNombre!: string;

    @Column('varchar', { length: 100, nullable: true, name: 'segundo_nombre' })
    segundoNombre!: string;

    @Column('varchar', { length: 100, name: 'primer_apellido' })
    primerApellido!: string;

    @Column('varchar', {
        length: 100,
        nullable: true,
        name: 'segundo_apellido',
    })
    segundoApellido!: string;

    @Column('varchar', { unique: true, length: 255, name: 'email' })
    email!: string;

    @Column('varchar', { length: 255, name: 'password_hash' })
    passwordHash!: string;

    @Column('timestamp', { name: 'fecha_creacion' })
    fechaCreacion!: Date;

    @Column('boolean', { default: false, name: 'verificado' })
    verificado!: boolean;

    @Column('varchar', {
        default: '',
        length: 255,
        nullable: true,
        name: 'image_url',
    })
    imageUrl!: string;

    @Column('varchar', {
        length: 255,
        nullable: true,
        unique: true,
        name: 'token',
    })
    token!: string | null;

    @Column('timestamp', { nullable: true, name: 'token_expiracion' })
    tokenExpiracion!: Date | null;

    @ManyToOne(() => GeneroEntity)
    @JoinColumn({ name: 'genero_id' })
    genero!: GeneroEntity;

    @ManyToOne(() => EstadoUsuarioEntity)
    @JoinColumn({ name: 'estado_id' })
    estado!: EstadoUsuarioEntity;

    @ManyToMany(() => RolesEntity, (rol) => rol.usuarios)
    @JoinTable({
        name: 'roles_usuarios',
        joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    })
    roles!: RolesEntity[];

    @OneToOne(() => MedicoEntity, (medico) => medico.persona, {
        nullable: true,
    })
    medico!: MedicoEntity;
}
