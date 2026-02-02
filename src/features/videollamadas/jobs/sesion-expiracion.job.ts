import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SesionConsultaRepository } from '../repositories/sesion-consulta.repository';
import { VideoLlamadaGateway } from '../gateways/videollamada.gateway';

/**
 * Job programado para manejar la expiración automática de sesiones de videollamada
 *
 * Funcionalidades:
 * - Cada minuto revisa sesiones activas que han superado su hora de fin
 * - Emite avisos de tiempo a las salas (5 min, 1 min antes)
 * - Finaliza automáticamente sesiones expiradas
 * - Notifica a todos los participantes vía WebSocket
 */
@Injectable()
export class SesionExpiracionJob {
    private readonly logger = new Logger(SesionExpiracionJob.name);

    // Set para trackear sesiones a las que ya se les envió aviso de 5 min
    private avisoCincoMinutosEnviado = new Set<number>();
    // Set para trackear sesiones a las que ya se les envió aviso de 1 min
    private avisoUnMinutoEnviado = new Set<number>();

    constructor(
        private readonly sesionRepository: SesionConsultaRepository,
        private readonly videollamadaGateway: VideoLlamadaGateway,
    ) {}

    /**
     * Ejecuta cada minuto para revisar sesiones próximas a expirar y expiradas
     */
    @Cron(CronExpression.EVERY_MINUTE)
    async handleSesionExpiracion(): Promise<void> {
        this.logger.debug('Revisando sesiones de videollamada...');

        try {
            // 1. Enviar avisos de 5 minutos
            await this.enviarAvisosCincoMinutos();

            // 2. Enviar avisos de 1 minuto
            await this.enviarAvisosUnMinuto();

            // 3. Finalizar sesiones expiradas
            await this.finalizarSesionesExpiradas();
        } catch (error) {
            this.logger.error(
                `Error en job de expiración de sesiones: ${(error as Error).message}`,
            );
        }
    }

    /**
     * Envía avisos a sesiones que expiran en ~5 minutos
     */
    private async enviarAvisosCincoMinutos(): Promise<void> {
        // Buscar sesiones que expiran entre 4 y 5 minutos
        const sesiones =
            await this.sesionRepository.findSesionesProximasAExpirar(5);

        for (const sesion of sesiones) {
            // Verificar que falten entre 4 y 5 minutos (evitar duplicados)
            const minutosRestantes = this.calcularMinutosRestantes(
                sesion.fechaHoraFin,
            );

            if (
                minutosRestantes <= 5 &&
                minutosRestantes > 4 &&
                !this.avisoCincoMinutosEnviado.has(sesion.citaId)
            ) {
                this.logger.log(
                    `Enviando aviso de 5 minutos a sala cita_${sesion.citaId}`,
                );

                this.videollamadaGateway.emitirAvisoTiempo(
                    sesion.citaId,
                    5,
                    sesion.fechaHoraFin,
                );

                this.avisoCincoMinutosEnviado.add(sesion.citaId);
            }
        }
    }

    /**
     * Envía avisos a sesiones que expiran en ~1 minuto
     */
    private async enviarAvisosUnMinuto(): Promise<void> {
        // Buscar sesiones que expiran en 1 minuto o menos
        const sesiones =
            await this.sesionRepository.findSesionesProximasAExpirar(1);

        for (const sesion of sesiones) {
            const minutosRestantes = this.calcularMinutosRestantes(
                sesion.fechaHoraFin,
            );

            if (
                minutosRestantes <= 1 &&
                minutosRestantes > 0 &&
                !this.avisoUnMinutoEnviado.has(sesion.citaId)
            ) {
                this.logger.log(
                    `Enviando aviso de 1 minuto a sala cita_${sesion.citaId}`,
                );

                this.videollamadaGateway.emitirAvisoTiempo(
                    sesion.citaId,
                    1,
                    sesion.fechaHoraFin,
                );

                this.avisoUnMinutoEnviado.add(sesion.citaId);
            }
        }
    }

    /**
     * Finaliza sesiones que han superado su hora de fin
     */
    private async finalizarSesionesExpiradas(): Promise<void> {
        const sesionesExpiradas =
            await this.sesionRepository.findSesionesActivasExpiradas();

        for (const sesion of sesionesExpiradas) {
            this.logger.log(
                `Finalizando sesión expirada para cita ${sesion.citaId}`,
            );

            try {
                // 1. Notificar a los participantes que la sesión terminó
                this.videollamadaGateway.emitirSesionFinalizada(
                    sesion.citaId,
                    'La sesión ha finalizado automáticamente al llegar la hora programada',
                );

                // 2. Finalizar la sesión en la base de datos
                // Usamos el método del servicio sin usuarioId ya que es automático
                await this.sesionRepository.finalizarSesion(
                    sesion.citaId,
                    new Date(),
                );

                // 3. Limpiar los sets de avisos
                this.avisoCincoMinutosEnviado.delete(sesion.citaId);
                this.avisoUnMinutoEnviado.delete(sesion.citaId);

                this.logger.log(
                    `Sesión ${sesion.citaId} finalizada automáticamente`,
                );
            } catch (error) {
                this.logger.error(
                    `Error al finalizar sesión ${sesion.citaId}: ${(error as Error).message}`,
                );
            }
        }
    }

    /**
     * Calcula los minutos restantes hasta una fecha
     */
    private calcularMinutosRestantes(fechaFin: Date): number {
        const ahora = new Date();
        const diferencia = fechaFin.getTime() - ahora.getTime();
        return diferencia / (1000 * 60);
    }

    /**
     * Limpia las sesiones finalizadas de los sets de seguimiento
     * Se llama cuando una sesión se finaliza manualmente
     */
    limpiarSesion(citaId: number): void {
        this.avisoCincoMinutosEnviado.delete(citaId);
        this.avisoUnMinutoEnviado.delete(citaId);
    }
}
