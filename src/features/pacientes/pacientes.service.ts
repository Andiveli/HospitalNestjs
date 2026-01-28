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

/**
 * Service para la gestión completa de pacientes
 *
 * Proporciona toda la lógica de negocio para:
 * - Registro de información médica y personal
 * - Obtención del perfil completo del paciente
 * - Gestión de documentos médicos
 * - Cálculo de edad y otros datos derivados
 *
 * @see InfoDto Para los datos de entrada validados
 * @see PerfilPaciente Para el formato de respuesta del perfil
 */
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

    /**
     * Registra información médica y personal de un paciente
     *
     * Valida y guarda los datos del paciente incluyendo:
     * - Datos demográficos (país, residencia)
     * - Información médica (grupo sanguíneo, estilo de vida)
     * - Datos de contacto (teléfono)
     *
     * **Validaciones realizadas:**
     * - Verificación de existencia del usuario
     * - Validación de país en base de datos
     * - Verificación de estilo de vida permitido
     * - Validación de grupo sanguíneo existente
     *
     * **Business Rules:**
     * - Solo pacientes con usuario activo pueden registrarse
     * - El país debe estar previamente cargado
     * - El grupo sanguíneo debe ser uno de los permitidos
     * - El estilo de vida impacta en recomendaciones médicas
     *
     * @param info - Datos del paciente a registrar
     * @param email - Email del usuario para identificarlo
     * @returns PacienteEntity con todos los datos guardados
     * @throws NotFoundException Si el usuario, país, estilo de vida o grupo sanguíneo no existen
     */
    async addInfo(info: InfoDto, email: string): Promise<PacientesEntity> {
        const { fecha, telefono, residencia, pais, sangre, estiloVida } = info;

        // 1. Buscar al usuario por email
        const user = await this.peopleRepository.findOne({ where: { email } });
        if (!user) throw new NotFoundException('Usuario no encontrado');

        // 2. Validar que el país exista en la base de datos
        const paisUser = await this.paises.findOne({ where: { nombre: pais } });
        if (!paisUser) throw new NotFoundException('Pais no encontrado');

        // 3. Validar que el estilo de vida sea permitido
        const vidaUser = await this.vida.findOne({
            where: { nombre: estiloVida },
        });
        if (!vidaUser)
            throw new NotFoundException('Estilo de vida no permitido');

        // 4. Validar que el grupo sanguíneo exista
        const sangreUser = await this.sangre.findOne({
            where: { nombre: sangre },
        });
        if (!sangreUser)
            throw new NotFoundException('Grupo sanguineo no encontrado');

        // 5. Crear el paciente con todas las relaciones
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

    /**
     * Obtiene el perfil completo de un paciente
     *
     * Recupera toda la información del paciente incluyendo:
     * - Datos personales (nombres, apellidos, email, etc.)
     * - Información médica (fecha nacimiento, sangre, etc.)
     * - Relaciones demográficas (país, género, estilo de vida)
     * - Enfermedades preexistentes
     * - Edad calculada automáticamente
     *
     * **Datos incluidos:**
     * - Persona: datos básicos del usuario
     * - Género: información demográfica
     * - País: país de residencia con detalles
     * - Grupo sanguíneo: información de sangre
     * - Estilo de vida: hábitos y factores de riesgo
     * - PacienteEnfermedades: enfermedades preexistentes
     * - Edad: calculada automáticamente desde fecha de nacimiento
     *
     * @param id - ID del usuario/paciente
     * @returns PerfilPaciente con toda la información formateada
     * @throws NotFoundException Si el paciente no existe
     */
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

    /**
     * Formatea los datos del paciente al formato de respuesta
     *
     * Transforma las entidades de TypeORM a un objeto plano
     * con nombres más amigables para el frontend
     *
     * **Transformaciones aplicadas:**
     * - Concatenación de nombres y apellidos
     * - Cálculo automático de edad
     * - Formateo de nombres de relaciones
     * - Organización de enfermedades por tipo
     * - Estructuración de datos demográficos
     *
     * @param paciente - Entidad del paciente con todas sus relaciones
     * @returns PerfilPaciente con datos formateados
     */
    private formatearDatos(paciente: PacientesEntity): PerfilPaciente {
        const {
            person,
            pais,
            grupoSanguineo,
            estiloVida,
            pacienteEnfermedades,
        } = paciente;

        const enfermedades = this.formatearEnfermedades(pacienteEnfermedades);

        return {
            info: {
                id: person.id,
                cedula: person.cedula,
                nombres: `${person.primerNombre} ${person.segundoNombre || ''} ${person.primerApellido} ${person.segundoApellido || ''}`,
                email: person.email,
                imagen: person.imageUrl,
                verificado: person.verificado,
                genero: {
                    id: person.genero?.id,
                    nombre: person.genero?.nombre,
                },
            },
            medico: {
                fechaNacimiento: paciente.fechaNacimiento,
                telefono: paciente.numeroCelular,
                pais: {
                    id: pais?.id,
                    nombre: pais?.nombre,
                },
                sangre: {
                    id: grupoSanguineo?.id,
                    nombre: grupoSanguineo?.nombre,
                },
                estiloVida: {
                    id: estiloVida?.id,
                    nombre: estiloVida?.nombre,
                },
                residencia: paciente.lugarResidencia,
                edad: this.commonService.calcularEdad(paciente.fechaNacimiento),
            },
            enfermedades,
        };
    }

    /**
     * Formatea las enfermedades del paciente agrupándolas por tipo
     *
     * Organiza las enfermedades preexistentes según su tipo
     * para facilitar la visualización en el frontend
     *
     * **Agrupaciones típicas:**
     * - Crónicas
     * - Agudas
     * - Genéticas
     * - Autoinmunes
     * - Otras
     *
     * @param pacienteEnfermedades - Lista de relaciones paciente-enfermedad
     * @returns Array de enfermedades formateadas y agrupadas
     */
    private formatearEnfermedades(
        pacienteEnfermedades: PacienteEnfermedadEntity[],
    ): Record<string, string> {
        if (!pacienteEnfermedades || pacienteEnfermedades.length === 0) {
            return {};
        }

        // Convertir array a Record<string, string> para el formato esperado
        const enfermedadesRecord: Record<string, string> = {};

        pacienteEnfermedades.forEach((pe, index) => {
            if (pe.enfermedad?.nombre) {
                enfermedadesRecord[`enfermedad_${index}`] =
                    pe.enfermedad.nombre;
                enfermedadesRecord[`tipo_${index}`] =
                    pe.tipoEnfermedad?.nombre || '';
                enfermedadesRecord[`detalle_${index}`] = pe.detalle || '';
            }
        });

        return enfermedadesRecord;
    }
}
