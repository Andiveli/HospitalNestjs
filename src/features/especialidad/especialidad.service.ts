import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { CreateEspecialidadDto } from './dto/create-especialidad.dto';
import {
    CreateEspecialidadResponseDto,
    GetEspecialidadesResponseDto,
} from './dto/especialidad-response.dto';
import { UpdateEspecialidadDto } from './dto/update-especialidad.dto';
import { EspecialidadRepository } from './repositories/especialidad.repository';

/**
 * Servicio para gestionar especialidades médicas
 * Proporciona operaciones CRUD y validaciones para especialidades
 */
@Injectable()
export class EspecialidadService {
    /**
     * Constructor del servicio de especialidades
     * @param especialidadRepository Repositorio de especialidades
     */
    constructor(
        private readonly especialidadRepository: EspecialidadRepository,
    ) {}

    /**
     * Crea una nueva especialidad médica
     * @param createDto Datos para crear la especialidad
     * @returns Especialidad creada
     * @throws ConflictException Si ya existe una especialidad con ese nombre
     */
    async createEspecialidad(
        createDto: CreateEspecialidadDto,
    ): Promise<CreateEspecialidadResponseDto> {
        const existing = await this.especialidadRepository.findByName(
            createDto.nombre,
        );

        if (existing)
            throw new ConflictException(
                'Ya existe una especialidad con ese nombre',
            );

        const especialidad =
            await this.especialidadRepository.create(createDto);

        return {
            message: 'Especialidad creada correctamente',
            data: this.especialidadRepository.mapToDto(especialidad),
        };
    }

    /**
     * Obtiene una lista paginada de especialidades
     * @param page Número de página (por defecto 1)
     * @param limit Límite de resultados por página (por defecto 10)
     * @returns Lista paginada de especialidades
     */
    async getEspecialidades(
        page: number = 1,
        limit: number = 10,
    ): Promise<GetEspecialidadesResponseDto> {
        const [especialidades, total] =
            await this.especialidadRepository.findAll(page, limit);

        const especialidadesDto = especialidades.map((esp) =>
            this.especialidadRepository.mapToDto(esp),
        );

        return {
            message: 'Especialidades recuperadas correctamente',
            data: especialidadesDto,
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    /**
     * Obtiene una especialidad por su ID
     * @param id ID de la especialidad
     * @returns Especialidad encontrada
     * @throws NotFoundException Si no se encuentra la especialidad
     */
    async getEspecialidadById(
        id: number,
    ): Promise<CreateEspecialidadResponseDto> {
        const especialidad = await this.especialidadRepository.findById(id);

        if (!especialidad)
            throw new NotFoundException('Especialidad no encontrada');

        return {
            message: 'Especialidad recuperada correctamente',
            data: this.especialidadRepository.mapToDto(especialidad),
        };
    }

    /**
     * Actualiza una especialidad existente
     * @param id ID de la especialidad a actualizar
     * @param updateDto Datos a actualizar
     * @returns Especialidad actualizada
     * @throws NotFoundException Si no se encuentra la especialidad
     * @throws ConflictException Si ya existe otra especialidad con el mismo nombre
     * @throws BadRequestException Si no se proporcionan campos para actualizar
     */
    async updateEspecialidad(
        id: number,
        updateDto: UpdateEspecialidadDto,
    ): Promise<CreateEspecialidadResponseDto> {
        const existing = await this.especialidadRepository.findById(id);
        if (!existing)
            throw new NotFoundException('Especialidad no encontrada');

        if (!updateDto.nombre && !updateDto.descripcion)
            throw new BadRequestException(
                'Debe proporcionar al menos un campo para actualizar',
            );

        if (updateDto.nombre && updateDto.nombre !== existing.nombre) {
            const nameExists = await this.especialidadRepository.findByName(
                updateDto.nombre,
            );
            if (nameExists) {
                throw new ConflictException(
                    'Ya existe una especialidad activa con ese nombre',
                );
            }
        }

        const updated = await this.especialidadRepository.update(id, updateDto);
        if (!updated)
            throw new NotFoundException('Error al actualizar la especialidad');

        return {
            message: 'Especialidad actualizada correctamente',
            data: this.especialidadRepository.mapToDto(updated),
        };
    }

    /**
     * Elimina una especialidad del sistema (soft delete)
     * @param id ID de la especialidad a eliminar
     * @returns Mensaje de confirmación
     * @throws NotFoundException Si no se encuentra la especialidad
     */
    async deleteEspecialidad(id: number): Promise<{ message: string }> {
        const especialidad = await this.especialidadRepository.findById(id);
        if (!especialidad)
            throw new NotFoundException('Especialidad no encontrada');

        if (!especialidad.activo) {
            throw new BadRequestException(
                'La especialidad ya se encuentra inactiva',
            );
        }

        await this.especialidadRepository.delete(id);

        return { message: 'Especialidad eliminada correctamente' };
    }
}
