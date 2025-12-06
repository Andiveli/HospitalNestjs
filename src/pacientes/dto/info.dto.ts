import {
    IsDateString,
    IsNotEmpty,
    IsString,
    Matches,
    IsEnum,
} from 'class-validator';

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
    @IsDateString({}, { message: 'Formato de fecha incorrecto (YYYY-MM-DD' })
    @IsNotEmpty({ message: 'Tienes que agregar tu fecha de nacimiento' })
    fecha: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu numero de telefono' })
    @Matches(/^\+?[0-9]{10}$/, {
        message: 'El numero de telefono no es valido',
    })
    telefono: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu direccion' })
    residencia: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu pais' })
    pais: string;

    @IsEnum(Sangre, {
        message:
            'Grupo sanguíneo no válido. Opciones: A+, A-, B+, B-, AB+, AB-, O+, O-',
    })
    @IsNotEmpty({ message: 'Tienes que agregar tu grupo sanguineo' })
    sangre: Sangre;

    @IsEnum(EstiloVida, {
        message: 'Estilo de vida no válido. Opciones: Activo, Sedentario',
    })
    @IsNotEmpty({ message: 'Tienes que agregar tu estilo de vida' })
    estiloVida: EstiloVida;
}
