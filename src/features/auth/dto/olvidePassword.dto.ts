import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para solicitud de recuperación de contraseña
 * Requiere el email del usuario para enviar instrucciones de recuperación
 */
export class OlvidePasswordDto {
    @ApiProperty({
        description:
            'Email del usuario que solicita recuperación de contraseña',
        example: 'juan.perez@email.com',
        format: 'email',
    })
    @IsString()
    @IsEmail({}, { message: 'El email no es valido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email!: string;
}
