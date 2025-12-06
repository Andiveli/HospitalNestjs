import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PacientesEntity } from './pacientes.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { InfoDto } from './dto/info.dto';
import { PaisEntity } from 'src/paises/paises.entity';
import { EstiloVidaEntity } from 'src/estilo-vida/estilo-vida.entity';
import { GrupoSanguineoEntity } from 'src/sangre/sangre.entity';
import { Cache } from 'cache-manager';

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
        @Inject('CACHE_MANAGER')
        private cache: Cache,
    ) {}

    async obtenerPerfil(email: string) {
        // const user = await this.peopleRepository.findOne({ where: { email } });
        // if (!user) throw new NotFoundException('Usuario no encontrado');
        // const key = this.cacheKey(email);
        // const userCached = await this.cache.get(key);
        // if (userCached) {
        //     console.log('Cache hit for key:', key);
        //     return userCached;
        // }
        // console.log('Cache miss for key:', key);
        // const userRol = await this.pacientesRepository.findOne({
        //     where: { person: { user } },
        // });
    }

    private cacheKey(email: string) {
        return `user:${email}`;
    }

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

    async getInfo(id: number) {
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
            ],
        });
        if (!paciente) throw new NotFoundException('Paciente no encontrado');
        return this.formatearDatos(paciente);
    }

    private formatearDatos(paciente: PacientesEntity) {
        const { person, pais, grupoSanguineo, estiloVida } = paciente;
        return {
            nombres: `${person.primerNombre} ${person.segundoNombre} ${person.primerApellido} ${person.segundoApellido} ${person.segundoApellido}`,
            edad: this.calcularEdad(paciente.fechaNacimiento),
            email: person.email,
            telefono: paciente.numeroCelular,
            pais: pais.nombre,
            genero: person.genero.nombre,
            residencia: paciente.lugarResidencia,
            sangre: grupoSanguineo.nombre,
            estilo: estiloVida.nombre,
            imagen: person.imageUrl,
        };
    }

    private calcularEdad(fecha: Date): number {
        const hoy = new Date();
        const fechaNacimiento = new Date(fecha);
        let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mesActual = hoy.getMonth();
        const diaActual = hoy.getDate();
        const mesNacimiento = fechaNacimiento.getMonth();
        const diaNacimiento = fechaNacimiento.getDate();
        if (
            mesActual < mesNacimiento ||
            (mesActual === mesNacimiento && diaActual < diaNacimiento)
        ) {
            edad--;
        }
        return edad;
    }
}
