import {
    IsDateString,
    IsNotEmpty,
    IsString,
    Matches,
    IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Sangre {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

export enum EstiloVida {
    ACTIVO = 'activo',
    SEDENTARIO = 'sedentario',
}

export class InfoDto {
    @ApiProperty({
        description: 'Fecha de nacimiento del paciente',
        example: '1990-05-15',
        format: 'date',
        pattern: 'YYYY-MM-DD',
    })
    @IsDateString({}, { message: 'Formato de fecha incorrecto (YYYY-MM-DD)' })
    @IsNotEmpty({ message: 'Tienes que agregar tu fecha de nacimiento' })
    fecha!: string;

    @ApiProperty({
        description: 'Número de teléfono del paciente',
        example: '+5491155551234',
        pattern: '^[+]?[0-9]{10}$',
        minLength: 10,
        maxLength: 15,
    })
    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu numero de telefono' })
    @Matches(/^\+?[0-9]{10}$/, {
        message: 'El numero de telefono no es valido',
    })
    telefono!: string;

    @ApiProperty({
        description: 'Dirección completa de residencia',
        example: 'Av. Corrientes 1234, Buenos Aires, Argentina',
        minLength: 10,
        maxLength: 255,
    })
    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu direccion' })
    residencia!: string;

    @ApiProperty({
        description: 'País de residencia del paciente',
        example: 'Argentina',
        minLength: 3,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu pais' })
    pais!: string;

    @ApiProperty({
        description: 'Grupo sanguíneo del paciente',
        example: 'O+',
        enum: [
            Sangre.A_POSITIVE,
            Sangre.A_NEGATIVE,
            Sangre.B_POSITIVE,
            Sangre.B_NEGATIVE,
            Sangre.AB_POSITIVE,
            Sangre.AB_NEGATIVE,
            Sangre.O_POSITIVE,
            Sangre.O_NEGATIVE,
        ],
    })
    @IsEnum(Sangre, {
        message:
            'Grupo sanguíneo no válido. Opciones: A+, A-, B+, B-, AB+, AB-, O+, O-',
    })
    @IsNotEmpty({ message: 'Tienes que agregar tu grupo sanguineo' })
    sangre!: Sangre;

    @ApiProperty({
        description: 'Estilo de vida del paciente',
        example: 'activo',
        enum: [EstiloVida.ACTIVO, EstiloVida.SEDENTARIO],
    })
    @IsEnum(EstiloVida, {
        message: 'Estilo de vida no válido. Opciones: Activo, Sedentario',
    })
    @IsNotEmpty({ message: 'Tienes que agregar tu estilo de vida' })
    estiloVida!: EstiloVida;
}
