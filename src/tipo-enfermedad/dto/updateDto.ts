import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre: string;
}
