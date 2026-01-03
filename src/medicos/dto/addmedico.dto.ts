import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsString,
    Matches,
} from 'class-validator';
import { diasSemana } from 'src/common/constants/dias.constants';

export class AddMedicoDto {
    @IsDateString({}, { message: 'Formato de fecha incorrecto (YYYY-MM-DD' })
    @IsNotEmpty({ message: 'Tienes que agregar tu fecha de nacimiento' })
    fecha: string;

    @IsNumber()
    @IsNotEmpty({ message: 'Tienes que agregar el la especialidad' })
    especialidad: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar la especialidad principal' })
    principal: string;

    //Formato esperado: HH:MM-HH:MM;1,2,3 (donde 1=Domingo, 2=Lunes, ..., 7=Sábado)
    @IsNotEmpty({ message: 'Tienes que agregar el horario de atención' })
    @IsEnum(diasSemana, {
        message: (args) =>
            `El valor ${args.value} no es un rol válido. Usa: ${Object.values(diasSemana).join(', ')}`,
    })
    dias: diasSemana[];

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar el horario de atención' })
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'El formato de hora debe ser HH:MM (24 horas)',
    })
    horaInicio: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar el horario de atención' })
    @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'El formato de hora debe ser HH:MM (24 horas)',
    })
    horaFin: string;

    @IsString()
    @IsNotEmpty({ message: 'Tienes que agregar la especialidad' })
    licenciaMedica: string;
}

export class PerfilMedico {
    nombre: string;
    edad: number;
    correo: string;
    especialidad: string;
    consultasAtendidas: number;
    horarioAtencion: Record<string, string>;
}
