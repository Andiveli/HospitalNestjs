import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para forwarding de tokens de verificación
 * Utilizado para redireccionar con token de confirmación
 */
export class ForwardDto {
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
        description: 'Token de verificación o confirmación',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @IsString()
    @IsNotEmpty({ message: 'El token es requerido' })
    token!: string;
}
