import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
    CreateTipoEnfermedadDto,
    TipoEnfermedadResponseDto,
    TiposEnfermedadListResponseDto,
    UpdateTipoEnfermedadDto,
} from './dto';
import { TiposEnfermedadEntity } from './tipo-enfermedad.entity';

/**
 * Servicio para gestionar tipos de enfermedad
 * Contiene la lógica de negocio para operaciones CRUD
 */
@Injectable()
export class TipoEnfermedadService {
    constructor(
        @InjectRepository(TiposEnfermedadEntity)
        private readonly tipoRepository: Repository<TiposEnfermedadEntity>,
    ) {}

    /**
     * Crea un nuevo tipo de enfermedad
     * @param createDto Datos del tipo de enfermedad a crear
     * @returns Respuesta con el tipo de enfermedad creado
     * @throws ConflictException si ya existe un tipo con ese nombre
     */
    async createTipoEnfermedad(
        createDto: CreateTipoEnfermedadDto,
    ): Promise<TipoEnfermedadResponseDto> {
        const { nombre } = createDto;
        const existe = await this.tipoRepository.findOne({ where: { nombre } });

        if (existe) {
            throw new ConflictException('El tipo de enfermedad ya existe');
        }

        const nuevoTipo = this.tipoRepository.create(createDto);
        const resultado = await this.tipoRepository.save(nuevoTipo);

        return {
            message: 'Tipo de enfermedad creado correctamente',
            data: resultado,
        };
    }

    /**
     * Obtiene todos los tipos de enfermedad
     * @returns Lista de tipos de enfermedad
     */
    async getTiposEnfermedad(): Promise<TiposEnfermedadListResponseDto> {
        const listaTipos = await this.tipoRepository.find();

        return {
            message:
                listaTipos.length === 0
                    ? 'No hay tipos de enfermedades registrados aún'
                    : 'Lista de tipos de enfermedad',
            data: listaTipos,
        };
    }

    /**
     * Obtiene un tipo de enfermedad por su ID
     * @param id ID del tipo de enfermedad
     * @returns Tipo de enfermedad encontrado
     * @throws NotFoundException si no se encuentra el tipo
     */
    async getTipoEnfermedadById(
        id: number,
    ): Promise<TipoEnfermedadResponseDto> {
        const tipo = await this.tipoRepository.findOne({ where: { id } });

        if (!tipo) {
            throw new NotFoundException('Tipo de enfermedad no encontrado');
        }

        return {
            message: 'Tipo de enfermedad encontrado',
            data: tipo,
        };
    }

    /**
     * Actualiza un tipo de enfermedad existente
     * @param id ID del tipo de enfermedad a actualizar
     * @param updateDto Datos a actualizar
     * @returns Tipo de enfermedad actualizado
     * @throws NotFoundException si no se encuentra el tipo
     */
    async updateTipoEnfermedad(
        id: number,
        updateDto: UpdateTipoEnfermedadDto,
    ): Promise<TipoEnfermedadResponseDto> {
        const tipo = await this.tipoRepository.findOne({ where: { id } });

        if (!tipo) {
            throw new NotFoundException('Tipo de enfermedad no encontrado');
        }

        Object.assign(tipo, updateDto);
        const resultado = await this.tipoRepository.save(tipo);

        return {
            message: 'Tipo de enfermedad actualizado correctamente',
            data: resultado,
        };
    }
}
