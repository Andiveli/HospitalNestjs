import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ParticipanteSesionEntity } from '../entities/participante-sesion.entity';

@Injectable()
export class ParticipanteSesionRepository {
    constructor(
        @InjectRepository(ParticipanteSesionEntity)
        private readonly ormRepository: Repository<ParticipanteSesionEntity>,
    ) {}

    /**
     * Crea un nuevo participante en una sesión
     * @param participanteData - Datos parciales del participante a crear
     * @returns El participante creado con todas sus relaciones cargadas
     */
    async create(
        participanteData: Partial<ParticipanteSesionEntity>,
    ): Promise<ParticipanteSesionEntity> {
        const participante = this.ormRepository.create(participanteData);
        const participanteGuardado =
            await this.ormRepository.save(participante);

        // Cargar relaciones después de guardar
        const participanteCompleto = await this.findById(
            participanteGuardado.id,
        );

        if (!participanteCompleto) {
            throw new Error(
                'Error al crear el participante: no se pudo recuperar el participante guardado',
            );
        }

        return participanteCompleto;
    }

    /**
     * Busca un participante por ID con todas sus relaciones
     * @param id - ID del participante
     * @returns El participante encontrado o null
     */
    async findById(id: number): Promise<ParticipanteSesionEntity | null> {
        return this.ormRepository.findOne({
            where: { id },
            relations: ['usuario', 'rol', 'sesion', 'sesion.cita'],
        });
    }

    /**
     * Busca un participante por token de acceso
     * @param tokenAcceso - Token de acceso del participante
     * @returns El participante encontrado o null
     */
    async findByToken(
        tokenAcceso: string,
    ): Promise<ParticipanteSesionEntity | null> {
        return this.ormRepository.findOne({
            where: { tokenAcceso },
            relations: [
                'usuario',
                'rol',
                'sesion',
                'sesion.cita',
                'sesion.estado',
            ],
        });
    }

    /**
     * Obtiene todos los participantes de una sesión específica
     * @param sesionId - ID de la sesión (citaId)
     * @returns Array de participantes
     */
    async findBySesionId(
        sesionId: number,
    ): Promise<ParticipanteSesionEntity[]> {
        return this.ormRepository.find({
            where: { sesion: { citaId: sesionId } },
            relations: ['usuario', 'rol'],
            order: {
                fechaHoraUnion: 'ASC',
            },
        });
    }

    /**
     * Obtiene todos los participantes activos (aún conectados) de una sesión
     * @param sesionId - ID de la sesión (citaId)
     * @returns Array de participantes activos
     */
    async findParticipantesActivos(
        sesionId: number,
    ): Promise<ParticipanteSesionEntity[]> {
        return this.ormRepository.find({
            where: {
                sesion: { citaId: sesionId },
                fechaHoraSalida: IsNull(),
            },
            relations: ['usuario', 'rol'],
        });
    }

    /**
     * Registra la salida de un participante de la sesión
     * @param id - ID del participante
     * @param fechaHoraSalida - Fecha y hora de salida
     * @returns El participante actualizado
     */
    async registrarSalida(
        id: number,
        fechaHoraSalida: Date,
    ): Promise<ParticipanteSesionEntity | null> {
        await this.ormRepository.update(id, { fechaHoraSalida });
        return this.findById(id);
    }

    /**
     * Busca un participante por usuario y sesión
     * @param usuarioId - ID del usuario
     * @param sesionId - ID de la sesión (citaId)
     * @returns El participante encontrado o null
     */
    async findByUsuarioYSesion(
        usuarioId: number,
        sesionId: number,
    ): Promise<ParticipanteSesionEntity | null> {
        return this.ormRepository.findOne({
            where: {
                usuario: { id: usuarioId },
                sesion: { citaId: sesionId },
            },
            relations: ['usuario', 'rol', 'sesion'],
        });
    }

    /**
     * Verifica si un usuario ya es participante de una sesión
     * @param usuarioId - ID del usuario (puede ser null para invitados)
     * @param sesionId - ID de la sesión (citaId)
     * @returns true si ya es participante, false si no
     */
    async existeParticipante(
        usuarioId: number | null,
        sesionId: number,
    ): Promise<boolean> {
        const whereCondition =
            usuarioId === null
                ? { usuario: IsNull(), sesion: { citaId: sesionId } }
                : { usuario: { id: usuarioId }, sesion: { citaId: sesionId } };

        const count = await this.ormRepository.count({
            where: whereCondition,
        });

        return count > 0;
    }

    /**
     * Cuenta los participantes activos de una sesión
     * @param sesionId - ID de la sesión (citaId)
     * @returns Número de participantes activos
     */
    async contarParticipantesActivos(sesionId: number): Promise<number> {
        return this.ormRepository.count({
            where: {
                sesion: { citaId: sesionId },
                fechaHoraSalida: IsNull(),
            },
        });
    }
}
