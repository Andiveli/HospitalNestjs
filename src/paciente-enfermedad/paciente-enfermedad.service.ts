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

@Injectable()
export class PacienteEnfermedadService {
    constructor(
        @InjectRepository(PacienteEnfermedadEntity)
        private readonly pacienteEnfermedadRepository: Repository<PacienteEnfermedadEntity>,
    ) {}

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

    async findAll(): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

    async findByPaciente(
        pacienteId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            where: { pacienteId },
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

    async findByEnfermedad(
        enfermedadId: number,
    ): Promise<PacienteEnfermedadEntity[]> {
        return await this.pacienteEnfermedadRepository.find({
            where: { enfermedadId },
            relations: ['paciente', 'enfermedad', 'tipoEnfermedad'],
        });
    }

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
                'Relación paciente-enfermedad no encontrada',
            );
        }

        return relation;
    }

    async update(
        pacienteId: number,
        enfermedadId: number,
        updateDto: UpdatePacienteEnfermedadDto,
    ): Promise<PacienteEnfermedadEntity> {
        const relation = await this.findOne(pacienteId, enfermedadId);

        Object.assign(relation, updateDto);
        return await this.pacienteEnfermedadRepository.save(relation);
    }

    async remove(pacienteId: number, enfermedadId: number): Promise<void> {
        const relation = await this.findOne(pacienteId, enfermedadId);
        await this.pacienteEnfermedadRepository.remove(relation);
    }
}
