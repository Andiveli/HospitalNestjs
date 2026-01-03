import { Injectable } from '@nestjs/common';

@Injectable()
export class CommonService {
    calcularEdad(fecha: Date): number {
        const hoy = new Date();
        const fechaNacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNacimiento = fechaNacimiento.getMonth();
        const diaNacimiento = fechaNacimiento.getDate();
        if (
            mesActual < mesNacimiento ||
            (mesActual === mesNacimiento && diaActual < diaNacimiento)
        ) {
            edad--;
        }
        return edad;
    }
}
