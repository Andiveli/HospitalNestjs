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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoUsuarioEntity } from '../estado-vida/estado-vida.entity';
import { GeneroEntity } from '../generos/generos.entity';
import { RolesEntity } from '../roles/roles.entity';
import { MedicoEntity } from '../medicos/medicos.entity';

@Entity('usuarios')
export class PeopleEntity {
    @ApiProperty({ description: 'ID único del usuario', example: 1 })
    @PrimaryGeneratedColumn()
    id!: number;

    @ApiProperty({
        description: 'Cédula de identidad única',
        example: '12345678',
        maxLength: 10,
    })
    @Column('char', { unique: true, length: 10, name: 'cedula' })
    cedula!: string;

    @ApiProperty({
        description: 'Primer nombre del usuario',
        example: 'Juan',
        maxLength: 100,
    })
    @Column('varchar', { length: 100, name: 'primer_nombre' })
    primerNombre!: string;

    @ApiPropertyOptional({
        description: 'Segundo nombre del usuario',
        example: 'Carlos',
        maxLength: 100,
    })
    @Column('varchar', { length: 100, nullable: true, name: 'segundo_nombre' })
    segundoNombre!: string;

    @ApiProperty({
        description: 'Primer apellido del usuario',
        example: 'Pérez',
        maxLength: 100,
    })
    @Column('varchar', { length: 100, name: 'primer_apellido' })
    primerApellido!: string;

    @ApiPropertyOptional({
        description: 'Segundo apellido del usuario',
        example: 'García',
        maxLength: 100,
    })
    @Column('varchar', {
        length: 100,
        nullable: true,
        name: 'segundo_apellido',
    })
    segundoApellido!: string;

    @ApiProperty({
        description: 'Correo electrónico único',
        example: 'juan.perez@email.com',
        maxLength: 255,
    })
    @Column('varchar', { unique: true, length: 255, name: 'email' })
    email!: string;

    @ApiProperty({
        description: 'Hash de la contraseña encriptada',
        example: '$2b$10$...',
    })
    @Column('varchar', { length: 255, name: 'password_hash' })
    passwordHash!: string;

    @ApiProperty({
        description: 'Fecha de creación del registro',
        type: 'string',
        format: 'date-time',
    })
    @Column('timestamp', { name: 'fecha_creacion' })
    fechaCreacion!: Date;

    @ApiProperty({
        description: 'Indica si el email ha sido verificado',
        example: false,
    })
    @Column('boolean', { default: false, name: 'verificado' })
    verificado!: boolean;

    @ApiPropertyOptional({
        description: 'URL de la imagen de perfil',
        example: 'https://cdn.example.com/avatar.jpg',
    })
    @Column('varchar', {
        default: '',
        length: 255,
        nullable: true,
        name: 'image_url',
    })
    imageUrl!: string;

    @ApiPropertyOptional({
        description:
            'Token para verificación de email o recuperación de contraseña',
        example: 'abc123xyz',
    })
    @Column('varchar', {
        length: 255,
        nullable: true,
        unique: true,
        name: 'token',
    })
    token!: string | null;

    @ApiPropertyOptional({
        description: 'Fecha de expiración del token',
        type: 'string',
        format: 'date-time',
    })
    @Column('timestamp', { nullable: true, name: 'token_expiracion' })
    tokenExpiracion!: Date | null;

    @ApiPropertyOptional({
        type: () => GeneroEntity,
        description: 'Género del usuario',
    })
    @ManyToOne(() => GeneroEntity)
    @JoinColumn({ name: 'genero_id' })
    genero!: GeneroEntity;

    @ApiPropertyOptional({
        type: () => EstadoUsuarioEntity,
        description: 'Estado actual del usuario',
    })
    @ManyToOne(() => EstadoUsuarioEntity)
    @JoinColumn({ name: 'estado_id' })
    estado!: EstadoUsuarioEntity;

    @ApiProperty({
        type: [RolesEntity],
        description: 'Roles asignados al usuario',
    })
    @ManyToMany(() => RolesEntity, (rol) => rol.usuarios)
    @JoinTable({
        name: 'roles_usuarios',
        joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
    })
    roles!: RolesEntity[];

    @ApiPropertyOptional({
        type: () => MedicoEntity,
        description: 'Información del médico (si aplica)',
    })
    @OneToOne(() => MedicoEntity, (medico) => medico.persona, {
        nullable: true,
    })
    medico!: MedicoEntity;
}
