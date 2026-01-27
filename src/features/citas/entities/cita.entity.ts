import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToOne,
} from 'typeorm';
import { PacientesEntity } from '../../pacientes/pacientes.entity';
import { MedicoEntity } from '../../medicos/medicos.entity';
import { EstadoCitaEntity } from './estado-cita.entity';
import { RegistroAtencionEntity } from './registro-atencion.entity';

@Entity('citas')
export class CitaEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        name: 'fecha_hora_creacion',
        type: 'timestamp',
    })
    fechaHoraCreacion!: Date;

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

    @Column({
        type: 'boolean',
        default: false,
    })
    telefonica!: boolean;

    @ManyToOne(() => EstadoCitaEntity, (estado) => estado.citas, {
        nullable: false,
    })
    @JoinColumn({ name: 'estado_id' })
    estado!: EstadoCitaEntity;

    @ManyToOne(() => PacientesEntity, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'paciente_id' })
    paciente!: PacientesEntity;

    @ManyToOne(() => MedicoEntity, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;

    @OneToOne(() => RegistroAtencionEntity, (registro) => registro.cita, {
        cascade: true,
    })
    registroAtencion?: RegistroAtencionEntity;
}
