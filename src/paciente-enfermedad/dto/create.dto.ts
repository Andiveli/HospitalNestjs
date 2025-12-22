import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';

export class CreatePacienteEnfermedadDto {
    @IsInt()
    @Min(1)
    pacienteId: number;

    @IsInt()
    @Min(1)
    enfermedadId: number;

    @IsString()
    @IsOptional()
    @MaxLength(1000)
    detalle?: string;

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    tipoEnfermedadId: number;
}
