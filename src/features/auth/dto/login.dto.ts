import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan.perez@email.com',
        format: 'email',
    })
    @IsString()
    @IsEmail({}, { message: 'El email no es valido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email!: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'MiPassword123!',
        format: 'password',
    })
    @IsNotEmpty({ message: 'El password es requerido' })
    @IsString()
    password!: string;
}
