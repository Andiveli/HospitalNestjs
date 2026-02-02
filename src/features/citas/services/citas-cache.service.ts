import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

/**
 * Servicio centralizado para invalidación de caché del módulo de citas.
 *
 * Cuando un paciente crea, actualiza o cancela una cita, se deben invalidar:
 * 1. Caché del paciente - sus listas de citas pendientes/atendidas
 * 2. Caché del médico afectado - sus próximas citas y listados
 * 3. Caché de disponibilidad - los slots disponibles del médico para esa fecha
 */
@Injectable()
export class CitasCacheService {
    private readonly logger = new Logger(CitasCacheService.name);

    constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

    /**
     * Invalida todo el caché relacionado cuando se crea una cita
     * @param pacienteId - ID del paciente que creó la cita
     * @param medicoId - ID del médico de la cita
     * @param fecha - Fecha de la cita (formato YYYY-MM-DD)
     */
    async invalidateOnCitaCreated(
        pacienteId: number,
        medicoId: number,
        fecha: string,
    ): Promise<void> {
        await Promise.all([
            this.invalidatePacienteCache(pacienteId),
            this.invalidateMedicoCache(medicoId),
            this.invalidateDisponibilidadCache(medicoId, fecha),
        ]);

        this.logger.debug(
            `Cache invalidado para cita creada: paciente=${pacienteId}, medico=${medicoId}, fecha=${fecha}`,
        );
    }

    /**
     * Invalida todo el caché relacionado cuando se actualiza una cita
     * @param pacienteId - ID del paciente
     * @param medicoId - ID del médico
     * @param citaId - ID de la cita actualizada
     * @param fechaAnterior - Fecha original de la cita
     * @param fechaNueva - Nueva fecha de la cita
     */
    async invalidateOnCitaUpdated(
        pacienteId: number,
        medicoId: number,
        citaId: number,
        fechaAnterior: string,
        fechaNueva: string,
    ): Promise<void> {
        const invalidations = [
            this.invalidatePacienteCache(pacienteId),
            this.invalidateMedicoCache(medicoId),
            this.invalidateCitaCache(citaId, pacienteId),
            this.invalidateCitaCache(citaId, medicoId),
            this.invalidateDisponibilidadCache(medicoId, fechaAnterior),
        ];

        // Si la fecha cambió, también invalidar la nueva fecha
        if (fechaAnterior !== fechaNueva) {
            invalidations.push(
                this.invalidateDisponibilidadCache(medicoId, fechaNueva),
            );
        }

        await Promise.all(invalidations);

        this.logger.debug(
            `Cache invalidado para cita actualizada: paciente=${pacienteId}, medico=${medicoId}, citaId=${citaId}`,
        );
    }

    /**
     * Invalida todo el caché relacionado cuando se cancela una cita
     * @param pacienteId - ID del paciente
     * @param medicoId - ID del médico
     * @param citaId - ID de la cita cancelada
     * @param fecha - Fecha de la cita cancelada
     */
    async invalidateOnCitaCancelled(
        pacienteId: number,
        medicoId: number,
        citaId: number,
        fecha: string,
    ): Promise<void> {
        await Promise.all([
            this.invalidatePacienteCache(pacienteId),
            this.invalidateMedicoCache(medicoId),
            this.invalidateCitaCache(citaId, pacienteId),
            this.invalidateCitaCache(citaId, medicoId),
            this.invalidateDisponibilidadCache(medicoId, fecha),
        ]);

        this.logger.debug(
            `Cache invalidado para cita cancelada: paciente=${pacienteId}, medico=${medicoId}, citaId=${citaId}`,
        );
    }

    /**
     * Invalida el caché de listados de citas del paciente
     * - Próximas citas
     * - Citas pendientes (paginadas)
     * - Citas atendidas (paginadas)
     * - Citas recientes atendidas
     */
    private async invalidatePacienteCache(pacienteId: number): Promise<void> {
        const basePatterns = [
            `user:${pacienteId}:GET:/api/citas/paciente/proximas`,
            `user:${pacienteId}:GET:/api/citas/paciente/recientes`,
        ];

        // Invalidar rutas paginadas (múltiples combinaciones de page/limit)
        const paginatedPaths = [
            '/api/citas/paciente/pendientes',
            '/api/citas/paciente/atendidas',
        ];

        const paginatedKeys = this.generatePaginatedCacheKeys(
            pacienteId,
            paginatedPaths,
        );

        await this.deleteKeys([...basePatterns, ...paginatedKeys]);
    }

    /**
     * Invalida el caché de listados de citas del médico
     * - Próximas citas del médico
     * - Todas las citas del médico (paginadas)
     * - Citas por fecha
     */
    private async invalidateMedicoCache(medicoId: number): Promise<void> {
        const basePatterns = [
            `user:${medicoId}:GET:/api/citas/medico/proximas`,
        ];

        // Invalidar ruta paginada de "all"
        const paginatedKeys = this.generatePaginatedCacheKeys(medicoId, [
            '/api/citas/medico/all',
        ]);

        // Invalidar las claves de fecha (últimos 30 días + próximos 90 días)
        const dateKeys = this.generateDateRangeCacheKeys(
            medicoId,
            '/api/citas/medico/fecha',
            30,
            90,
        );

        await this.deleteKeys([...basePatterns, ...paginatedKeys, ...dateKeys]);
    }

    /**
     * Invalida el caché de una cita específica para un usuario
     */
    private async invalidateCitaCache(
        citaId: number,
        userId: number,
    ): Promise<void> {
        const key = `user:${userId}:GET:/api/citas/paciente/${citaId}`;
        const keyMedico = `user:${userId}:GET:/api/citas/medico/${citaId}`;
        await this.deleteKeys([key, keyMedico]);
    }

    /**
     * Invalida el caché de disponibilidad del médico para una fecha
     * Este usa CacheInterceptor normal (no UserScoped), así que la key es diferente
     */
    private async invalidateDisponibilidadCache(
        medicoId: number,
        fecha: string,
    ): Promise<void> {
        // CacheInterceptor usa la URL como key directamente
        const disponibilidadKey = `/api/citas/medicos/${medicoId}/disponibilidad?fecha=${fecha}`;
        await this.deleteKeys([disponibilidadKey]);
    }

    /**
     * Genera claves de caché para rutas paginadas
     * Cubre las combinaciones más comunes de page/limit
     */
    private generatePaginatedCacheKeys(
        userId: number,
        paths: string[],
    ): string[] {
        const keys: string[] = [];
        const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const limits = [10, 20, 50, 100];

        for (const path of paths) {
            // Sin paginación (usa defaults)
            keys.push(`user:${userId}:GET:${path}`);

            // Con paginación
            for (const page of pages) {
                for (const limit of limits) {
                    keys.push(
                        `user:${userId}:GET:${path}?page=${page}&limit=${limit}`,
                    );
                    // También el orden inverso de query params
                    keys.push(
                        `user:${userId}:GET:${path}?limit=${limit}&page=${page}`,
                    );
                }
            }
        }

        return keys;
    }

    /**
     * Genera claves de caché para un rango de fechas
     */
    private generateDateRangeCacheKeys(
        userId: number,
        basePath: string,
        daysBefore: number,
        daysAfter: number,
    ): string[] {
        const keys: string[] = [];
        const today = new Date();

        for (let i = -daysBefore; i <= daysAfter; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            keys.push(`user:${userId}:GET:${basePath}?fecha=${dateStr}`);
        }

        return keys;
    }

    /**
     * Elimina múltiples claves del caché de forma segura
     */
    private async deleteKeys(keys: string[]): Promise<void> {
        const deletePromises = keys.map((key) =>
            this.cacheManager.del(key).catch((err: Error) => {
                this.logger.warn(
                    `Error al eliminar cache key "${key}": ${err.message}`,
                );
            }),
        );

        await Promise.all(deletePromises);
    }
}
