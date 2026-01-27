import { IsString, IsNotEmpty } from 'class-validator';

export class EnfermedadDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre no debe estar vacío' })
    nombre!: string;

    @IsString()
    @IsNotEmpty({ message: 'La descripción no debe estar vacía' })
    descripcion!: string;
}
