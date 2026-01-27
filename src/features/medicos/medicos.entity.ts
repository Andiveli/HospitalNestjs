import { EspecialidadEntity } from 'src/features/especialidad/especialidad.entity';
import { MedicoEspecialidadEntity } from '../especialidad/medico-especialidad.entity';
import { ExcepcionHorarioEntity } from '../horario/excepcion-horario.entity';
import { HorarioMedicoEntity } from '../horario/horario-medico.entity';
import { PeopleEntity } from '../people/people.entity';
import {
    Column,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity('medicos')
export class MedicoEntity {
    @PrimaryColumn({ name: 'usuario_id' })
    usuarioId!: number;

    @Column('varchar', {
        name: 'pasaporte',
        unique: true,
        length: 15,
        nullable: true,
    })
    pasaporte!: string | null;

    @Column({ name: 'licencia_medica', length: 50, nullable: true })
    licenciaMedica!: string;

    @OneToOne(() => PeopleEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'usuario_id', referencedColumnName: 'id' })
    persona!: PeopleEntity;

    @ManyToMany(
        () => EspecialidadEntity,
        (especialidad) => especialidad.medicos,
        { cascade: true },
    )
    @JoinTable({
        name: 'medicos_especialidades',
        joinColumn: { name: 'medico_id', referencedColumnName: 'usuarioId' },
        inverseJoinColumn: {
            name: 'especialidad_id',
            referencedColumnName: 'id',
        },
    })
    especialidades!: EspecialidadEntity[];

    @OneToMany(
        () => MedicoEspecialidadEntity,
        (medicoEspecialidad) => medicoEspecialidad.medico,
    )
    medicoEspecialidades!: MedicoEspecialidadEntity[];

    @OneToMany(() => HorarioMedicoEntity, (horario) => horario.medico)
    horarios!: HorarioMedicoEntity[];

    @OneToMany(() => ExcepcionHorarioEntity, (excepcion) => excepcion.medico)
    excepcionesHorario!: ExcepcionHorarioEntity[];
}
