import { ApiProperty } from '@nestjs/swagger';

export class MedicoResponseDto {
    @ApiProperty({ description: 'Nombre completo del médico' })
    nombreCompleto!: string;

    @ApiProperty({ description: 'Email del médico' })
    email!: string;

    // @ApiProperty({ description: 'Edad del médico' })
    // edad!: number;
    //
    @ApiProperty({ description: 'Cédula del médico' })
    cedula!: string;

    @ApiProperty({ description: 'Licencia médica' })
    licenciaMedica!: string;

    @ApiProperty({ description: 'Pasaporte (opcional)' })
    pasaporte?: string;

    @ApiProperty({ description: 'Especialidades del médico' })
    especialidades!: EspecialidadResponseDto[];

    @ApiProperty({ description: 'Horarios de atención' })
    horarios!: HorarioResponseDto[];
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
