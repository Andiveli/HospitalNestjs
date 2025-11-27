import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CrearDto {
    @IsString()
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email no es valido' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'El rol es requerido' })
    rol: string;
}
