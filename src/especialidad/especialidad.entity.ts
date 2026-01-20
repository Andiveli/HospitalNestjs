import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { MedicoEntity } from '../medicos/medicos.entity';

/**
 * Entidad que representa una especialidad médica
 */
@Entity('especialidades')
export class EspecialidadEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ name: 'nombre', length: 100 })
    nombre!: string;

    @Column({ name: 'descripcion', length: 255, nullable: true })
    descripcion!: string;

    @ManyToMany(() => MedicoEntity, (medico) => medico.especialidades)
    @JoinTable({
        name: 'medicos_especialidades',
        joinColumn: { name: 'especialidad_id', referencedColumnName: 'id' },
        inverseJoinColumn: {
            name: 'medico_id',
            referencedColumnName: 'usuarioId',
        },
    })
    medicos!: MedicoEntity[];
}
