import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SesionConsultaEntity } from '../entities/sesion-consulta.entity';

@Injectable()
export class SesionConsultaRepository {
    private readonly logger = new Logger(SesionConsultaRepository.name);

    constructor(
        @InjectRepository(SesionConsultaEntity)
        private readonly ormRepository: Repository<SesionConsultaEntity>,
    ) {}

    /**
     * Crea una nueva sesión de consulta asociada a una cita
     * @param sesionData - Datos parciales de la sesión a crear
     * @returns La sesión creada con todas sus relaciones cargadas
     */
    async create(
        sesionData: Partial<SesionConsultaEntity>,
    ): Promise<SesionConsultaEntity> {
        const sesion = this.ormRepository.create(sesionData);
        const sesionGuardada = await this.ormRepository.save(sesion);

        // Cargar relaciones después de guardar
        const sesionCompleta = await this.findByCitaId(sesionGuardada.citaId);

        if (!sesionCompleta) {
            throw new Error(
                'Error al crear la sesión: no se pudo recuperar la sesión guardada',
            );
        }

        return sesionCompleta;
    }

    /**
     * Busca una sesión por citaId con todas sus relaciones
     * @param citaId - ID de la cita asociada
     * @returns La sesión encontrada o null
     */
    async findByCitaId(citaId: number): Promise<SesionConsultaEntity | null> {
        return this.ormRepository.findOne({
            where: { citaId },
            relations: [
                'cita',
                'cita.paciente',
                'cita.paciente.person',
                'cita.medico',
                'cita.medico.persona',
                'estado',
                'participantes',
                'participantes.usuario',
                'participantes.rol',
            ],
        });
    }

    /**
     * Busca una sesión por citaId con todos los mensajes del chat
     * @param citaId - ID de la cita asociada
     * @returns La sesión con mensajes o null
     */
    async findByCitaIdConMensajes(
        citaId: number,
    ): Promise<SesionConsultaEntity | null> {
        return this.ormRepository.findOne({
            where: { citaId },
            relations: [
                'cita',
                'cita.paciente',
                'cita.paciente.person',
                'cita.medico',
                'cita.medico.persona',
                'estado',
                'participantes',
                'participantes.usuario',
                'participantes.rol',
                'mensajes',
                'mensajes.participante',
                'mensajes.tipoMensaje',
            ],
            order: {
                mensajes: {
                    fechaHoraEnvio: 'ASC',
                },
            },
        });
    }

    /**
     * Actualiza una sesión existente
     * @param citaId - ID de la cita asociada
     * @param sesionData - Datos parciales a actualizar
     * @returns La sesión actualizada con relaciones cargadas
     */
    async update(
        citaId: number,
        sesionData: Partial<SesionConsultaEntity>,
    ): Promise<SesionConsultaEntity | null> {
        await this.ormRepository.update({ citaId }, sesionData);
        return this.findByCitaId(citaId);
    }

    /**
     * Verifica si existe una sesión para una cita específica
     * @param citaId - ID de la cita
     * @returns true si existe, false si no
     */
    async existsByCitaId(citaId: number): Promise<boolean> {
        const count = await this.ormRepository.count({
            where: { citaId },
        });
        return count > 0;
    }

    /**
     * Obtiene las sesiones activas (en curso)
     * @returns Array de sesiones activas
     */
    async findSesionesActivas(): Promise<SesionConsultaEntity[]> {
        return this.ormRepository.find({
            where: {
                estado: { nombre: 'activa' },
            },
            relations: [
                'cita',
                'cita.medico',
                'cita.medico.persona',
                'cita.paciente',
                'cita.paciente.person',
                'estado',
                'participantes',
            ],
        });
    }

    /**
     * Finaliza una sesión actualizando su estado y fecha de fin
     * @param citaId - ID de la cita asociada
     * @param fechaHoraFin - Fecha y hora de finalización
     * @returns La sesión actualizada
     */
    async finalizarSesion(
        citaId: number,
        fechaHoraFin: Date,
    ): Promise<SesionConsultaEntity | null> {
        const sesion = await this.findByCitaId(citaId);

        if (!sesion) {
            this.logger.warn(`Sesión con citaId ${citaId} no encontrada`);
            return null;
        }

        // Actualizar fecha de fin y estado
        await this.ormRepository.update(
            { citaId },
            {
                fechaHoraFin,
            },
        );

        return this.findByCitaId(citaId);
    }

    /**
     * Actualiza la URL de grabación de una sesión
     * @param citaId - ID de la cita
     * @param grabacionUrl - URL de la grabación
     */
    async updateGrabacionUrl(
        citaId: number,
        grabacionUrl: string,
    ): Promise<void> {
        await this.ormRepository.update({ citaId }, { grabacionUrl });
    }
}
