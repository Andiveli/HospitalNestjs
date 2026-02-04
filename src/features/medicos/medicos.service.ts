import {
    Injectable,
    NotFoundException,
    BadRequestException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AssignMedicoDto } from './dto/assign-medico.dto';
import {
    CreateMedicoResponseDto,
    GetMedicosResponseDto,
} from './dto/medico-response.dto';
import { EspecialidadCatalogoDto } from './dto/especialidad-catalogo.dto';
import { DiaCatalogoDto } from './dto/dia-catalogo.dto';
import { MedicoRepository } from './repositories/medico.repository';
import { PeopleEntity } from '../people/people.entity';
import { RolesEntity } from '../roles/roles.entity';
import { Rol } from '../roles/roles.enum';

@Injectable()
export class MedicosService {
    constructor(
        private readonly medicoRepository: MedicoRepository,
        @InjectRepository(PeopleEntity)
        private readonly peopleRepository: Repository<PeopleEntity>,
        @InjectRepository(RolesEntity)
        private readonly rolesRepository: Repository<RolesEntity>,
    ) {}

    async assignMedico(
        assignMedicoDto: AssignMedicoDto,
    ): Promise<CreateMedicoResponseDto> {
        const {
            usuarioId,
            licenciaMedica,
            pasaporte,
            especialidades,
            horarios,
        } = assignMedicoDto;

        const usuario = await this.peopleRepository.findOne({
            where: { id: usuarioId },
            relations: ['roles'],
        });

        if (!usuario) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const existingMedico =
            await this.medicoRepository.findByIdWithRelations(usuarioId);
        if (existingMedico) {
            throw new ConflictException(
                'El usuario ya está registrado como médico',
            );
        }

        // Validar especialidades existentes y activas
        for (const esp of especialidades) {
            const especialidad =
                await this.medicoRepository.findEspecialidadByNombre(
                    esp.especialidadNombre,
                );
            if (!especialidad) {
                throw new BadRequestException(
                    `La especialidad '${esp.especialidadNombre}' no existe o no está activa`,
                );
            }
        }

        // Validar días de atención existentes
        for (const horario of horarios) {
            const dia = await this.medicoRepository.findDiaByNombre(
                horario.diaNombre,
            );
            if (!dia) {
                throw new BadRequestException(
                    `El día con nombre '${horario.diaNombre}' no existe`,
                );
            }
        }

        const hasPrincipalEspecialidad = especialidades.some(
            (esp) => esp.principal,
        );
        if (!hasPrincipalEspecialidad) {
            throw new BadRequestException(
                'Debe especificar al menos una especialidad como principal',
            );
        }

        const principalCount = especialidades.filter(
            (esp) => esp.principal,
        ).length;
        if (principalCount > 1) {
            throw new BadRequestException(
                'Solo puede haber una especialidad principal',
            );
        }

        try {
            const medico = await this.medicoRepository.createMedico(
                usuarioId,
                licenciaMedica,
                pasaporte,
            );

            await this.medicoRepository.addEspecialidadesToMedico(
                medico.usuarioId,
                especialidades,
            );

            await this.medicoRepository.addHorariosToMedico(
                medico.usuarioId,
                horarios,
            );

            await this.assignMedicoRole(usuario);

            const medicoWithRelations =
                await this.medicoRepository.findByIdWithRelations(
                    medico.usuarioId,
                );
            if (!medicoWithRelations) {
                throw new NotFoundException(
                    'Error al recuperar el médico creado',
                );
            }

            return {
                message: 'Médico asignado correctamente',
                data: this.medicoRepository.mapToDto(medicoWithRelations),
            };
        } catch (error) {
            await this.cleanupFailedAssignment(usuarioId);
            throw error;
        }
    }

    async getMedicos(
        page: number = 1,
        limit: number = 10,
    ): Promise<GetMedicosResponseDto> {
        const [medicos, total] = await this.medicoRepository.findAll(
            page,
            limit,
        );

        const medicosDto = medicos.map((medico) =>
            this.medicoRepository.mapToDto(medico),
        );

        return {
            message: 'Médicos recuperados correctamente',
            data: medicosDto,
            meta: {
                total,
                page,
                limit,
            },
        };
    }

    async getMedicoById(usuarioId: number): Promise<CreateMedicoResponseDto> {
        const medico =
            await this.medicoRepository.findByIdWithRelations(usuarioId);

        if (!medico) {
            throw new NotFoundException('Médico no encontrado');
        }

        return {
            message: 'Médico recuperado correctamente',
            data: this.medicoRepository.mapToDto(medico),
        };
    }

    async updateMedico(
        usuarioId: number,
        assignMedicoDto: AssignMedicoDto,
    ): Promise<CreateMedicoResponseDto> {
        const existingMedico =
            await this.medicoRepository.findByIdWithRelations(usuarioId);
        if (!existingMedico) {
            throw new NotFoundException('Médico no encontrado');
        }

        const { licenciaMedica, pasaporte, especialidades, horarios } =
            assignMedicoDto;

        // Validar especialidades existentes y activas
        for (const esp of especialidades) {
            const especialidad =
                await this.medicoRepository.findEspecialidadByNombre(
                    esp.especialidadNombre,
                );
            if (!especialidad) {
                throw new BadRequestException(
                    `La especialidad '${esp.especialidadNombre}' no existe o no está activa`,
                );
            }
        }

        // Validar días de atención existentes
        for (const horario of horarios) {
            const dia = await this.medicoRepository.findDiaByNombre(
                horario.diaNombre,
            );
            if (!dia) {
                throw new BadRequestException(
                    `El día con nombre '${horario.diaNombre}' no existe`,
                );
            }
        }

        const hasPrincipalEspecialidad = especialidades.some(
            (esp) => esp.principal,
        );
        if (!hasPrincipalEspecialidad) {
            throw new BadRequestException(
                'Debe especificar al menos una especialidad como principal',
            );
        }

        const principalCount = especialidades.filter(
            (esp) => esp.principal,
        ).length;
        if (principalCount > 1) {
            throw new BadRequestException(
                'Solo puede haber una especialidad principal',
            );
        }

        try {
            existingMedico.licenciaMedica = licenciaMedica;
            existingMedico.pasaporte = pasaporte || null;
            await this.medicoRepository.medicoRepository.save(existingMedico);

            await this.medicoRepository.removeEspecialidadesFromMedico(
                usuarioId,
            );
            await this.medicoRepository.addEspecialidadesToMedico(
                usuarioId,
                especialidades,
            );

            await this.medicoRepository.removeHorariosFromMedico(usuarioId);
            await this.medicoRepository.addHorariosToMedico(
                usuarioId,
                horarios,
            );

            const updatedMedico =
                await this.medicoRepository.findByIdWithRelations(usuarioId);
            if (!updatedMedico) {
                throw new NotFoundException(
                    'Error al recuperar el médico actualizado',
                );
            }

            return {
                message: 'Médico actualizado correctamente',
                data: this.medicoRepository.mapToDto(updatedMedico),
            };
        } catch (error) {
            throw new BadRequestException(
                `Error al actualizar médico: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            );
        }
    }

    async deleteMedico(usuarioId: number): Promise<{ message: string }> {
        const medico =
            await this.medicoRepository.findByIdWithRelations(usuarioId);
        if (!medico) {
            throw new NotFoundException('Médico no encontrado');
        }

        if (!medico.activo) {
            throw new BadRequestException('El médico ya se encuentra inactivo');
        }

        try {
            // Soft delete: actualizar campo activo a false
            medico.activo = false;
            await this.medicoRepository.medicoRepository.save(medico);

            // Quitar rol de médico
            await this.removeMedicoRole(medico.persona);

            return { message: 'Médico eliminado correctamente' };
        } catch (error) {
            throw new BadRequestException(
                `Error al eliminar médico: ${error instanceof Error ? error.message : 'Error desconocido'}`,
            );
        }
    }

    private async assignMedicoRole(usuario: PeopleEntity): Promise<void> {
        const medicoRole = await this.rolesRepository.findOne({
            where: { nombre: Rol.Medico },
        });

        if (!medicoRole) {
            throw new NotFoundException('Rol de médico no encontrado');
        }

        if (!usuario.roles) {
            usuario.roles = [];
        }

        const hasMedicoRole = usuario.roles.some(
            (role) => role.nombre === 'medico',
        );
        if (!hasMedicoRole) {
            usuario.roles.push(medicoRole);
            await this.peopleRepository.save(usuario);
        }
    }

    private async removeMedicoRole(usuario: PeopleEntity): Promise<void> {
        if (!usuario.roles) return;

        usuario.roles = usuario.roles.filter(
            (role) => role.nombre !== 'medico',
        );
        await this.peopleRepository.save(usuario);
    }

    private async cleanupFailedAssignment(usuarioId: number): Promise<void> {
        try {
            await this.medicoRepository.removeEspecialidadesFromMedico(
                usuarioId,
            );
            await this.medicoRepository.removeHorariosFromMedico(usuarioId);

            const medico = await this.medicoRepository.medicoRepository.findOne(
                {
                    where: { usuarioId },
                },
            );
            if (medico) {
                await this.medicoRepository.medicoRepository.remove(medico);
            }
        } catch (error) {
            // Log error but don't throw to avoid masking the original error
            console.error(
                'Error during cleanup:',
                error instanceof Error ? error.message : 'Unknown error',
            );
        }
    }

    async getEspecialidadesDisponibles(): Promise<EspecialidadCatalogoDto[]> {
        const especialidades =
            await this.medicoRepository.getAvailableEspecialidades();
        return especialidades.map((esp) => ({
            id: esp.id,
            nombre: esp.nombre,
            descripcion: esp.descripcion || undefined,
        }));
    }

    async getDiasDisponibles(): Promise<DiaCatalogoDto[]> {
        const dias = await this.medicoRepository.getAvailableDias();
        return dias.map((dia) => ({
            id: dia.id,
            nombre: dia.nombre,
        }));
    }

    async myInfo(usuarioId: number): Promise<CreateMedicoResponseDto> {
        const medico =
            await this.medicoRepository.findByIdWithRelations(usuarioId);
        if (!medico) {
            throw new NotFoundException('Médico no encontrado');
        }

        return {
            message: 'Médico recuperado correctamente',
            data: this.medicoRepository.mapToDto(medico),
        };
    }
}
