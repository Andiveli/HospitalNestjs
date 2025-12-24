import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para registro de nuevos usuarios
 * Contiene toda la información necesaria para crear una cuenta de usuario
 */
export class SingupDto {
    @ApiProperty({
        description: 'Cédula del usuario (10 dígitos numéricos)',
        example: '1234567890',
        pattern: '^[0-9]{10}$',
    })
    @IsString()
    @IsNotEmpty({ message: 'La cédula es requerida' })
    @Matches(/^[0-9]{10}$/, {
        message: 'La cédula debe tener 10 dígitos numéricos',
    })
    cedula: string;

    @ApiProperty({
        description: 'Primer nombre del usuario',
        example: 'Juan',
    })
    @IsString()
    @IsNotEmpty({ message: 'El primer nombre es requerido' })
    primerNombre: string;

    @ApiProperty({
        description: 'Segundo nombre del usuario (opcional)',
        example: 'Carlos',
        required: false,
    })
    @IsString()
    segundoNombre?: string;

    @ApiProperty({
        description: 'Primer apellido del usuario',
        example: 'Pérez',
    })
    @IsString()
    @IsNotEmpty({ message: 'El primer apellido es requerido' })
    primerApellido: string;

    @ApiProperty({
        description: 'Segundo apellido del usuario (opcional)',
        example: 'González',
        required: false,
    })
    @IsString()
    segundoApellido?: string;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan.perez@email.com',
        format: 'email',
    })
    @IsString()
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email no es valido' })
    email: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'MiPassword123!',
        minLength: 8,
        format: 'password',
    })
    @IsString()
    @IsNotEmpty({ message: 'El password es requerido' })
    passwordHash: string;

    @ApiProperty({
        description: 'Confirmación de la contraseña',
        example: 'MiPassword123!',
        format: 'password',
    })
    @IsString()
    @IsNotEmpty({ message: 'Debes comprobar tu password' })
    confirmPassword: string;

    @ApiProperty({
        description: 'ID del género (1: Masculino, 2: Femenino, 3: Otro)',
        example: 1,
        enum: [1, 2, 3],
    })
    @IsNumber()
    @IsNotEmpty({ message: 'Tu género es requerido' })
    genero: number;
}
