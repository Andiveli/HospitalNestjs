import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { MedicoEntity } from '../medicos/medicos.entity';
import { EspecialidadEntity } from './especialidad.entity';

@Entity('medicos_especialidades')
export class MedicoEspecialidadEntity {
    @PrimaryColumn({ name: 'medico_id' })
    medicoId!: number;

    @PrimaryColumn({ name: 'especialidad_id' })
    especialidadId!: number;

    @Column({ name: 'principal', type: 'boolean', default: false })
    principal!: boolean;

    @ManyToOne(() => MedicoEntity)
    @JoinColumn({ name: 'medico_id', referencedColumnName: 'usuarioId' })
    medico!: MedicoEntity;

    @ManyToOne(() => EspecialidadEntity)
    @JoinColumn({ name: 'especialidad_id', referencedColumnName: 'id' })
    especialidad!: EspecialidadEntity;
}
