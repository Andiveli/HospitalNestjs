import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { MensajeChatEntity } from './mensaje-chat.entity';

@Entity('tipos_mensaje')
export class TipoMensajeEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;

    @OneToMany(() => MensajeChatEntity, (mensaje) => mensaje.tipoMensaje)
    mensajes!: MensajeChatEntity[];
}
