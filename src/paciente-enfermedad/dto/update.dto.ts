import { PartialType } from '@nestjs/swagger';
import { CreatePacienteEnfermedadDto } from './create.dto';

export class UpdatePacienteEnfermedadDto extends PartialType(
    CreatePacienteEnfermedadDto,
) {}
