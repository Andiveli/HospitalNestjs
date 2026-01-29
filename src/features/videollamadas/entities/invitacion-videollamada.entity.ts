import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { CitaEntity } from '../../citas/entities/cita.entity';
import { PeopleEntity } from '../../people/people.entity';

/**
 * Entidad para las invitaciones a videollamadas
 *
 * Permite que acompañantes/invitados accedan sin tener cuenta en el sistema
 */
@Entity('invitaciones_videollamada')
export class InvitacionVideollamadaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'codigo_acceso', unique: true, length: 32 })
    codigoAcceso!: string;

    @Column({ name: 'nombre_invitado', length: 255 })
    nombreInvitado!: string;

    @Column({
        name: 'rol_invitado',
        length: 50,
        default: 'invitado',
    })
    rolInvitado!: string;

    @Column({
        name: 'fecha_hora_creacion',
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    fechaHoraCreacion!: Date;

    @Column({ name: 'fecha_hora_expiracion', type: 'timestamp' })
    fechaHoraExpiracion!: Date;

    @Column({ name: 'fecha_hora_uso', type: 'timestamp', nullable: true })
    fechaHoraUso!: Date | null;

    @Column({ name: 'activo', default: true })
    activo!: boolean;

    @Column({ name: 'usado', default: false })
    usado!: boolean;

    // Relaciones
    @ManyToOne(() => CitaEntity)
    @JoinColumn({ name: 'cita_id' })
    cita!: CitaEntity;

    @Column({ name: 'cita_id' })
    citaId!: number;

    @ManyToOne(() => PeopleEntity)
    @JoinColumn({ name: 'invitado_por_id' })
    invitadoPor!: PeopleEntity;

    @Column({ name: 'invitado_por_id' })
    invitadoPorId!: number;
}
