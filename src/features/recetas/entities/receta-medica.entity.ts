import {
    Entity,
    PrimaryColumn,
    Column,
    OneToOne,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { RegistroAtencionEntity } from '../../citas/entities/registro-atencion.entity';
import { MedicoEntity } from '../../medicos/medicos.entity';
import { RecetaMedicamentoEntity } from './receta-medicamento.entity';

@Entity('recetas_medicas')
export class RecetaMedicaEntity {
    @PrimaryColumn({ name: 'registro_atencion_id' })
    registroAtencionId!: number;

    @Column({
        name: 'fecha_hora_creacion',
        type: 'timestamp',
    })
    fechaHoraCreacion!: Date;

    @Column({ name: 'medico_id' })
    medicoId!: number;

    @Column({ type: 'text', nullable: true })
    observaciones?: string;

    @OneToOne(() => RegistroAtencionEntity, (registro) => registro.cita, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'registro_atencion_id' })
    registroAtencion!: RegistroAtencionEntity;

    @ManyToOne(() => MedicoEntity, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;

    @OneToMany(
        () => RecetaMedicamentoEntity,
        (recetaMedicamento: RecetaMedicamentoEntity) =>
            recetaMedicamento.receta,
        { cascade: true },
    )
    medicamentos?: RecetaMedicamentoEntity[];
}
