import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DerivacionEntity } from './entities/derivacion.entity';
import { ServicioReferidoEntity } from './entities/servicio-referido.entity';
import { CentroSaludEntity } from './entities/centro-salud.entity';
import { MedicoEntity } from '../medicos/medicos.entity';
import { CreateDerivacionDto } from './dto/create-derivacion.dto';
import {
    DerivacionResponseDto,
    CentroSaludDto,
    ServicioReferidoDto,
} from './dto/derivacion-response.dto';

@Injectable()
export class DerivacionesService {
    private readonly logger = new Logger(DerivacionesService.name);

    constructor(
        @InjectRepository(DerivacionEntity)
        private readonly derivacionRepository: Repository<DerivacionEntity>,
        @InjectRepository(ServicioReferidoEntity)
        private readonly servicioRepository: Repository<ServicioReferidoEntity>,
        @InjectRepository(CentroSaludEntity)
        private readonly centroRepository: Repository<CentroSaludEntity>,
        @InjectRepository(MedicoEntity)
        private readonly medicoRepository: Repository<MedicoEntity>,
    ) {}

    /**
     * Crea una nueva derivación
     * @param dto - Datos de la derivación
     * @param medicoId - ID del médico que crea la derivación
     * @returns La derivación creada
     */
    async create(
        dto: CreateDerivacionDto,
        medicoId: number,
    ): Promise<DerivacionResponseDto> {
        // 1. Verificar que el médico exista
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: medicoId },
            relations: ['persona'],
        });

        if (!medico) {
            throw new NotFoundException(
                `Médico con ID ${medicoId} no encontrado`,
            );
        }

        // 2. Verificar que el centro exista si se proporciona
        let centro: CentroSaludEntity | undefined;
        if (dto.centroId) {
            const centroFound = await this.centroRepository.findOne({
                where: { id: dto.centroId },
            });
            if (!centroFound) {
                throw new NotFoundException(
                    `Centro de salud con ID ${dto.centroId} no encontrado`,
                );
            }
            centro = centroFound;
        }

        // 3. Verificar que los servicios existan
        const servicios = await this.servicioRepository.findBy({
            id: In(dto.serviciosIds),
        });

        if (servicios.length !== dto.serviciosIds.length) {
            const encontrados = servicios.map((s) => s.id);
            const noEncontrados = dto.serviciosIds.filter(
                (id) => !encontrados.includes(id),
            );
            throw new NotFoundException(
                `Servicios no encontrados: ${noEncontrados.join(', ')}`,
            );
        }

        // 4. Crear la derivación
        const derivacion = new DerivacionEntity();
        derivacion.motivo = dto.motivo;
        derivacion.medicoId = medicoId;
        derivacion.medico = medico;
        derivacion.registroAtencionId = dto.registroAtencionId;
        derivacion.centroId = dto.centroId;
        derivacion.centro = centro;
        derivacion.servicios = servicios;

        const guardada = await this.derivacionRepository.save(derivacion);

        this.logger.log(
            `Derivación ${guardada.id} creada por médico ${medicoId}`,
        );

        return this.mapToResponseDto(guardada);
    }

    /**
     * Obtiene todas las derivaciones del médico autenticado
     * @param medicoId - ID del médico
     * @returns Lista de derivaciones
     */
    async findByMedico(medicoId: number): Promise<DerivacionResponseDto[]> {
        const derivaciones = await this.derivacionRepository.find({
            where: { medicoId },
            relations: ['medico', 'medico.persona', 'centro', 'servicios'],
            order: { fechaHoraCreacion: 'DESC' },
        });

        return derivaciones.map((d) => this.mapToResponseDto(d));
    }

    /**
     * Obtiene una derivación por ID
     * @param id - ID de la derivación
     * @param medicoId - ID del médico (para validar permisos)
     * @returns La derivación
     */
    async findById(
        id: number,
        medicoId: number,
    ): Promise<DerivacionResponseDto> {
        const derivacion = await this.derivacionRepository.findOne({
            where: { id },
            relations: ['medico', 'medico.persona', 'centro', 'servicios'],
        });

        if (!derivacion) {
            throw new NotFoundException(
                `Derivación con ID ${id} no encontrada`,
            );
        }

        // Solo el médico que la creó o un admin puede verla
        if (derivacion.medicoId !== medicoId) {
            throw new ForbiddenException(
                'No tiene permiso para ver esta derivación',
            );
        }

        return this.mapToResponseDto(derivacion);
    }

    /**
     * Elimina una derivación
     * @param id - ID de la derivación
     * @param medicoId - ID del médico autenticado
     */
    async delete(id: number, medicoId: number): Promise<void> {
        const derivacion = await this.derivacionRepository.findOne({
            where: { id },
        });

        if (!derivacion) {
            throw new NotFoundException(
                `Derivación con ID ${id} no encontrada`,
            );
        }

        if (derivacion.medicoId !== medicoId) {
            throw new ForbiddenException(
                'No tiene permiso para eliminar esta derivación',
            );
        }

        await this.derivacionRepository.remove(derivacion);

        this.logger.log(`Derivación ${id} eliminada por médico ${medicoId}`);
    }

    /**
     * Obtiene todos los servicios referidos disponibles
     * @returns Lista de servicios
     */
    async findAllServicios(): Promise<ServicioReferidoDto[]> {
        const servicios = await this.servicioRepository.find({
            order: { nombre: 'ASC' },
        });

        return servicios.map((s) => ({
            id: s.id,
            nombre: s.nombre,
        }));
    }

    /**
     * Obtiene todos los centros de salud
     * @returns Lista de centros
     */
    async findAllCentros(): Promise<CentroSaludDto[]> {
        const centros = await this.centroRepository.find({
            order: { nombre: 'ASC' },
        });

        return centros.map((c) => ({
            id: c.id,
            nombre: c.nombre,
            direccion: c.direccion,
            telefono: c.telefono,
        }));
    }

    /**
     * Mapea una entidad a DTO de respuesta
     */
    private mapToResponseDto(
        derivacion: DerivacionEntity,
    ): DerivacionResponseDto {
        const centro: CentroSaludDto | undefined = derivacion.centro
            ? {
                  id: derivacion.centro.id,
                  nombre: derivacion.centro.nombre,
                  direccion: derivacion.centro.direccion,
                  telefono: derivacion.centro.telefono,
              }
            : undefined;

        const servicios: ServicioReferidoDto[] = derivacion.servicios.map(
            (s) => ({
                id: s.id,
                nombre: s.nombre,
            }),
        );

        const medicoNombre = derivacion.medico?.persona
            ? `${derivacion.medico.persona.primerNombre} ${derivacion.medico.persona.primerApellido}`
            : `Dr. ID: ${derivacion.medicoId}`;

        return {
            id: derivacion.id,
            motivo: derivacion.motivo,
            fechaHoraCreacion: derivacion.fechaHoraCreacion,
            registroAtencionId: derivacion.registroAtencionId,
            medicoId: derivacion.medicoId,
            medicoNombre,
            centro,
            servicios,
        };
    }
}
