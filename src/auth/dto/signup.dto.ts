import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SingupDto {
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre: string;

    @IsString()
    @IsNotEmpty({ message: 'El apellido es requerido' })
    apellido: string;

    @IsString()
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email no es valido' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'El password es requerido' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'Debes comprobar tu password' })
    confirmPassword: string;
}
