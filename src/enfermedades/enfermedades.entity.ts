import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PacienteEnfermedadEntity } from 'src/paciente-enfermedad/paciente-enfermedad.entity';

@Entity('enfermedades')
export class EnfermedadesEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('varchar', { length: 150, name: 'nombre' })
    nombre: string;

    @Column('varchar', { length: 255, nullable: true, name: 'descripcion' })
    descripcion: string;

    @OneToMany(
        () => PacienteEnfermedadEntity,
        (pacienteEnfermedad) => pacienteEnfermedad.enfermedad,
    )
    pacienteEnfermedades: PacienteEnfermedadEntity[];
}
