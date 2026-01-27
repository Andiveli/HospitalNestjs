import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para representar una especialidad del médico
 */
export class EspecialidadMedicoDto {
    @ApiProperty({ example: 1, description: 'ID de la especialidad' })
    id!: number;

    @ApiProperty({
        example: 'Cardiología',
        description: 'Nombre de la especialidad',
    })
    nombre!: string;
}

/**
 * DTO de respuesta para listar médicos disponibles
 */
export class MedicoDisponibleDto {
    @ApiProperty({ example: 5, description: 'ID del médico (usuario_id)' })
    id!: number;

    @ApiProperty({ example: 'Juan', description: 'Primer nombre del médico' })
    nombre!: string;

    @ApiProperty({
        example: 'Pérez',
        description: 'Primer apellido del médico',
    })
    apellido!: string;

    @ApiProperty({
        type: [EspecialidadMedicoDto],
        description: 'Lista de especialidades del médico',
    })
    especialidades!: EspecialidadMedicoDto[];
}
