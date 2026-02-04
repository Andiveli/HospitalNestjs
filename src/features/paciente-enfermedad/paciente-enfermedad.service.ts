import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacienteEnfermedadEntity } from './paciente-enfermedad.entity';
import { CreatePacienteEnfermedadDto } from './dto/create.dto';
import { UpdatePacienteEnfermedadDto } from './dto/update.dto';

/**
 * Servicio para gestionar la relación entre pacientes y enfermedades
 * Maneja la asociación de enfermedades, alergias y antecedentes a pacientes
 */
@Injectable()
export class PacienteEnfermedadService {
    constructor(
        @InjectRepository(PacienteEnfermedadEntity)
        private readonly pacienteEnfermedadRepository: Repository<PacienteEnfermedadEntity>,
    ) {}

    /**
     * Crea una nueva relación paciente-enfermedad
     * @param createDto - Datos de la relación a crear
     * @returns La relación creada
     * @throws ConflictException si la relación ya existe
     */
    async create(
        createDto: CreatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        const existing = await this.pacienteEnfermedadRepository.findOne({
            where: {
                pacienteId: createDto.pacienteId,
                enfermedadId: createDto.enfermedadId,
            },
        });

        if (existing) {
            throw new ConflictException(
                'El paciente ya tiene esta enfermedad registrada',
            );
        }

        const newRelation = this.pacienteEnfermedadRepository.create(createDto);
        return await this.pacienteEnfermedadRepository.save(newRelation);
    }

    /**
     * Obtiene todas las relaciones paciente-enfermedad
     * @returns Lista de todas las relaciones con sus relaciones cargadas
     */
    async findAll(): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

    /**
     * Obtiene las enfermedades de un paciente específico
     * @param pacienteId - ID del paciente
     * @returns Lista de relaciones del paciente
     */
    async findByPaciente(
        pacienteId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            where: { pacienteId },
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

    /**
     * Obtiene los pacientes con una enfermedad específica
     * @param enfermedadId - ID de la enfermedad
     * @returns Lista de relaciones con esa enfermedad
     */
    async findByEnfermedad(
        enfermedadId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            where: { enfermedadId },
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

    /**
     * Obtiene una relación específica por IDs compuestos
     * @param pacienteId - ID del paciente
     * @param enfermedadId - ID de la enfermedad
     * @returns La relación encontrada
     * @throws NotFoundException si no existe la relación
     */
    async findOne(
        pacienteId: number,
        enfermedadId: number,
    ): Promise<PacienteEnfermedadEntity> {
        const relation = await this.pacienteEnfermedadRepository.findOne({
            where: { pacienteId, enfermedadId },
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });

        if (!relation) {
            throw new NotFoundException(
                `Relación paciente ${pacienteId} - enfermedad ${enfermedadId} no encontrada`,
            );
        }

        return relation;
    }

    /**
     * Actualiza una relación paciente-enfermedad
     * @param pacienteId - ID del paciente
     * @param enfermedadId - ID de la enfermedad
     * @param updateDto - Datos a actualizar
     * @returns La relación actualizada
     * @throws NotFoundException si no existe la relación
     */
    async update(
        pacienteId: number,
        enfermedadId: number,
        updateDto: UpdatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        const relation = await this.findOne(pacienteId, enfermedadId);

        // Actualizar solo el campo detalle si se proporciona
        if (updateDto.detalle !== undefined) {
            relation.detalle = updateDto.detalle;
        }

        return await this.pacienteEnfermedadRepository.save(relation);
    }

    /**
     * Elimina una relación paciente-enfermedad
     * @param pacienteId - ID del paciente
     * @param enfermedadId - ID de la enfermedad
     * @throws NotFoundException si no existe la relación
     */
    async remove(pacienteId: number, enfermedadId: number): Promise<void> {
        const relation = await this.findOne(pacienteId, enfermedadId);
        await this.pacienteEnfermedadRepository.remove(relation);
    }
}
