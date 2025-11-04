import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForwardDto {
    @IsString()
    @IsEmail({}, {message: 'El email no es valido'})
    @IsNotEmpty({message: 'El email es requerido'})
    email: string;
    token: string;
}