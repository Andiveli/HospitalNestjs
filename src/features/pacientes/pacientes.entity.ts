import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { EstiloVidaEntity } from '../estilo-vida/estilo-vida.entity';
import { PacienteEnfermedadEntity } from '../paciente-enfermedad/paciente-enfermedad.entity';
import { PaisEntity } from '../paises/paises.entity';
import { PeopleEntity } from '../people/people.entity';
import { GrupoSanguineoEntity } from '../sangre/sangre.entity';

@Entity('pacientes')
export class PacientesEntity {
    @PrimaryGeneratedColumn({ name: 'usuario_id' })
    usuarioId!: number;

    @OneToOne(() => PeopleEntity)
    @JoinColumn({ name: 'usuario_id' })
    person!: PeopleEntity;

    @Column('date', { name: 'fecha_nacimiento' })
    fechaNacimiento!: Date;

    @ManyToOne(() => PaisEntity, { nullable: true })
    @JoinColumn({ name: 'pais_id' })
    pais!: PaisEntity | null;

    @Column('varchar', {
        length: 150,
        nullable: true,
        name: 'lugar_residencia',
    })
    lugarResidencia!: string | null;

    @Column('char', { length: 10, nullable: true, name: 'numero_celular' })
    numeroCelular!: string | null;

    @ManyToOne(() => GrupoSanguineoEntity, { nullable: true })
    @JoinColumn({ name: 'grupo_sanguineo_id' })
    grupoSanguineo!: GrupoSanguineoEntity | null;

    @ManyToOne(() => EstiloVidaEntity, { nullable: true })
    @JoinColumn({ name: 'estilo_vida_id' })
    estiloVida!: EstiloVidaEntity | null;

    @OneToMany(
        () => PacienteEnfermedadEntity,
        (pacienteEnfermedad) => pacienteEnfermedad.paciente,
    )
    pacienteEnfermedades!: PacienteEnfermedadEntity[];
}
