import { ApiProperty } from '@nestjs/swagger';

export class EspecialidadCatalogoDto {
    @ApiProperty({ description: 'ID de la especialidad' })
    id!: number;

    @ApiProperty({ description: 'Nombre de la especialidad' })
    nombre!: string;

    @ApiProperty({
        description: 'Descripción de la especialidad',
        required: false,
    })
    descripcion?: string;
}
