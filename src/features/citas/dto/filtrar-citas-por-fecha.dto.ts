import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para filtrar citas por fecha
 */
export class FiltrarCitasPorFechaDto {
    @ApiProperty({
        description: 'Fecha para filtrar citas (formato YYYY-MM-DD)',
        example: '2026-02-15',
        format: 'date',
    })
    @IsString()
    @IsNotEmpty({ message: 'La fecha es requerida' })
    @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
    fecha!: string;
}
