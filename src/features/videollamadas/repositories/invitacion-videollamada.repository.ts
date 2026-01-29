import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
                'invitadoPor.persona',
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
            relations: ['invitadoPor', 'invitadoPor.persona'],
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
     * Genera un código de acceso único
     */
    private generarCodigoAcceso(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let codigo = '';
        for (let i = 0; i < 8; i++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return codigo;
    }
}
