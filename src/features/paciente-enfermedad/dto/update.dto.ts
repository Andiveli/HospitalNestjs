import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePacienteEnfermedadDto } from './create.dto';

/**
 * DTO para actualizar una relación paciente-enfermedad
 * Permite actualizar solo el detalle (los IDs son clave primaria compuesta)
 */
export class UpdatePacienteEnfermedadDto extends PartialType(
    CreatePacienteEnfermedadDto,
) {
    @ApiProperty({
        description: 'Nuevo detalle sobre la enfermedad del paciente',
        example: 'Actualización: Se agregó nueva medicación',
        required: false,
    })
    detalle?: string;
}
