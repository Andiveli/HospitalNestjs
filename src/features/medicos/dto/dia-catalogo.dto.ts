import { ApiProperty } from '@nestjs/swagger';

export class DiaCatalogoDto {
    @ApiProperty({ description: 'ID del día' })
    id!: number;

    @ApiProperty({ description: 'Nombre del día' })
    nombre!: string;
}
