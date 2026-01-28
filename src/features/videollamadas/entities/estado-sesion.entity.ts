import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { SesionConsultaEntity } from './sesion-consulta.entity';

@Entity('estados_sesion')
export class EstadoSesionEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column('varchar', { length: 150, name: 'nombre' })
    nombre!: string;

    @OneToMany(() => SesionConsultaEntity, (sesion) => sesion.estado)
    sesiones!: SesionConsultaEntity[];
}
