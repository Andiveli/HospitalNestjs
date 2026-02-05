import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { MedicamentosRepository } from './repositories/medicamentos.repository';
import { CreateMedicamentoDto } from './dto/create-medicamento.dto';
import { UpdateMedicamentoDto } from './dto/update-medicamento.dto';
import {
    CreatePresentacionDto,
    UpdatePresentacionDto,
} from './dto/presentacion.dto';
import {
    MedicamentoResponseDto,
    PresentacionResponseDto,
} from './dto/medicamento-response.dto';
import { MedicamentoEntity } from './entities/medicamento.entity';

@Injectable()
export class MedicamentosService {
    private readonly logger = new Logger(MedicamentosService.name);

    constructor(
        private readonly medicamentosRepository: MedicamentosRepository,
    ) {}

    /**
     * Crea un nuevo medicamento
     * @param dto - Datos del medicamento a crear
     * @returns El medicamento creado
     */
    async create(dto: CreateMedicamentoDto): Promise<MedicamentoResponseDto> {
        // 1. Validar que la presentación exista
        const presentacionExiste =
            await this.medicamentosRepository.existsPresentacion(
                dto.presentacionId,
            );

        if (!presentacionExiste) {
            throw new BadRequestException(
                `La presentación con ID ${dto.presentacionId} no existe`,
            );
        }

        // 2. Verificar que no exista un medicamento con el mismo nombre y principio activo
        const existe =
            await this.medicamentosRepository.existsByNombreYPrincipio(
                dto.nombre,
                dto.principioActivo,
            );

        if (existe) {
            throw new ConflictException(
                `Ya existe un medicamento con el nombre "${dto.nombre}" y principio activo "${dto.principioActivo}"`,
            );
        }

        // 3. Crear el medicamento
        const medicamento = await this.medicamentosRepository.create({
            nombre: dto.nombre,
            principioActivo: dto.principioActivo,
            concentracion: dto.concentracion,
            presentacionId: dto.presentacionId,
        });

        this.logger.log(
            `Medicamento creado: ${medicamento.nombre} (ID: ${medicamento.id})`,
        );

        return this.mapToResponseDto(medicamento);
    }

    /**
     * Obtiene todos los medicamentos
     * @returns Lista de medicamentos
     */
    async findAll(): Promise<MedicamentoResponseDto[]> {
        const medicamentos = await this.medicamentosRepository.findAll();
        return medicamentos.map((m) => this.mapToResponseDto(m));
    }

    /**
     * Obtiene un medicamento por ID
     * @param id - ID del medicamento
     * @returns El medicamento encontrado
     */
    async findById(id: number): Promise<MedicamentoResponseDto> {
        const medicamento = await this.medicamentosRepository.findById(id);

        if (!medicamento) {
            throw new NotFoundException(
                `Medicamento con ID ${id} no encontrado`,
            );
        }

        return this.mapToResponseDto(medicamento);
    }

    /**
     * Actualiza un medicamento existente
     * @param id - ID del medicamento
     * @param dto - Datos a actualizar
     * @returns El medicamento actualizado
     */
    async update(
        id: number,
        dto: UpdateMedicamentoDto,
    ): Promise<MedicamentoResponseDto> {
        // 1. Verificar que el medicamento exista
        const medicamento = await this.medicamentosRepository.findById(id);

        if (!medicamento) {
            throw new NotFoundException(
                `Medicamento con ID ${id} no encontrado`,
            );
        }

        // 2. Si se quiere cambiar la presentación, validar que exista
        if (dto.presentacionId) {
            const presentacionExiste =
                await this.medicamentosRepository.existsPresentacion(
                    dto.presentacionId,
                );

            if (!presentacionExiste) {
                throw new BadRequestException(
                    `La presentación con ID ${dto.presentacionId} no existe`,
                );
            }
        }

        // 3. Si se cambia nombre o principio activo, verificar duplicados
        if (dto.nombre || dto.principioActivo) {
            const nombreFinal = dto.nombre ?? medicamento.nombre;
            const principioFinal =
                dto.principioActivo ?? medicamento.principioActivo;

            const existe =
                await this.medicamentosRepository.existsByNombreYPrincipio(
                    nombreFinal,
                    principioFinal,
                    id, // Excluir el medicamento actual
                );

            if (existe) {
                throw new ConflictException(
                    `Ya existe otro medicamento con el nombre "${nombreFinal}" y principio activo "${principioFinal}"`,
                );
            }
        }

        // 4. Actualizar solo los campos que vienen definidos
        const updateData: Partial<MedicamentoEntity> = {};

        if (dto.nombre) updateData.nombre = dto.nombre;
        if (dto.principioActivo)
            updateData.principioActivo = dto.principioActivo;
        if (dto.concentracion !== undefined)
            updateData.concentracion = dto.concentracion;
        if (dto.presentacionId) updateData.presentacionId = dto.presentacionId;

        const actualizado = await this.medicamentosRepository.update(
            id,
            updateData,
        );

        this.logger.log(`Medicamento actualizado: ID ${id}`);

        return this.mapToResponseDto(actualizado);
    }

    /**
     * Elimina un medicamento
     * @param id - ID del medicamento a eliminar
     */
    async delete(id: number): Promise<void> {
        // Verificar que exista
        const medicamento = await this.medicamentosRepository.findById(id);

        if (!medicamento) {
            throw new NotFoundException(
                `Medicamento con ID ${id} no encontrado`,
            );
        }

        await this.medicamentosRepository.delete(id);

        this.logger.log(`Medicamento eliminado: ID ${id}`);
    }

    /**
     * Obtiene todas las presentaciones de medicamentos
     * @returns Lista de presentaciones
     */
    async findAllPresentaciones(): Promise<PresentacionResponseDto[]> {
        const presentaciones =
            await this.medicamentosRepository.findAllPresentaciones();

        return presentaciones.map((p) => ({
            id: p.id,
            nombre: p.nombre,
        }));
    }

    /**
     * Mapea una entidad a DTO de respuesta
     */
    private mapToResponseDto(
        medicamento: MedicamentoEntity,
    ): MedicamentoResponseDto {
        return {
            id: medicamento.id,
            nombre: medicamento.nombre,
            principioActivo: medicamento.principioActivo,
            concentracion: medicamento.concentracion,
            presentacion: {
                id: medicamento.presentacion.id,
                nombre: medicamento.presentacion.nombre,
            },
        };
    }

    // ==================== CRUD PRESENTACIONES ====================

    /**
     * Crea una nueva presentación de medicamento
     * @param dto - Datos de la presentación a crear
     * @returns La presentación creada
     */
    async createPresentacion(
        dto: CreatePresentacionDto,
    ): Promise<PresentacionResponseDto> {
        // Verificar que no exista una presentación con el mismo nombre
        const existe =
            await this.medicamentosRepository.existsPresentacionByNombre(
                dto.nombre,
            );

        if (existe) {
            throw new ConflictException(
                `Ya existe una presentación con el nombre "${dto.nombre}"`,
            );
        }

        const presentacion =
            await this.medicamentosRepository.createPresentacion(dto.nombre);

        this.logger.log(
            `Presentación creada: ${presentacion.nombre} (ID: ${presentacion.id})`,
        );

        return {
            id: presentacion.id,
            nombre: presentacion.nombre,
        };
    }

    /**
     * Obtiene una presentación por ID
     * @param id - ID de la presentación
     * @returns La presentación encontrada
     */
    async findPresentacionById(id: number): Promise<PresentacionResponseDto> {
        const presentacion =
            await this.medicamentosRepository.findPresentacionById(id);

        if (!presentacion)
            throw new NotFoundException(
                `Presentación con ID ${id} no encontrada`,
            );

        return {
            id: presentacion.id,
            nombre: presentacion.nombre,
        };
    }

    /**
     * Actualiza una presentación existente
     * @param id - ID de la presentación
     * @param dto - Datos a actualizar
     * @returns La presentación actualizada
     */
    async updatePresentacion(
        id: number,
        dto: UpdatePresentacionDto,
    ): Promise<PresentacionResponseDto> {
        // Verificar que la presentación exista
        const presentacionActual =
            await this.medicamentosRepository.findPresentacionById(id);

        if (!presentacionActual) {
            throw new NotFoundException(
                `Presentación con ID ${id} no encontrada`,
            );
        }

        // Si se cambia el nombre, verificar que no exista otro con ese nombre
        if (dto.nombre) {
            const existe =
                await this.medicamentosRepository.existsPresentacionByNombre(
                    dto.nombre,
                    id,
                );

            if (existe) {
                throw new ConflictException(
                    `Ya existe otra presentación con el nombre "${dto.nombre}"`,
                );
            }
        }

        const nombreFinal = dto.nombre ?? presentacionActual.nombre;
        const actualizada =
            await this.medicamentosRepository.updatePresentacion(
                id,
                nombreFinal,
            );

        this.logger.log(`Presentación actualizada: ID ${id}`);

        return {
            id: actualizada.id,
            nombre: actualizada.nombre,
        };
    }

    /**
     * Elimina una presentación
     * @param id - ID de la presentación a eliminar
     */
    async deletePresentacion(id: number): Promise<void> {
        // Verificar que la presentación exista
        const presentacion =
            await this.medicamentosRepository.findPresentacionById(id);

        if (!presentacion) {
            throw new NotFoundException(
                `Presentación con ID ${id} no encontrada`,
            );
        }

        // TODO: Verificar que no haya medicamentos usando esta presentación
        // antes de eliminar (integrity constraint)

        await this.medicamentosRepository.deletePresentacion(id);

        this.logger.log(`Presentación eliminada: ID ${id}`);
    }
}
