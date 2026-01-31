import { ApiProperty } from '@nestjs/swagger';
import { CreateMedicoResponseDto } from '../../medicos/dto/medico-response.dto';

/**
 * DTO para el perfil de paciente
 * Contiene toda la información médica y personal del paciente
 */
export class PerfilPacienteDto {
    @ApiProperty({
        description: 'Nombres completos del paciente',
        example: 'Juan Carlos Pérez González',
    })
    nombres!: string;

    @ApiProperty({
        description: 'Edad del paciente en años',
        example: 28,
    })
    edad!: number;

    @ApiProperty({
        description: 'Email del paciente',
        example: 'juan.perez@email.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Cédula del paciente (10 dígitos)',
        example: '1234567890',
    })
    cedula!: string;

    @ApiProperty({
        description: 'Teléfono de contacto',
        example: '0987654321',
    })
    telefono!: string;

    @ApiProperty({
        description: 'País de residencia',
        example: 'Ecuador',
    })
    pais!: string;

    @ApiProperty({
        description: 'Género del paciente',
        example: 'Masculino',
    })
    genero!: string;

    @ApiProperty({
        description: 'Ciudad/Provincia de residencia',
        example: 'Guayaquil',
    })
    residencia!: string;

    @ApiProperty({
        description: 'Tipo de sangre',
        example: 'O+',
    })
    sangre!: string;

    @ApiProperty({
        description: 'Estilo de vida del paciente',
        example: 'Activo',
    })
    estilo!: string;

    @ApiProperty({
        description: 'URL de la imagen de perfil (opcional)',
        example: 'https://example.com/avatar.jpg',
        required: false,
    })
    imagen?: string;

    @ApiProperty({
        description: 'Enfermedades registradas del paciente',
        example: {
            '1': 'Hipertensión',
            '2': 'Diabetes Tipo 2',
        },
        type: 'object',
        additionalProperties: {
            type: 'string',
        },
    })
    enfermedades!: Record<string, string>;
}

/**
 * DTO para el perfil de administrador
 */
export class AdminPerfilDto {
    @ApiProperty({
        description: 'Rol del administrador',
        example: 'Administrador',
    })
    rol!: string;

    @ApiProperty({
        description: 'Nivel de permisos',
        example: 'acceso_total',
    })
    permisos!: string;

    @ApiProperty({
        description: 'Panel de administración asignado',
        example: 'admin',
    })
    panel!: string;
}

/**
 * DTO para el objeto de perfiles
 * Puede contener perfiles de paciente, médico y/o administrador según los roles del usuario
 */
export class PerfilesContainerDto {
    @ApiProperty({
        description: 'Perfil del paciente (solo si tiene rol paciente)',
        type: PerfilPacienteDto,
        required: false,
    })
    paciente?: PerfilPacienteDto;

    @ApiProperty({
        description: 'Perfil del médico (solo si tiene rol médico)',
        type: CreateMedicoResponseDto,
        required: false,
    })
    medico?: CreateMedicoResponseDto;

    @ApiProperty({
        description: 'Perfil de administrador (solo si tiene rol admin)',
        type: AdminPerfilDto,
        required: false,
    })
    admin?: AdminPerfilDto;
}

/**
 * DTO para los datos del token en la respuesta de autenticación
 */
export class TokenDataDto {
    @ApiProperty({
        description: 'Token JWT para autenticación',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    token!: string;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Login exitoso',
    })
    message!: string;

    @ApiProperty({
        description: 'Datos de respuesta con el token JWT',
        type: TokenDataDto,
    })
    data!: TokenDataDto;
}

export class MensajeResponseDto {
    @ApiProperty({
        description: 'Mensaje de respuesta',
        example: 'Acción ejecutada con exito',
    })
    message!: string;
}

/**
 * DTO para la respuesta del endpoint /auth/perfil
 * Retorna información del usuario y sus perfiles según sus roles
 */
export class PerfilResponseDto {
    @ApiProperty({
        description: 'ID del usuario',
        example: 1,
    })
    userId!: number;

    @ApiProperty({
        description: 'Email del usuario',
        example: 'juan.perez@email.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Roles asignados al usuario',
        example: ['paciente', 'medico'],
        type: [String],
    })
    roles!: string[];

    @ApiProperty({
        description:
            'Objeto contenedor con los perfiles del usuario según sus roles',
        type: PerfilesContainerDto,
        example: {
            paciente: {
                nombres: 'Juan Carlos Pérez González',
                edad: 28,
                email: 'juan.perez@email.com',
                cedula: '1234567890',
                telefono: '0987654321',
                pais: 'Ecuador',
                genero: 'Masculino',
                residencia: 'Guayaquil',
                sangre: 'O+',
                estilo: 'Activo',
                imagen: 'https://example.com/avatar.jpg',
                enfermedades: {
                    '1': 'Hipertensión',
                    '2': 'Diabetes Tipo 2',
                },
            },
            medico: {
                message: 'Médico encontrado',
                data: {
                    nombreCompleto: 'Dr. Juan Pérez',
                    email: 'juan.perez@email.com',
                    cedula: '1234567890',
                    licenciaMedica: 'MED-123456',
                    pasaporte: 'ABC123456',
                    especialidades: [
                        {
                            nombre: 'Cardiología',
                            descripcion:
                                'Especialista en enfermedades del corazón',
                            principal: true,
                        },
                    ],
                    horarios: [
                        {
                            dia: 'Lunes',
                            horaInicio: '08:00:00',
                            horaFin: '16:00:00',
                        },
                    ],
                    citasAtendidas: 42,
                },
            },
        },
    })
    perfiles!: PerfilesContainerDto;
}

/**
 * DTO para la respuesta completa del endpoint GET /auth/perfil
 * Incluye mensaje y los datos del perfil
 */
export class PerfilCompletoResponseDto {
    @ApiProperty({
        description: 'Mensaje de éxito',
        example: 'Perfil obtenido correctamente',
    })
    message!: string;

    @ApiProperty({
        description:
            'Datos del perfil del usuario con todos sus roles y perfiles asociados',
        type: PerfilResponseDto,
    })
    data!: PerfilResponseDto;
}
