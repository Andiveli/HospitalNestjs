import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * DTO para restablecimiento de contraseña con token
 * Requiere nueva contraseña y su confirmación cuando se usa token válido
 */
export class RestablecerPasswordDto {
    @ApiProperty({
        description:
            'Nueva contraseña del usuario (mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial)',
        example: 'NuevoPassword456!',
        format: 'password',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        {
            message:
                'La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y carácter especial (@$!%*?&)',
        },
    )
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
