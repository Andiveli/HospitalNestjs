import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PacienteEnfermedadEntity } from '../paciente-enfermedad/paciente-enfermedad.entity';

/**
 * Entidad para el catálogo de enfermedades médicas
 * Almacena las enfermedades que pueden ser asignadas a pacientes
 * como antecedentes, alergias, condiciones crónicas, etc.
 */
@Entity('enfermedades')
export class EnfermedadesEntity {
    /** ID único autogenerado */
    @PrimaryGeneratedColumn()
    id!: number;

    /** Nombre de la enfermedad - debe ser único */
    @Column('varchar', { length: 150, name: 'nombre' })
    nombre!: string;

    /** Descripción detallada de la enfermedad - opcional */
    @Column('varchar', { length: 255, nullable: true, name: 'descripcion' })
    descripcion!: string | null;

    /** Relación con pacientes que tienen esta enfermedad */
    @OneToMany(
        () => PacienteEnfermedadEntity,
        (pacienteEnfermedad) => pacienteEnfermedad.enfermedad,
    )
    pacienteEnfermedades!: PacienteEnfermedadEntity[];
}
