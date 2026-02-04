import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    ManyToMany,
    JoinTable,
    CreateDateColumn,
} from 'typeorm';
import { CentroSaludEntity } from './centro-salud.entity';
import { ServicioReferidoEntity } from './servicio-referido.entity';
import { MedicoEntity } from '../../medicos/medicos.entity';
import { CitaEntity } from '../../citas/entities/cita.entity';

@Entity('derivaciones')
export class DerivacionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'registro_atencion_id', nullable: true })
    registroAtencionId?: number;

    @ManyToOne(() => CitaEntity, { nullable: true })
    @JoinColumn({ name: 'registro_atencion_id' })
    cita?: CitaEntity;

    @Column({ name: 'motivo', length: 255 })
    motivo!: string;

    @CreateDateColumn({ name: 'fecha_hora_creacion' })
    fechaHoraCreacion!: Date;

    @Column({ name: 'medico_id' })
    medicoId!: number;

    @ManyToOne(() => MedicoEntity)
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;

    @Column({ name: 'centro_id', nullable: true })
    centroId?: number;

    @ManyToOne(() => CentroSaludEntity, { nullable: true })
    @JoinColumn({ name: 'centro_id' })
    centro?: CentroSaludEntity;

    @ManyToMany(() => ServicioReferidoEntity)
    @JoinTable({
        name: 'derivaciones_servicios',
        joinColumn: { name: 'derivacion_id' },
        inverseJoinColumn: { name: 'servicio_id' },
    })
    servicios!: ServicioReferidoEntity[];
}
