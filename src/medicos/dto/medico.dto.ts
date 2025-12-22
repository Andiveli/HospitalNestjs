import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class MedicoDto {
    @IsDateString({}, { message: 'Formato de fecha incorrecto (YYYY-MM-DD' })
    @IsNotEmpty({ message: 'Tienes que agregar tu fecha de nacimiento' })
    fecha: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar la especialidad' })
    especialidad: string;
}
