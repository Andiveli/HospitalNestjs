import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { RecetaMedicaEntity } from './receta-medica.entity';
import { MedicamentoEntity } from './medicamento.entity';
import { ViaAdministracionEntity } from './via-administracion.entity';
import { UnidadMedidaEntity } from './unidad-medida.entity';

@Entity('recetas_medicamentos')
export class RecetaMedicamentoEntity {
    @PrimaryColumn({ name: 'receta_id' })
    recetaId!: number;

    @PrimaryColumn({ name: 'medicamento_id' })
    medicamentoId!: number;

    @Column({ length: 100 })
    duracion!: string;

    @Column({ length: 100 })
    frecuencia!: string;

    @Column()
    cantidad!: number;

    @Column({ name: 'via_administracion_id' })
    viaAdministracionId!: number;

    @Column({ name: 'unidad_medida_id' })
    unidadMedidaId!: number;

    @Column({ length: 255, nullable: true })
    indicaciones?: string;

    @ManyToOne(() => RecetaMedicaEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receta_id' })
    receta!: RecetaMedicaEntity;

    @ManyToOne(() => MedicamentoEntity, { nullable: false })
    @JoinColumn({ name: 'medicamento_id' })
    medicamento!: MedicamentoEntity;

    @ManyToOne(() => ViaAdministracionEntity, { nullable: false })
    @JoinColumn({ name: 'via_administracion_id' })
    viaAdministracion!: ViaAdministracionEntity;

    @ManyToOne(() => UnidadMedidaEntity, { nullable: false })
    @JoinColumn({ name: 'unidad_medida_id' })
    unidadMedida!: UnidadMedidaEntity;
}
