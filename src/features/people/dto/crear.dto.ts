import { IsEmail, IsNotEmpty, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CrearDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'juan.perez@email.com',
        format: 'email',
    })
    @IsString()
    @IsNotEmpty({ message: 'El email es requerido' })
    @IsEmail({}, { message: 'El email no es valido' })
    email!: string;

    @ApiProperty({
        description: 'Roles a asignar al usuario',
        example: ['medico'],
        type: [String],
    })
    @IsArray()
    @IsNotEmpty({ message: 'El rol es requerido' })
    rol!: string[];
}
