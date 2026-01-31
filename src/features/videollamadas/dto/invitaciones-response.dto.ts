import { ApiProperty } from '@nestjs/swagger';

/**
 * Datos del link de invitación generado
 */
export class LinkInvitacionDataDto {
    @ApiProperty({
        description: 'URL completa para compartir con el invitado',
        example: 'http://localhost:3000/videollamada/invitado/ABC123XY',
    })
    linkInvitacion!: string;

    @ApiProperty({
        description: 'Código de acceso único (8 caracteres alfanuméricos)',
        example: 'ABC123XY',
    })
    codigoAcceso!: string;

    @ApiProperty({
        description: 'Tiempo de validez del link',
        example: '24 horas',
    })
    expiraEn!: string;
}

/**
 * DTO de respuesta para generar link de invitación para videollamada
 */
export class GenerarLinkInvitadoResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Link de invitación generado exitosamente',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos del link generado',
    })
    data!: LinkInvitacionDataDto;
}

/**
 * Datos de la sesión para invitado validado
 */
export class ValidacionInvitadoDataDto {
    @ApiProperty({
        description: 'Siempre true en respuesta exitosa',
        example: true,
    })
    valido!: boolean;

    @ApiProperty({
        description: 'ID de la cita',
        example: 123,
    })
    citaId!: number;

    @ApiProperty({
        description: 'Nombre generado de la sesión',
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
        format: 'date-time',
    })
    fechaHoraInicio!: Date;

    @ApiProperty({
        description: 'Nombre del invitado que accede',
        example: 'Carlos Rodríguez',
    })
    nombreInvitado!: string;

    @ApiProperty({
        description: 'Rol del invitado en la sesión',
        example: 'acompanante',
    })
    rolInvitado!: string;
}

/**
 * DTO de respuesta para validar código de invitación
 */
export class ValidarCodigoInvitadoResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Código válido',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de la sesión validada',
    })
    data!: ValidacionInvitadoDataDto;
}
