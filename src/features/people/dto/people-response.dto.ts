import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para información básica de género en respuestas
 */
export class GeneroInfoDto {
    @ApiProperty({ description: 'ID del género', example: 1 })
    id!: number;

    @ApiProperty({ description: 'Nombre del género', example: 'Femenino' })
    nombre!: string;
}

/**
 * DTO para información de estado de usuario
 */
export class EstadoInfoDto {
    @ApiProperty({ description: 'ID del estado', example: 1 })
    id!: number;

    @ApiProperty({ description: 'Nombre del estado', example: 'Activo' })
    nombre!: string;
}

/**
 * DTO para información de rol
 */
export class RolInfoDto {
    @ApiProperty({ description: 'ID del rol', example: 2 })
    id!: number;

    @ApiProperty({ description: 'Nombre del rol', example: 'medico' })
    nombre!: string;

    @ApiPropertyOptional({
        description: 'Descripción del rol',
        example: 'Médico del sistema',
    })
    descripcion?: string;
}

/**
 * DTO para usuario en listados
 */
export class UsuarioResponseDto {
    @ApiProperty({ description: 'ID del usuario', example: 1 })
    id!: number;

    @ApiProperty({ description: 'Cédula de identidad', example: '12345678' })
    cedula!: string;

    @ApiProperty({ description: 'Primer nombre', example: 'Juan' })
    primerNombre!: string;

    @ApiPropertyOptional({ description: 'Segundo nombre', example: 'Carlos' })
    segundoNombre?: string;

    @ApiProperty({ description: 'Primer apellido', example: 'Pérez' })
    primerApellido!: string;

    @ApiPropertyOptional({ description: 'Segundo apellido', example: 'García' })
    segundoApellido?: string;

    @ApiProperty({
        description: 'Correo electrónico',
        example: 'juan.perez@email.com',
    })
    email!: string;

    @ApiProperty({
        description: 'Indica si el usuario está verificado',
        example: true,
    })
    verificado!: boolean;

    @ApiProperty({
        description: 'Fecha de creación del usuario',
        type: 'string',
        format: 'date-time',
    })
    fechaCreacion!: Date;

    @ApiPropertyOptional({
        description: 'URL de la imagen de perfil',
        example: 'https://cdn.example.com/avatar.jpg',
    })
    imageUrl?: string;

    @ApiPropertyOptional({
        type: GeneroInfoDto,
        description: 'Información del género',
    })
    genero?: GeneroInfoDto;

    @ApiPropertyOptional({
        type: EstadoInfoDto,
        description: 'Información del estado',
    })
    estado?: EstadoInfoDto;

    @ApiProperty({
        type: [RolInfoDto],
        description: 'Roles asignados al usuario',
    })
    roles!: RolInfoDto[];
}

/**
 * DTO para respuesta de creación de médico/paciente
 */
export class UsuarioCreadoResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Médico creado exitosamente',
    })
    msg!: string;
}

/**
 * DTO para respuesta de lista vacía
 */
export class ListaVaciaResponseDto {
    @ApiProperty({
        description: 'Mensaje indicando que la lista está vacía',
        example: 'La lista de médicos está vacía',
    })
    msg!: string;
}

/**
 * DTO para estadísticas de usuarios
 */
export class StatsResponseDto {
    @ApiProperty({ description: 'Número total de médicos', example: 15 })
    totalMedicos!: number;

    @ApiProperty({ description: 'Número total de pacientes', example: 150 })
    totalPacientes!: number;
}

/**
 * DTO para respuesta de estadísticas
 */
export class StatsApiResponseDto {
    @ApiProperty({
        description: 'Mensaje de confirmación',
        example: 'Estadísticas obtenidas exitosamente',
    })
    message!: string;

    @ApiProperty({
        type: StatsResponseDto,
        description: 'Datos de estadísticas',
    })
    data!: StatsResponseDto;
}
