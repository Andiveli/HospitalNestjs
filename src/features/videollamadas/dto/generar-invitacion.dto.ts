import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GenerarInvitacionDto {
    @ApiProperty({
        description: 'Nombre completo del invitado',
        example: 'María García',
    })
    @IsString()
    @IsNotEmpty()
    nombreInvitado!: string;

    @ApiProperty({
        description: 'Rol del invitado en la sesión',
        example: 'acompanante',
        default: 'invitado',
        required: false,
    })
    @IsString()
    @IsOptional()
    rolInvitado?: string;
}
