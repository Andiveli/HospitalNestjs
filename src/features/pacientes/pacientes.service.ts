import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommonService } from 'src/common/common.service';
import { Repository } from 'typeorm';
import { EstiloVidaEntity } from '../estilo-vida/estilo-vida.entity';
import { PacienteEnfermedadEntity } from '../paciente-enfermedad/paciente-enfermedad.entity';
import { PaisEntity } from '../paises/paises.entity';
import { PeopleEntity } from '../people/people.entity';
import { GrupoSanguineoEntity } from '../sangre/sangre.entity';
import { InfoDto } from './dto/info.dto';
import { PerfilPaciente } from './dto/perfil.dto';
import { PacientesEntity } from './pacientes.entity';

@Injectable()
export class PacientesService {
    constructor(
        @InjectRepository(PacientesEntity)
        private pacientesRepository: Repository<PacientesEntity>,
        @InjectRepository(PeopleEntity)
        private peopleRepository: Repository<PeopleEntity>,
        @InjectRepository(PaisEntity)
        private paises: Repository<PaisEntity>,
        @InjectRepository(EstiloVidaEntity)
        private vida: Repository<EstiloVidaEntity>,
        @InjectRepository(GrupoSanguineoEntity)
        private sangre: Repository<GrupoSanguineoEntity>,
        private readonly commonService: CommonService,
    ) {}

    async addInfo(info: InfoDto, email: string) {
        const { fecha, telefono, residencia, pais, sangre, estiloVida } = info;
        const user = await this.peopleRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Usuario no encontrado');
        const paisUser = await this.paises.findOne({ where: { nombre: pais } });
        if (!paisUser) throw new NotFoundException('Pais no encontrado');
        const vidaUser = await this.vida.findOne({
            where: { nombre: estiloVida },
        });
        if (!vidaUser)
            throw new NotFoundException('Estilo de vida no permitido');
        const sangreUser = await this.sangre.findOne({
            where: { nombre: sangre },
        });
        if (!sangreUser)
            throw new NotFoundException('Grupo sanguineo no encontrado');
        const paciente = this.pacientesRepository.create({
            usuarioId: user.id,
            fechaNacimiento: fecha,
            pais: paisUser,
            lugarResidencia: residencia,
            numeroCelular: telefono,
            grupoSanguineo: sangreUser,
            estiloVida: vidaUser,
        });
        return await this.pacientesRepository.save(paciente);
    }

    async getInfo(id: number): Promise<PerfilPaciente> {
        const paciente = await this.pacientesRepository.findOne({
            where: {
                person: { id },
            },
            relations: [
                'person',
                'person.genero',
                'pais',
                'grupoSanguineo',
                'estiloVida',
                'pacienteEnfermedades',
                'pacienteEnfermedades.enfermedad',
                'pacienteEnfermedades.tipoEnfermedad',
            ],
        });
        if (!paciente) throw new NotFoundException('Paciente no encontrado');
        return this.formatearDatos(paciente);
    }

    private formatearDatos(paciente: PacientesEntity): PerfilPaciente {
        const {
            person,
            pais,
            grupoSanguineo,
            estiloVida,
            pacienteEnfermedades,
        } = paciente;

        const enfermedades = this.formatearSick(pacienteEnfermedades);

        return {
            nombres: `${person.primerNombre} ${person.segundoNombre || ''} ${person.primerApellido} ${person.segundoApellido || ''}`,
            edad: this.commonService.calcularEdad(paciente.fechaNacimiento),
            email: person.email,
            telefono: paciente.numeroCelular,
            pais: pais.nombre,
            genero: person.genero.nombre,
            residencia: paciente.lugarResidencia,
            sangre: grupoSanguineo.nombre,
            estilo: estiloVida.nombre,
            imagen: person.imageUrl,
            cedula: person.cedula,
            enfermedades,
        };
    }

    private formatearSick(pacienteEnfermedades: PacienteEnfermedadEntity[]) {
        return (
            pacienteEnfermedades?.reduce(
                (acc: Record<string, string>, relacion) => {
                    if (relacion.enfermedad && relacion.tipoEnfermedad) {
                        acc[relacion.enfermedad.nombre] =
                            relacion.tipoEnfermedad.nombre;
                    }
                    return acc;
                },
                {},
            ) || {}
        );
    }
}
