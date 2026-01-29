import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para validación de código de invitación
 */
export class ValidarCodigoResponseDto {
    @ApiProperty({
        description: 'Indica si el código es válido',
        example: true,
    })
    valido!: boolean;

    @ApiProperty({
        description: 'ID de la cita asociada',
        example: 123,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Nombre de la sesión de videollamada',
        example: 'Consulta - Dr. Juan Pérez / María García',
    })
    nombreSesion!: string;

    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Dr. Juan Pérez',
    })
    nombreMedico!: string;

    @ApiProperty({
        description: 'Nombre completo del paciente',
        example: 'María García',
    })
    nombrePaciente!: string;

    @ApiProperty({
        description: 'Fecha y hora de inicio de la cita',
        example: '2024-01-15T14:30:00Z',
    })
    fechaHoraInicio!: Date;

    @ApiProperty({
        description: 'Nombre del invitado',
        example: 'Carlos Rodríguez',
    })
    nombreInvitado!: string;

    @ApiProperty({
        description: 'Rol del invitado en la sesión',
        example: 'acompanante',
    })
    rolInvitado!: string;
}
