import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SingupDto {
    @IsString()
    @IsNotEmpty({ message: 'La cédula es requerida' })
    cedula: string;

    @IsString()
    @IsNotEmpty({ message: 'El primer nombre es requerido' })
    primerNombre: string;

    @IsString()
    segundoNombre?: string;

    @IsString()
    @IsNotEmpty({ message: 'El primer apellido es requerido' })
    primerApellido: string;

    @IsString()
    segundoApellido?: string;

    @IsString()
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email no es valido' })
    email: string;

    @IsString()
    @IsNotEmpty({ message: 'El password es requerido' })
    passwordHash: string;

    @IsString()
    @IsNotEmpty({ message: 'Debes comprobar tu password' })
    confirmPassword: string;
}
