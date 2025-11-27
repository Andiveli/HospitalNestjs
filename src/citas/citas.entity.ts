import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('citas')
export class CitasEntity {
    @PrimaryGeneratedColumn()
    id: number;
}
