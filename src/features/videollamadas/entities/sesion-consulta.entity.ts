import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';
import { CitaEntity } from '../../citas/entities/cita.entity';
import { EstadoSesionEntity } from './estado-sesion.entity';
import { ParticipanteSesionEntity } from './participante-sesion.entity';
import { MensajeChatEntity } from './mensaje-chat.entity';

@Entity('sesiones_consulta')
export class SesionConsultaEntity {
    @PrimaryColumn({ name: 'cita_id' })
    citaId!: number;

    @Column('varchar', { length: 150, name: 'nombre' })
    nombre!: string;

    @Column({
        name: 'fecha_hora_inicio',
        type: 'timestamp',
    })
    fechaHoraInicio!: Date;

    @Column({
        name: 'fecha_hora_fin',
        type: 'timestamp',
    })
    fechaHoraFin!: Date;

    @Column('varchar', {
        length: 255,
        nullable: true,
        name: 'grabacion_url',
    })
    grabacionUrl!: string | null;

    @OneToOne(() => CitaEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cita_id' })
    cita!: CitaEntity;

    @ManyToOne(() => EstadoSesionEntity, (estado) => estado.sesiones, {
        nullable: false,
    })
    @JoinColumn({ name: 'estado_id' })
    estado!: EstadoSesionEntity;

    @OneToMany(
        () => ParticipanteSesionEntity,
        (participante) => participante.sesion,
    )
    participantes!: ParticipanteSesionEntity[];

    @OneToMany(() => MensajeChatEntity, (mensaje) => mensaje.sesion)
    mensajes!: MensajeChatEntity[];
}
