import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { EnfermedadesEntity } from '../enfermedades/enfermedades.entity';
import { PacientesEntity } from '../pacientes/pacientes.entity';
import { TiposEnfermedadEntity } from '../tipo-enfermedad/tipo-enfermedad.entity';

@Entity('pacientes_enfermedades')
export class PacienteEnfermedadEntity {
    @PrimaryColumn({ name: 'paciente_id' })
    pacienteId!: number;

    @PrimaryColumn({ name: 'enfermedad_id' })
    enfermedadId!: number;

    @Column('text', { nullable: true })
    detalle!: string;

    @PrimaryColumn({ name: 'tipo_enfermedad_id' })
    tipoEnfermedadId!: number;

    // Relaciones
    @ManyToOne(
        () => PacientesEntity,
        (paciente) => paciente.pacienteEnfermedades,
    )
    @JoinColumn({ name: 'paciente_id' })
    paciente!: PacientesEntity;

    @ManyToOne(
        () => EnfermedadesEntity,
        (enfermedad) => enfermedad.pacienteEnfermedades,
    )
    @JoinColumn({ name: 'enfermedad_id' })
    enfermedad!: EnfermedadesEntity;

    @ManyToOne(() => TiposEnfermedadEntity)
    @JoinColumn({ name: 'tipo_enfermedad_id' })
    tipoEnfermedad!: TiposEnfermedadEntity;
}
