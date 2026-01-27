import { IsNotEmpty, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConsultarDisponibilidadDto {
    @ApiProperty({
        description: 'ID del médico para consultar disponibilidad',
        example: 1,
    })
    @IsNotEmpty()
    @IsInt()
    @Min(1)
    medicoId!: number;

    @ApiProperty({
        description: 'Fecha desde la cual buscar disponibilidad (YYYY-MM-DD)',
        example: '2024-01-15',
    })
    @IsNotEmpty()
    fechaInicio!: string;

    @ApiProperty({
        description: 'Fecha hasta la cual buscar disponibilidad (YYYY-MM-DD)',
        example: '2024-01-30',
    })
    @IsNotEmpty()
    fechaFin!: string;
}
