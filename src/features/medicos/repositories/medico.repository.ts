import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EspecialidadEntity } from 'src/features/especialidad/especialidad.entity';
import { MedicoEspecialidadEntity } from 'src/features/especialidad/medico-especialidad.entity';
import { DiaAtencionEntity } from 'src/features/horario/dia-atencion.entity';
import { HorarioMedicoEntity } from 'src/features/horario/horario-medico.entity';
import { Repository } from 'typeorm';
import {
    EspecialidadResponseDto,
    HorarioResponseDto,
    MedicoResponseDto,
} from '../dto/medico-response.dto';
import { MedicoEntity } from '../medicos.entity';

@Injectable()
export class MedicoRepository {
    constructor(
        @InjectRepository(MedicoEntity)
        public readonly medicoRepository: Repository<MedicoEntity>,
        @InjectRepository(EspecialidadEntity)
        private readonly especialidadRepository: Repository<EspecialidadEntity>,
        @InjectRepository(MedicoEspecialidadEntity)
        private readonly medicoEspecialidadRepository: Repository<MedicoEspecialidadEntity>,
        @InjectRepository(HorarioMedicoEntity)
        private readonly horarioRepository: Repository<HorarioMedicoEntity>,
        @InjectRepository(DiaAtencionEntity)
        private readonly diaRepository: Repository<DiaAtencionEntity>,

        // private readonly commonService: CommonService,
    ) {}

    async createMedico(
        usuarioId: number,
        licenciaMedica: string,
        pasaporte?: string,
    ): Promise<MedicoEntity> {
        const medico = this.medicoRepository.create({
            usuarioId,
            licenciaMedica,
            pasaporte: pasaporte || undefined,
        });
        return await this.medicoRepository.save(medico);
    }

    async findByIdWithRelations(
        usuarioId: number,
    ): Promise<MedicoEntity | null> {
        return await this.medicoRepository.findOne({
            where: { usuarioId },
            relations: [
                'persona',
                'especialidades',
                'medicoEspecialidades',
                'medicoEspecialidades.especialidad',
                'horarios',
                'horarios.dia',
                'citas',
                'citas.estado',
            ],
        });
    }

    async findAll(
        page: number = 1,
        limit: number = 10,
    ): Promise<[MedicoEntity[], number]> {
        return await this.medicoRepository.findAndCount({
            relations: [
                'persona',
                'especialidades',
                'medicoEspecialidades',
                'medicoEspecialidades.especialidad',
                'horarios',
                'horarios.dia',
            ],
            skip: (page - 1) * limit,
            take: limit,
        });
    }

    async addEspecialidadesToMedico(
        medicoId: number,
        especialidades: { especialidadNombre: string; principal?: boolean }[],
    ): Promise<void> {
        for (const esp of especialidades) {
            const especialidad = await this.findEspecialidadByNombre(
                esp.especialidadNombre,
            );
            if (!especialidad) {
                throw new Error(
                    `La especialidad con nombre '${esp.especialidadNombre}' no existe`,
                );
            }
            const medicoEspecialidad = this.medicoEspecialidadRepository.create(
                {
                    medicoId,
                    especialidadId: especialidad.id,
                    principal: esp.principal || false,
                },
            );
            await this.medicoEspecialidadRepository.save(medicoEspecialidad);
        }
    }

    async addHorariosToMedico(
        medicoId: number,
        horarios: { diaNombre: string; horaInicio: string; horaFin: string }[],
    ): Promise<void> {
        for (const horario of horarios) {
            const dia = await this.findDiaByNombre(horario.diaNombre);
            if (!dia) {
                throw new Error(
                    `El día con nombre '${horario.diaNombre}' no existe`,
                );
            }
            const horarioMedico = this.horarioRepository.create({
                medico: { usuarioId: medicoId } as MedicoEntity,
                dia: dia,
                horaInicio: horario.horaInicio,
                horaFin: horario.horaFin,
            });
            await this.horarioRepository.save(horarioMedico);
        }
    }

    async removeEspecialidadesFromMedico(medicoId: number): Promise<void> {
        await this.medicoEspecialidadRepository.delete({ medicoId });
    }

    async removeHorariosFromMedico(medicoId: number): Promise<void> {
        // Buscar todos los horarios del médico y eliminarlos
        const horarios = await this.horarioRepository.find({
            where: { medico: { usuarioId: medicoId } },
        });
        await this.horarioRepository.remove(horarios);
    }

    async getAvailableEspecialidades(): Promise<EspecialidadEntity[]> {
        return await this.especialidadRepository.find();
    }

    async getAvailableDias(): Promise<DiaAtencionEntity[]> {
        return await this.diaRepository.find();
    }

    async findEspecialidadByNombre(
        nombre: string,
    ): Promise<EspecialidadEntity | null> {
        return await this.especialidadRepository.findOne({
            where: { nombre },
        });
    }

    async findDiaByNombre(nombre: string): Promise<DiaAtencionEntity | null> {
        return await this.diaRepository.findOne({
            where: { nombre },
        });
    }
    countCitasAtendidas(m: MedicoEntity): number {
        return (
            m.citas?.filter((c) => c.estado.nombre === 'Atendidas').length || 0
        );
    }

    mapToDto(medico: MedicoEntity): MedicoResponseDto {
        const especialidadesDto: EspecialidadResponseDto[] =
            medico.medicoEspecialidades?.map(
                (me: MedicoEspecialidadEntity) => ({
                    nombre: me.especialidad.nombre,
                    principal: me.principal,
                }),
            ) || [];

        const horariosDto: HorarioResponseDto[] =
            medico.horarios?.map((h: HorarioMedicoEntity) => ({
                dia: h.dia?.nombre || `Día ${h.dia?.id}`,
                horaInicio: h.horaInicio,
                horaFin: h.horaFin,
            })) || [];

        return {
            nombreCompleto:
                `${medico.persona.primerNombre} ${medico.persona.segundoNombre || ''} ${medico.persona.primerApellido} ${medico.persona.segundoApellido || ''}`.trim(),
            email: medico.persona.email,
            cedula: medico.persona.cedula,
            licenciaMedica: medico.licenciaMedica,
            pasaporte: medico.pasaporte || undefined,
            especialidades: especialidadesDto,
            horarios: horariosDto,
            citasAtendidas: this.countCitasAtendidas(medico),
        };
    }
}
