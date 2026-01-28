import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ParticipanteSesionEntity } from './participante-sesion.entity';

@Entity('roles_sesion')
export class RolSesionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;

    @OneToMany(
        () => ParticipanteSesionEntity,
        (participante) => participante.rol,
    )
    participantes!: ParticipanteSesionEntity[];
}
