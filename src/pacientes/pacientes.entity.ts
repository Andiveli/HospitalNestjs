import { EstiloVidaEntity } from 'src/estilo-vida/estilo-vida.entity';
import { PaisEntity } from 'src/paises/paises.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { GrupoSanguineoEntity } from 'src/sangre/sangre.entity';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('pacientes')
export class PacientesEntity {
    @PrimaryGeneratedColumn({ name: 'usuario_id' })
    usuarioId: number;

    @OneToOne(() => PeopleEntity)
    @JoinColumn({ name: 'usuario_id' })
    person: PeopleEntity;

    @Column('date', { name: 'fecha_nacimiento' })
    fechaNacimiento: Date;

    @ManyToOne(() => PaisEntity, { nullable: false })
    @JoinColumn({ name: 'pais_id' })
    pais: PaisEntity;

    @Column('varchar', {
        length: 150,
        nullable: true,
        name: 'lugar_residencia',
    })
    lugarResidencia: string;

    @Column('char', { length: 10, nullable: true, name: 'numero_celular' })
    numeroCelular: string;

    @ManyToOne(() => GrupoSanguineoEntity, { nullable: false })
    @JoinColumn({ name: 'grupo_sanguineo_id' })
    grupoSanguineo: GrupoSanguineoEntity;

    @ManyToOne(() => EstiloVidaEntity, { nullable: false })
    @JoinColumn({ name: 'estilo_vida_id' })
    estiloVida: EstiloVidaEntity;
}
