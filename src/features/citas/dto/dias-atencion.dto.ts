import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta con los días de atención del médico
 */
export class DiasAtencionResponseDto {
    @ApiProperty({
        example: ['Lunes', 'Miércoles', 'Viernes'],
        description: 'Lista de días de la semana en que el médico atiende',
        type: [String],
    })
    diasAtencion!: string[];
}
