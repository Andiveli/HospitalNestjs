import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomInt } from 'crypto';
import { Repository } from 'typeorm';
import { InvitacionVideollamadaEntity } from '../entities';

/**
 * Repository para gestión de invitaciones a videollamadas
 */
@Injectable()
export class InvitacionVideollamadaRepository {
    constructor(
        @InjectRepository(InvitacionVideollamadaEntity)
        private readonly repository: Repository<InvitacionVideollamadaEntity>,
    ) {}

    /**
     * Crea una nueva invitación
     */
    async crearInvitacion(
        citaId: number,
        invitadoPorId: number,
        nombreInvitado: string,
        rolInvitado: string,
        fechaHoraExpiracion: Date,
    ): Promise<InvitacionVideollamadaEntity> {
        const invitacion = this.repository.create({
            citaId,
            invitadoPorId,
            nombreInvitado,
            rolInvitado,
            fechaHoraExpiracion,
            codigoAcceso: this.generarCodigoAcceso(),
        });

        return await this.repository.save(invitacion);
    }

    /**
     * Busca una invitación por su código de acceso
     */
    async buscarPorCodigoAcceso(
        codigoAcceso: string,
    ): Promise<InvitacionVideollamadaEntity | null> {
        return await this.repository.findOne({
            where: { codigoAcceso },
            relations: [
                'cita',
                'cita.medico',
                'cita.medico.persona',
                'cita.paciente',
                'cita.paciente.person',
                'cita.estado',
                'invitadoPor',
            ],
        });
    }

    /**
     * Marca una invitación como usada
     */
    async marcarComoUsada(id: number): Promise<void> {
        await this.repository.update(id, {
            usado: true,
            fechaHoraUso: new Date(),
        });
    }

    /**
     * Busca invitaciones por cita
     */
    async buscarPorCita(
        citaId: number,
    ): Promise<InvitacionVideollamadaEntity[]> {
        return await this.repository.find({
            where: { citaId },
            relations: ['invitadoPor'],
            order: { fechaHoraCreacion: 'DESC' },
        });
    }

    /**
     * Limpia invitaciones expiradas
     */
    async limpiarExpiradas(): Promise<void> {
        const ahora = new Date();
        await this.repository
            .createQueryBuilder()
            .update(InvitacionVideollamadaEntity)
            .set({ activo: false })
            .where('fechaHoraExpiracion < :ahora', { ahora })
            .execute();
    }

    /**
     * Genera un código de acceso único y criptográficamente seguro
     *
     * Usa crypto.randomInt() en lugar de Math.random() para mayor seguridad.
     * Genera un código de 12 caracteres alfanuméricos (mayúsculas y números).
     * Esto proporciona ~62 bits de entropía (36^12 combinaciones posibles).
     *
     * @returns Código de acceso de 12 caracteres (ej: "A7K3X9M2P4Q1")
     */
    private generarCodigoAcceso(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const length = 12;
        let codigo = '';

        for (let i = 0; i < length; i++) {
            const index = randomInt(0, chars.length);
            codigo += chars.charAt(index);
        }

        return codigo;
    }
}
