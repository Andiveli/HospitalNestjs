import { PartialType } from '@nestjs/swagger';
import { CreateTipoEnfermedadDto } from './create-tipo-enfermedad.dto';

/**
 * DTO para actualizar un tipo de enfermedad existente
 * Todos los campos son opcionales
 */
export class UpdateTipoEnfermedadDto extends PartialType(
    CreateTipoEnfermedadDto,
) {}
