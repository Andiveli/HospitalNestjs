import { IsString, IsNotEmpty } from 'class-validator';

export class DocsDto {
    @IsString()
    @IsNotEmpty({ message: 'El ID del paciente es requerido' })
    titulo!: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripcion del documento es requerida' })
    documento!: string;
}
