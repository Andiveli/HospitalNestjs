import { ApiProperty } from '@nestjs/swagger';

export class MedicoResponseDto {
    @ApiProperty({
        description: 'Nombre completo del médico',
        example: 'Juan Pérez',
    })
    nombreCompleto!: string;

    @ApiProperty({
        description: 'Email del médico',
        example: 'juan@correo.com',
    })
    email!: string;

    // @ApiProperty({ description: 'Edad del médico' })
    // edad!: number;
    //

    @ApiProperty({ description: 'Cédula del médico', example: '1234567890' })
    cedula!: string;

    @ApiProperty({ description: 'Licencia médica', example: 'MED-123456' })
    licenciaMedica!: string;

    @ApiProperty({ description: 'Pasaporte (opcional)' })
    pasaporte?: string;

    @ApiProperty({
        description: 'Especialidades del médico',
        example: [
            {
                nombre: 'Cardiología',
                principal: true,
            },
        ],
    })
    especialidades!: EspecialidadResponseDto[];

    @ApiProperty({
        description: 'Horarios de atención',
        example: [
            {
                dia: 'Lunes',
                horaInicio: '08:00:00',
                horaFin: '16:00:00',
            },
        ],
    })
    horarios!: HorarioResponseDto[];

    @ApiProperty({
        description: 'Cantidad de citas atendidas por el médico',
        example: 42,
    })
    citasAtendidas!: number;
}

export class EspecialidadResponseDto {
    @ApiProperty({ description: 'Nombre de la especialidad' })
    nombre!: string;

    @ApiProperty({ description: 'Descripción de la especialidad' })
    descripcion?: string;

    @ApiProperty({ description: '¿Es la especialidad principal?' })
    principal!: boolean;
}

export class HorarioResponseDto {
    @ApiProperty({ description: 'Nombre del día' })
    dia!: string;

    @ApiProperty({ description: 'Hora de inicio' })
    horaInicio!: string;

    @ApiProperty({ description: 'Hora de fin' })
    horaFin!: string;
}

export class CreateMedicoResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({ description: 'Datos del médico creado' })
    data!: MedicoResponseDto;
}

export class GetMedicosResponseDto {
    @ApiProperty({ description: 'Mensaje de éxito' })
    message!: string;

    @ApiProperty({ description: 'Lista de médicos', type: [MedicoResponseDto] })
    data!: MedicoResponseDto[];

    @ApiProperty({ description: 'Metadatos de paginación' })
    meta!: {
        total: number;
        page: number;
        limit: number;
    };
}
