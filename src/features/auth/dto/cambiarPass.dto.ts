import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para cambio de contraseña de usuario autenticado
 * Requiere contraseña actual y nueva contraseña con confirmación
 */
export class CambiarPassDto {
    @ApiProperty({
        description: 'Contraseña actual del usuario',
        example: 'MiPassword123!',
        format: 'password',
    })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    passwordActual!: string;

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
    newPassword!: string;

    @ApiProperty({
        description: 'Confirmación de la nueva contraseña',
        example: 'NuevoPassword456!',
        format: 'password',
    })
    @IsString()
    @IsNotEmpty({
        message: 'La confirmación de la nueva contraseña es requerida',
    })
    confirmNewPass!: string;
}
