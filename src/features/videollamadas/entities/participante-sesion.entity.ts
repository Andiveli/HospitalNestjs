import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { PeopleEntity } from '../../people/people.entity';
import { RolSesionEntity } from './rol-sesion.entity';
import { SesionConsultaEntity } from './sesion-consulta.entity';
import { MensajeChatEntity } from './mensaje-chat.entity';

@Entity('participantes_sesion')
export class ParticipanteSesionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', {
        length: 150,
        nullable: true,
        name: 'nombre',
    })
    nombre!: string | null;

    @Column('varchar', { length: 255, name: 'token_acceso' })
    tokenAcceso!: string;

    @Column({
        name: 'fecha_hora_union',
        type: 'timestamp',
    })
    fechaHoraUnion!: Date;

    @Column({
        name: 'fecha_hora_salida',
        type: 'timestamp',
        nullable: true,
    })
    fechaHoraSalida!: Date | null;

    @ManyToOne(() => RolSesionEntity, (rol) => rol.participantes, {
        nullable: false,
    })
    @JoinColumn({ name: 'rol_id' })
    rol!: RolSesionEntity;

    @ManyToOne(() => PeopleEntity, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'usuario_id' })
    usuario!: PeopleEntity | null;

    @ManyToOne(() => SesionConsultaEntity, (sesion) => sesion.participantes, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sesion_id' })
    sesion!: SesionConsultaEntity;

    @OneToMany(() => MensajeChatEntity, (mensaje) => mensaje.participante)
    mensajes!: MensajeChatEntity[];
}
