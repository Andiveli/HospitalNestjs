import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddMedicoDto, PerfilMedico } from './dto/addmedico.dto';
import { MedicoEntity } from './medicos.entity';
import { HorarioMedicoEntity } from 'src/horario/horario-medico.entity';

@Injectable()
export class MedicosService {
    constructor(
        @InjectRepository(MedicoEntity)
        private medicoRepository: Repository<MedicoEntity>,
    ) {}

    async addInfo(body: AddMedicoDto) {
        const created = this.medicoRepository.create(body);
        await this.medicoRepository.save(created);
    }

    async myInfo(id: number): Promise<PerfilMedico> {
        const medico = await this.medicoRepository.findOne({
            where: { usuarioId: id },
            relations: [
                'persona',
                'medicoEspecialidades',
                'medicoEspecialidades.especialidad',
                'horarios',
                'horarios.dia',
            ],
        });
        if (!medico) throw new NotFoundException('Médico no encontrado');
        return this.mapToDto(medico);
    }

    private mapToDto(medico: MedicoEntity): PerfilMedico {
        // Obtener especialidad principal desde la tabla intermedia
        const especialidadPrincipal =
            medico.medicoEspecialidades?.find((me) => me.principal)
                ?.especialidad ||
            medico.medicoEspecialidades?.[0]?.especialidad;
        const especialidadNombre =
            especialidadPrincipal?.nombre || 'Sin especialidad definida';
        return {
            nombre: `${medico.persona.primerNombre} ${medico.persona.segundoNombre || ''} ${medico.persona.primerApellido} ${medico.persona.segundoApellido || ''}`.trim(),
            edad: 50,
            correo: medico.persona.email,
            especialidad: especialidadNombre,
            consultasAtendidas: 0,
            horarioAtencion: this.formatearHorario(medico.horarios || []),
        };
    }

    private formatearHorario(
        horarios: HorarioMedicoEntity[],
    ): Record<string, string> {
        const horarioFormateado: Record<string, string> = {};
        horarios.forEach((horario) => {
            const diaNombre = horario.dia?.nombre || `Día ${horario.dia.id}`;
            const rangoHorario = `${horario.horaInicio} - ${horario.horaFin}`;
            horarioFormateado[diaNombre] = rangoHorario;
        });
        return horarioFormateado;
    }
}
