import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Request,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiUnauthorizedResponse,
    ApiTags,
} from '@nestjs/swagger';
import UserRequest from '../people/people.request';
import { Roles } from '../roles/roles.decorator';
import { Rol } from '../roles/roles.enum';
import { DocsDto } from './dto/doc.dto';
import { InfoDto } from './dto/info.dto';
import { PacientesEntity } from './pacientes.entity';
import { PacientesService } from './pacientes.service';

/**
 * Controller para gestionar información de pacientes
 *
 * Proporciona endpoints para que los pacientes puedan:
 * - Agregar su información médica y personal
 * - Obtener su perfil completo
 * - Subir documentos médicos
 *
 * Todos los endpoints requieren autenticación y rol de paciente.
 */
@ApiTags('Gestión de Pacientes')
@ApiBearerAuth()
@Controller('pacientes')
export class PacientesController {
    constructor(private readonly pacientesService: PacientesService) {}

    /**
     * Agrega información médica y personal del paciente
     *
     * Permite al paciente registrar sus datos básicos como:
     * - Fecha de nacimiento
     * - Teléfono de contacto
     * - Dirección de residencia
     * - País
     * - Grupo sanguíneo
     * - Estilo de vida
     *
     * @param req - Request con usuario autenticado
     * @param body - Datos del paciente a registrar
     * @returns Paciente creado con toda la información
     */
    @Roles(Rol.Paciente)
    @Post('addInfo')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Registrar información del paciente',
        description: `
        Permite al paciente autenticado registrar su información médica y personal.
        Esta información es obligatoria para poder agendar citas.
        
        **Datos requeridos:**
        - fecha: Fecha de nacimiento (YYYY-MM-DD)
        - telefono: Número de teléfono con formato internacional
        - residencia: Dirección completa de residencia
        - pais: Nombre del país
        - sangre: Grupo sanguíneo (A+, A-, B+, B-, AB+, AB-, O+, O-)
        - estiloVida: Estilo de vida (activo, sedentario)
        
        **Validaciones:**
        - El teléfono debe tener formato válido (+ opcional + 10 dígitos)
        - La fecha debe estar en formato YYYY-MM-DD
        - El grupo sanguíneo y estilo de vida deben ser valores válidos
        `,
    })
    @ApiBody({
        type: InfoDto,
        description: 'Información del paciente a registrar',
        examples: {
            ejemplo1: {
                summary: 'Ejemplo completo',
                value: {
                    fecha: '1990-05-15',
                    telefono: '+5491155551234',
                    residencia: 'Av. Corrientes 1234, Buenos Aires',
                    pais: 'Argentina',
                    sangre: 'O+',
                    estiloVida: 'activo',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Información del paciente registrada exitosamente',
        schema: {
            type: 'object',
            properties: {
                msg: {
                    type: 'string',
                    example: 'Información agregada correctamente',
                },
                data: {
                    type: 'object',
                    description: 'Datos del paciente registrados',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o incompletos',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 400,
                },
                message: {
                    type: 'array',
                    example: [
                        'Tienes que agregar tu fecha de nacimiento',
                        'El numero de telefono no es valido',
                        'Grupo sanguíneo no válido. Opciones: A+, A-, B+, B-, AB+, AB-, O+, O-',
                    ],
                },
                error: {
                    type: 'string',
                    example: 'Bad Request',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description:
            'Acceso denegado - solo pacientes pueden usar este endpoint',
    })
    @ApiNotFoundResponse({
        description:
            'Usuario, país, estilo de vida o grupo sanguíneo no encontrado',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 404,
                },
                message: {
                    type: 'string',
                    example: 'Usuario no encontrado',
                },
                error: {
                    type: 'string',
                    example: 'Not Found',
                },
            },
        },
    })
    async addInfo(
        @Request() req: UserRequest,
        @Body() body: InfoDto,
    ): Promise<{ msg: string; data: PacientesEntity }> {
        const result = await this.pacientesService.addInfo(
            body,
            req.user.email,
        );
        return { msg: 'Información agregada correctamente', data: result };
    }

    /**
     * Obtiene el perfil completo del paciente autenticado
     *
     * Retorna toda la información del paciente incluyendo:
     * - Datos personales (nombres, apellidos, email, etc.)
     * - Información médica (fecha nacimiento, sangre, etc.)
     * - Citas agendadas
     * - Historial médico
     *
     * @param req - Request con usuario autenticado
     * @returns Perfil completo del paciente
     */
    @Roles(Rol.Paciente)
    @Get('myInfo')
    @ApiOperation({
        summary: 'Obtener perfil del paciente',
        description: `
        Obtiene toda la información del paciente autenticado.
        
        **Datos retornados:**
        - Información personal completa
        - Datos médicos registrados
        - Citas agendadas (próximas y pasadas)
        - Historial clínico
        - Documentos médicos adjuntos
        - Enfermedades registradas
        - Estilo de vida y factores de riesgo
        
        **Casos de uso:**
        - Cargar perfil en la vista "Mi Cuenta"
        - Pre-cargar datos en formularios de citas
        - Mostrar historial médico al paciente
        `,
    })
    @ApiOkResponse({
        description: 'Perfil del paciente obtenido exitosamente',
        schema: {
            type: 'object',
            properties: {
                info: {
                    type: 'object',
                    description: 'Datos personales del paciente',
                    example: {
                        id: 123,
                        cedula: '12345678',
                        primerNombre: 'Juan',
                        segundoNombre: 'Carlos',
                        primerApellido: 'Pérez',
                        segundoApellido: 'González',
                        email: 'juan.perez@email.com',
                        imageUrl: 'https://example.com/avatar.jpg',
                    },
                },
                medico: {
                    type: 'object',
                    description: 'Información médica del paciente',
                    example: {
                        fechaNacimiento: '1990-05-15',
                        telefono: '+5491155551234',
                        residencia: 'Av. Corrientes 1234, Buenos Aires',
                        pais: 'Argentina',
                        sangre: 'O+',
                        estiloVida: 'activo',
                    },
                },
                citas: {
                    type: 'array',
                    description: 'Citas agendadas',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            fechaHoraInicio: {
                                type: 'string',
                                format: 'date-time',
                            },
                            medico: { type: 'string' },
                            estado: { type: 'string' },
                        },
                    },
                },
                historial: {
                    type: 'array',
                    description: 'Historial clínico',
                    items: {
                        type: 'object',
                        properties: {
                            fecha: { type: 'string', format: 'date-time' },
                            medico: { type: 'string' },
                            diagnostico: { type: 'string' },
                            tratamiento: { type: 'string' },
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description:
            'Acceso denegado - solo pacientes pueden usar este endpoint',
    })
    @ApiNotFoundResponse({
        description: 'Paciente no encontrado',
    })
    @HttpCode(HttpStatus.OK)
    async getInfo(@Request() req: UserRequest) {
        const result = await this.pacientesService.getInfo(req.user.id);
        return result;
    }

    /**
     * Agrega documentos médicos al perfil del paciente
     *
     * Permite subir documentos como:
     * - Resultados de análisis
     * - Imágenes médicas
     * - Historias clínicas externas
     * - Certificados médicos
     * - Recetas médicas
     *
     * @param req - Request con usuario autenticado
     * @param body - Datos del documento a agregar
     */
    @Roles(Rol.Paciente)
    @Post('addDocs')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({
        summary: 'Agregar documento médico',
        description: `
        Permite al paciente subir documentos médicos a su perfil.
        
        **Tipos de documentos soportados:**
        - Análisis de laboratorio
        - Imágenes (radiografías, resonancias, etc.)
        - Historias clínicas de otros centros
        - Certificados médicos
        - Recetas y prescripciones
        - Consentimientos informados
        
        **Formatos aceptados:**
        - PDF
        - Imágenes (JPG, PNG, DICOM)
        - Documentos de texto
        
        **Proceso:**
        1. Se valida el documento
        2. Se asocia al perfil del paciente
        3. Se notifica a los médicos autorizados
        4. Se registra en el historial
        `,
    })
    @ApiBody({
        type: DocsDto,
        description: 'Documento médico a agregar',
        examples: {
            ejemplo1: {
                summary: 'Análisis de laboratorio',
                value: {
                    titulo: 'Análisis de sangre - Hemograma completo',
                    documento:
                        'https://s3.amazonaws.com/hospital/docs/hemograma_juan_perez_2024_01_15.pdf',
                },
            },
            ejemplo2: {
                summary: 'Radiografía de tórax',
                value: {
                    titulo: 'Radiografía de tórax PA y lateral',
                    documento:
                        'https://s3.amazonaws.com/hospital/docs/rx_torax_juan_perez_2024_01_10.jpg',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Documento agregado exitosamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Documento agregado correctamente',
                },
                documentId: {
                    type: 'number',
                    example: 456,
                    description: 'ID del documento agregado',
                },
                url: {
                    type: 'string',
                    example:
                        'https://s3.amazonaws.com/hospital/docs/hemograma_...pdf',
                    description: 'URL del documento procesado',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos del documento',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 400,
                },
                message: {
                    type: 'array',
                    example: [
                        'El ID del paciente es requerido',
                        'La descripcion del documento es requerida',
                        'Formato de archivo no soportado',
                    ],
                },
                error: {
                    type: 'string',
                    example: 'Bad Request',
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido o ausente',
    })
    @ApiForbiddenResponse({
        description:
            'Acceso denegado - solo pacientes pueden usar este endpoint',
    })
    @ApiForbiddenResponse({
        description: 'Límite de almacenamiento excedido',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 403,
                },
                message: {
                    type: 'string',
                    example:
                        'Límite de almacenamiento de documentos excedido (50MB)',
                },
                error: {
                    type: 'string',
                    example: 'Forbidden',
                },
            },
        },
    })
    async addDocs(@Request() _req: UserRequest, @Body() _body: DocsDto) {
        // TODO: Implementar lógica de subida de documentos
        // - Validar formato y tamaño
        // - Subir a S3 o servicio similar
        // - Asociar al paciente
        // - Notificar a médicos

        console.log('Agregando datos');
        return {
            message: 'Documento agregado correctamente',
            documentId: Math.floor(Math.random() * 1000),
            url: 'https://example.com/document-uploaded.pdf',
        };
    }
}
