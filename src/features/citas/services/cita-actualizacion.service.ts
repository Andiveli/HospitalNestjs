import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CitaEntity } from '../entities/cita.entity';
import { EstadoCita } from '../constants/estado-cita.constants';
import { citaConfig } from '../../../config/cita.config';
import { EstadoCitaEntity } from '../entities/estado-cita.entity';

@Injectable()
export class CitaActualizacionService {
    constructor(
        @InjectRepository(CitaEntity)
        private readonly citaRepository: Repository<CitaEntity>,
        @InjectRepository(EstadoCitaEntity)
        private readonly estadoCitaRepository: Repository<EstadoCitaEntity>,
    ) {}

    async actualizarCitasVencidas(): Promise<number> {
        const ahora = new Date();
        const limiteMinutos = citaConfig.LIMITE_MINUTOS_VENCIMIENTO;
        const limiteTiempo = new Date(
            ahora.getTime() - limiteMinutos * 60 * 1000,
        );

        const [estadoCancelada, estadoPendiente] = await Promise.all([
            this.estadoCitaRepository.findOne({
                where: { nombre: EstadoCita.CANCELADA },
            }),
            this.estadoCitaRepository.findOne({
                where: { nombre: EstadoCita.PENDIENTE },
            }),
        ]);

        if (!estadoCancelada || !estadoPendiente) {
            console.error(
                'No se encontraron los estados necesarios en la base de datos',
            );
            return 0;
        }

        const resultado = await this.citaRepository
            .createQueryBuilder()
            .update(CitaEntity)
            .set({ estado: estadoCancelada })
            .where('estado_id = :estadoPendiente', {
                estadoPendiente: estadoPendiente.id,
            })
            .andWhere('fecha_hora_inicio < :limite', { limite: limiteTiempo })
            .execute();

        return resultado.affected || 0;
    }

    getCronPattern(): string {
        const { MINUTOS, RANGO_HORAS } = citaConfig.HORAS_EJECUCION;
        return `${MINUTOS.join(',')} ${RANGO_HORAS[0]}-${RANGO_HORAS[1]} * * *`;
    }
}
