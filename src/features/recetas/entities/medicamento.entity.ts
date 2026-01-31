import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { PresentacionMedicamentoEntity } from './presentacion-medicamento.entity';

@Entity('medicamentos')
export class MedicamentoEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 150 })
    nombre!: string;

    @Column({ name: 'principio_activo', length: 150 })
    principioActivo!: string;

    @Column({ length: 100, nullable: true })
    concentracion?: string;

    @Column({ name: 'presentacion_id' })
    presentacionId!: number;

    @ManyToOne(() => PresentacionMedicamentoEntity, { nullable: false })
    @JoinColumn({ name: 'presentacion_id' })
    presentacion!: PresentacionMedicamentoEntity;
}
