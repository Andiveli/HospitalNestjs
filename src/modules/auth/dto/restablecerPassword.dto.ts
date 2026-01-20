import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO para restablecimiento de contraseña con token
 * Requiere nueva contraseña y su confirmación cuando se usa token válido
 */
export class RestablecerPasswordDto {
    @ApiProperty({
        description: 'Nueva contraseña del usuario',
        example: 'NuevoPassword456!',
        format: 'password',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    password!: string;

    @ApiProperty({
        description: 'Confirmación de la nueva contraseña',
        example: 'NuevoPassword456!',
        format: 'password',
    })
    @IsString()
    @IsNotEmpty({ message: 'La confirmación de contraseña es requerida' })
    confirmPassword!: string;
}
