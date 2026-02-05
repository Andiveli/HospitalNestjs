import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('paises')
export class PaisEntity {
    @ApiProperty({ description: 'ID único del país', example: 1 })
    @PrimaryGeneratedColumn()
    id!: number;

    @ApiProperty({
        description: 'Nombre del país',
        example: 'Argentina',
        maxLength: 100,
    })
    @Column('varchar', { length: 100, name: 'nombre' })
    nombre!: string;
}
