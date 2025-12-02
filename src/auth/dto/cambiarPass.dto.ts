import { IsString, IsNotEmpty } from 'class-validator';

export class CambiarPassDto {
    @IsString()
    @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    passwordActual: string;

    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    newPassword: string;

    @IsString()
    @IsNotEmpty({
        message: 'La confirmación de la nueva contraseña es requerida',
    })
    confirmNewPass: string;
}
