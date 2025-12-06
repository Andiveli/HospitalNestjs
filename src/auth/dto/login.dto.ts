import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @IsString()
    @IsEmail({}, { message: 'El email no es valido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsNotEmpty({ message: 'El password es requerido' })
    @IsString()
    password: string;
}
