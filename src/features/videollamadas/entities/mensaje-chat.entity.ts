import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { TipoMensajeEntity } from './tipo-mensaje.entity';
import { SesionConsultaEntity } from './sesion-consulta.entity';
import { ParticipanteSesionEntity } from './participante-sesion.entity';

@Entity('mensajes_chat')
export class MensajeChatEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('text', {
        nullable: true,
        name: 'contenido_texto',
    })
    contenidoTexto!: string | null;

    @Column('varchar', {
        length: 255,
        nullable: true,
        name: 'contenido_url',
    })
    contenidoUrl!: string | null;

    @Column({
        name: 'fecha_hora_envio',
        type: 'timestamp',
    })
    fechaHoraEnvio!: Date;

    @Column('boolean', {
        default: false,
        name: 'eliminado',
    })
    eliminado!: boolean;

    @ManyToOne(() => TipoMensajeEntity, (tipo) => tipo.mensajes, {
        nullable: false,
    })
    @JoinColumn({ name: 'tipo_mensaje_id' })
    tipoMensaje!: TipoMensajeEntity;

    @ManyToOne(() => SesionConsultaEntity, (sesion) => sesion.mensajes, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sesion_id' })
    sesion!: SesionConsultaEntity;

    @ManyToOne(
        () => ParticipanteSesionEntity,
        (participante) => participante.mensajes,
        {
            nullable: true,
            onDelete: 'SET NULL',
        },
    )
    @JoinColumn({ name: 'participante_id' })
    participante!: ParticipanteSesionEntity | null;
}
