import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MensajeChatEntity } from '../entities/mensaje-chat.entity';

@Injectable()
export class MensajeChatRepository {
    constructor(
        @InjectRepository(MensajeChatEntity)
        private readonly ormRepository: Repository<MensajeChatEntity>,
    ) {}

    /**
     * Crea un nuevo mensaje en el chat de una sesión
     * @param mensajeData - Datos parciales del mensaje a crear
     * @returns El mensaje creado con todas sus relaciones cargadas
     */
    async create(
        mensajeData: Partial<MensajeChatEntity>,
    ): Promise<MensajeChatEntity> {
        const mensaje = this.ormRepository.create(mensajeData);
        const mensajeGuardado = await this.ormRepository.save(mensaje);

        // Cargar relaciones después de guardar
        const mensajeCompleto = await this.findById(mensajeGuardado.id);

        if (!mensajeCompleto) {
            throw new Error(
                'Error al crear el mensaje: no se pudo recuperar el mensaje guardado',
            );
        }

        return mensajeCompleto;
    }

    /**
     * Busca un mensaje por ID con todas sus relaciones
     * @param id - ID del mensaje
     * @returns El mensaje encontrado o null
     */
    async findById(id: number): Promise<MensajeChatEntity | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: [
                'participante',
                'participante.usuario',
                'tipoMensaje',
                'sesion',
            ],
        });
    }

    /**
     * Obtiene todos los mensajes de una sesión específica
     * @param sesionId - ID de la sesión (citaId)
     * @param incluirEliminados - Si se deben incluir mensajes eliminados
     * @returns Array de mensajes ordenados por fecha
     */
    async findBySesionId(
        sesionId: number,
        incluirEliminados: boolean = false,
    ): Promise<MensajeChatEntity[]> {
        const whereCondition = incluirEliminados
            ? { sesion: { citaId: sesionId } }
            : { sesion: { citaId: sesionId }, eliminado: false };

        return this.ormRepository.find({
            where: whereCondition,
            relations: ['participante', 'participante.usuario', 'tipoMensaje'],
            order: {
                fechaHoraEnvio: 'ASC',
            },
        });
    }

    /**
     * Obtiene los últimos N mensajes de una sesión
     * @param sesionId - ID de la sesión (citaId)
     * @param limit - Cantidad de mensajes a devolver
     * @returns Array de mensajes recientes ordenados por fecha descendente
     */
    async findUltimosMensajes(
        sesionId: number,
        limit: number = 50,
    ): Promise<MensajeChatEntity[]> {
        return this.ormRepository.find({
            where: {
                sesion: { citaId: sesionId },
                eliminado: false,
            },
            relations: ['participante', 'participante.usuario', 'tipoMensaje'],
            order: {
                fechaHoraEnvio: 'DESC',
            },
            take: limit,
        });
    }

    /**
     * Marca un mensaje como eliminado (soft delete)
     * @param id - ID del mensaje
     * @returns El mensaje actualizado
     */
    async marcarComoEliminado(id: number): Promise<MensajeChatEntity | null> {
        await this.ormRepository.update(id, { eliminado: true });
        return this.findById(id);
    }

    /**
     * Obtiene mensajes por tipo (texto, archivo, imagen, etc.)
     * @param sesionId - ID de la sesión (citaId)
     * @param tipoMensajeNombre - Nombre del tipo de mensaje
     * @returns Array de mensajes del tipo especificado
     */
    async findByTipo(
        sesionId: number,
        tipoMensajeNombre: string,
    ): Promise<MensajeChatEntity[]> {
        return this.ormRepository.find({
            where: {
                sesion: { citaId: sesionId },
                tipoMensaje: { nombre: tipoMensajeNombre },
                eliminado: false,
            },
            relations: ['participante', 'participante.usuario', 'tipoMensaje'],
            order: {
                fechaHoraEnvio: 'ASC',
            },
        });
    }

    /**
     * Obtiene mensajes enviados por un participante específico
     * @param participanteId - ID del participante
     * @returns Array de mensajes del participante
     */
    async findByParticipante(
        participanteId: number,
    ): Promise<MensajeChatEntity[]> {
        return this.ormRepository.find({
            where: {
                participante: { id: participanteId },
                eliminado: false,
            },
            relations: ['tipoMensaje', 'sesion'],
            order: {
                fechaHoraEnvio: 'ASC',
            },
        });
    }

    /**
     * Cuenta los mensajes de una sesión
     * @param sesionId - ID de la sesión (citaId)
     * @param incluirEliminados - Si se deben incluir mensajes eliminados
     * @returns Número total de mensajes
     */
    async contarMensajes(
        sesionId: number,
        incluirEliminados: boolean = false,
    ): Promise<number> {
        const whereCondition = incluirEliminados
            ? { sesion: { citaId: sesionId } }
            : { sesion: { citaId: sesionId }, eliminado: false };

        return this.ormRepository.count({
            where: whereCondition,
        });
    }
}
