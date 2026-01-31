import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('presentaciones_medicamento')
export class PresentacionMedicamentoEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    nombre!: string;
}
