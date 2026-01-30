import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { citaConfig } from '../../../config/cita.config';
import { CitaActualizacionService } from '../services/cita-actualizacion.service';

const CRON_PATTERN = (() => {
    const { MINUTOS, RANGO_HORAS } = citaConfig.HORAS_EJECUCION;
    return `${MINUTOS.join(',')} ${RANGO_HORAS[0]}-${RANGO_HORAS[1]} * * *`;
})();

@Injectable()
export class CitaActualizacionJob {
    private readonly logger = new Logger(CitaActualizacionJob.name);

    constructor(
        private readonly citaActualizacionService: CitaActualizacionService,
    ) {}

    // Usamos la constante calculada dinámicamente
    @Cron(CRON_PATTERN)
    async handleCitaVencidas(): Promise<void> {
        try {
            const actualizadas =
                await this.citaActualizacionService.actualizarCitasVencidas();

            this.logger.log(`Pattern ejecutado: ${CRON_PATTERN}`);

            if (actualizadas > 0) {
                this.logger.log(`Se cancelaron ${actualizadas} citas vencidas`);
            }
        } catch (error) {
            this.logger.error('Error al actualizar citas vencidas:', error);
        }
    }

    // Helper para logging y verificación
    getCronPattern(): string {
        return CRON_PATTERN;
    }
}
