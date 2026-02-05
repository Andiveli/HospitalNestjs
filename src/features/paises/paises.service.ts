import {
    ConflictException,
    Injectable,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { PaisEntity } from './paises.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaisDto, UpdatePaisDto } from './dto/pais.dto';
import { PaisResponseDto } from './dto/pais-response.dto';

@Injectable()
export class PaisesService {
    private readonly logger = new Logger(PaisesService.name);

    constructor(
        @InjectRepository(PaisEntity)
        private paisRepository: Repository<PaisEntity>,
    ) {}

    /**
     * Crea un nuevo país
     * @param dto - Datos del país a crear
     * @returns El país creado
     */
    async crearPais(dto: CreatePaisDto): Promise<PaisResponseDto> {
        // Verificar que no exista un país con el mismo nombre (case insensitive)
        const existe = await this.paisRepository
            .createQueryBuilder('pais')
            .where('LOWER(pais.nombre) = LOWER(:nombre)', {
                nombre: dto.nombre,
            })
            .getOne();

        if (existe) {
            throw new ConflictException(
                `Ya existe un país con el nombre "${dto.nombre}"`,
            );
        }

        const pais = this.paisRepository.create({ nombre: dto.nombre });
        const guardado = await this.paisRepository.save(pais);

        this.logger.log(`País creado: ${guardado.nombre} (ID: ${guardado.id})`);

        return {
            id: guardado.id,
            nombre: guardado.nombre,
        };
    }

    /**
     * Obtiene todos los países
     * @returns Lista de países ordenados por nombre
     */
    async listarPaises(): Promise<PaisResponseDto[]> {
        const paises = await this.paisRepository.find({
            order: { nombre: 'ASC' },
        });

        return paises.map((p) => ({
            id: p.id,
            nombre: p.nombre,
        }));
    }

    /**
     * Obtiene un país por ID
     * @param id - ID del país
     * @returns El país encontrado
     */
    async findById(id: number): Promise<PaisResponseDto> {
        const pais = await this.paisRepository.findOne({ where: { id } });

        if (!pais) {
            throw new NotFoundException(`País con ID ${id} no encontrado`);
        }

        return {
            id: pais.id,
            nombre: pais.nombre,
        };
    }

    /**
     * Actualiza un país existente
     * @param id - ID del país
     * @param dto - Datos a actualizar
     * @returns El país actualizado
     */
    async updatePais(id: number, dto: UpdatePaisDto): Promise<PaisResponseDto> {
        // Verificar que el país exista
        const paisActual = await this.paisRepository.findOne({ where: { id } });

        if (!paisActual) {
            throw new NotFoundException(`País con ID ${id} no encontrado`);
        }

        // Si se cambia el nombre, verificar que no exista otro con ese nombre
        if (dto.nombre) {
            const existe = await this.paisRepository
                .createQueryBuilder('pais')
                .where('LOWER(pais.nombre) = LOWER(:nombre)', {
                    nombre: dto.nombre,
                })
                .andWhere('pais.id != :id', { id })
                .getOne();

            if (existe) {
                throw new ConflictException(
                    `Ya existe otro país con el nombre "${dto.nombre}"`,
                );
            }
        }

        const nombreFinal = dto.nombre ?? paisActual.nombre;
        await this.paisRepository.update(id, { nombre: nombreFinal });

        const actualizado = await this.findById(id);

        this.logger.log(`País actualizado: ID ${id}`);

        return actualizado;
    }

    /**
     * Elimina un país
     * @param id - ID del país a eliminar
     */
    async deletePais(id: number): Promise<void> {
        // Verificar que el país exista
        const pais = await this.paisRepository.findOne({ where: { id } });

        if (!pais) {
            throw new NotFoundException(`País con ID ${id} no encontrado`);
        }

        // TODO: Verificar que no haya dependencias (provincias, ciudades, etc.)
        // antes de eliminar

        await this.paisRepository.delete(id);

        this.logger.log(`País eliminado: ID ${id}`);
    }
}
