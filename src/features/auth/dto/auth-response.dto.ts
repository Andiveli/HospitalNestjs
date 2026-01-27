import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Login exitoso',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de respuesta',
        example: { token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
    })
    data!: { token: string };
}

export class MensajeResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Acción ejecutada con exito',
    })
    message!: string;
}

export class PerfilResponseDto {
    @ApiProperty({
        description: 'ID del usuario',
        example: 1,
    })
    id!: number;

    @ApiProperty({
        description: 'Cédula del usuario',
        example: '1234567890',
    })
    cedula!: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Carlos Pérez González',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan.perez@email.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Indica si el usuario está verificado',
        example: true,
    })
    verificado!: boolean;

    @ApiProperty({
        description: 'Género del usuario',
        example: 'Masculino',
    })
    genero!: string;

    @ApiProperty({
        description: 'Fecha de creación del usuario',
        example: '2023-01-15T10:30:00Z',
    })
    createdAt!: Date;
}
