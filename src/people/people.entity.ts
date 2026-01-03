import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    ManyToMany,
    JoinTable,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { RolesEntity } from 'src/roles/roles.entity';
import { GeneroEntity } from 'src/generos/generos.entity';
import { EstadoUsuarioEntity } from 'src/estado-vida/estado-vida.entity';
import { MedicoEntity } from '../medicos/medicos.entity';

@Entity('usuarios')
export class PeopleEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('char', { unique: true, length: 10, name: 'cedula' })
    cedula: string;

    @Column('varchar', { length: 100, name: 'primer_nombre' })
    primerNombre: string;

    @Column('varchar', { length: 100, nullable: true, name: 'segundo_nombre' })
    segundoNombre: string;

    @Column('varchar', { length: 100, name: 'primer_apellido' })
    primerApellido: string;

    @Column('varchar', {
        length: 100,
        nullable: true,
        name: 'segundo_apellido',
    })
    segundoApellido: string;

    @Column('varchar', { unique: true, length: 255, name: 'email' })
    email: string;

    @Column('varchar', { length: 255, name: 'password_hash' })
    passwordHash: string;

    @Column('timestamp', { name: 'fecha_creacion' })
    fechaCreacion: Date;

    @Column('boolean', { default: false, name: 'verificado' })
    verificado: boolean;

    @Column('varchar', {
        default: '',
        length: 255,
        nullable: true,
        name: 'image_url',
    })
    imageUrl: string;

    @Column('varchar', {
        length: 255,
        nullable: true,
        unique: true,
        name: 'token',
    })
    token: string | null;

    @Column('timestamp', { nullable: true, name: 'token_expiracion' })
    tokenExpiracion: Date | null;

    @ManyToOne(() => GeneroEntity)
    @JoinColumn({ name: 'genero_id' })
    genero: GeneroEntity;

    @ManyToOne(() => EstadoUsuarioEntity)
    @JoinColumn({ name: 'estado_id' })
    estado: EstadoUsuarioEntity;

    @ManyToMany(() => RolesEntity, (rol) => rol.usuarios)
    @JoinTable({
        name: 'roles_usuarios',
        joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    })
    roles: RolesEntity[];

    @OneToOne(() => MedicoEntity, (medico) => medico.persona, {
        nullable: true,
    })
    medico: MedicoEntity;
}
