import { IsAlpha, IsNotEmpty, IsString, Matches } from 'class-validator';

enum Sangre {
    A_POSITIVE = 'A+',
    A_NEGATIVE = 'A-',
    B_POSITIVE = 'B+',
    B_NEGATIVE = 'B-',
    AB_POSITIVE = 'AB+',
    AB_NEGATIVE = 'AB-',
    O_POSITIVE = 'O+',
    O_NEGATIVE = 'O-',
}

export enum EstadoVida {
    Activo = 'activo',
    Sedentario = 'sedentario',
}

export class InfoDto {
    @IsAlpha()
    @IsNotEmpty({ message: 'Tienes que agregar tu edad' })
    edad: number;

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

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu genero' })
    genero: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu grupo sanguineo' })
    sangre: Sangre;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar tu estado de vida' })
    estadoVida: EstadoVida;
}
