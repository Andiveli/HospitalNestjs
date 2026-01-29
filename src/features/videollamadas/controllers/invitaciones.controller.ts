import {
    Body,
    Controller,
    Get,
    Logger,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiOkResponse,
    ApiCreatedResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt.guard';
import { GenerarInvitacionDto } from '../dto/generar-invitacion.dto';
import {
    GenerarLinkResponse,
    InvitacionesService,
    ValidarCodigoResponse,
} from '../services/invitaciones.service';
import UserRequest from 'src/features/people/people.request';

/**
 * Controller para manejar invitaciones a videollamadas
 *
 * Permite generar links de invitación para acompañantes/invitados
 * y validar códigos de acceso a videollamadas.
 *
 * Endpoints:
 * - POST /citas/:id/generar-link-invitado - Generar link de invitación
 * - GET /invitaciones/invitado/:codigo - Validar código de invitado
 */
@ApiTags('Invitaciones a Videollamadas')
@ApiBearerAuth()
@Controller('invitaciones')
export class InvitacionesController {
    private readonly logger = new Logger(InvitacionesController.name);

    constructor(private readonly invitacionesService: InvitacionesService) {}

    /**
     * Genera un link de invitación para un invitado a la videollamada
     *
     * Solo el médico o paciente de la cita pueden generar invitaciones.
     * El link generado contiene un token JWT válido por 24 horas.
     *
     * @param id - ID de la cita
     * @param generarInvitacionDto - Datos del invitado
     * @param req - Request con usuario autenticado
     * @returns Link de invitación y código de acceso
     */
    @Post(':id/generar-link-invitado')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Generar link de invitación para videollamada',
        description: `
        Genera un link de invitación con código de acceso para que un invitado pueda unirse a la videollamada.
        Solo el médico o paciente de la cita pueden generar invitaciones.
        El link es válido por 24 horas.

        **Ejemplo de uso:**
        - Médico quiere que un familiar del paciente participe en la consulta
        - Paciente quiere que un acompañante esté presente en la videollamada
        `,
    })
    @ApiParam({
        name: 'id',
        type: 'number',
        description: 'ID de la cita para la que se genera la invitación',
        example: 123,
    })
    @ApiBody({
        type: GenerarInvitacionDto,
        description: 'Datos del invitado que recibirá el link',
        examples: {
            ejemplo1: {
                summary: 'Invitar a un familiar',
                value: {
                    nombreInvitado: 'María García',
                    rolInvitado: 'acompanante',
                },
            },
            ejemplo2: {
                summary: 'Invitar a un especialista externo',
                value: {
                    nombreInvitado: 'Dr. Carlos Pérez',
                    rolInvitado: 'invitado',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Link de invitación generado exitosamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Link de invitación generado exitosamente',
                },
                data: {
                    type: 'object',
                    properties: {
                        linkInvitacion: {
                            type: 'string',
                            example:
                                'http://localhost:3000/videollamada/invitado/ABC123XY',
                            description:
                                'URL completa para compartir con el invitado',
                        },
                        codigoAcceso: {
                            type: 'string',
                            example: 'ABC123XY',
                            description:
                                'Código de acceso único (8 caracteres alfanuméricos)',
                        },
                        expiraEn: {
                            type: 'string',
                            example: '24 horas',
                            description: 'Tiempo de validez del link',
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos o mala solicitud',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - requiere autenticación',
    })
    @ApiForbiddenResponse({
        description:
            'Prohibido - Solo médico o paciente pueden generar invitaciones',
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
    })
    async generarLinkInvitado(
        @Param('id') citaId: number,
        @Body() generarInvitacionDto: GenerarInvitacionDto,
        @Request() req: UserRequest,
    ): Promise<{ message: string; data: GenerarLinkResponse }> {
        try {
            const usuarioId = req.user.id;
            const { nombreInvitado, rolInvitado } = generarInvitacionDto;

            const linkResponse =
                await this.invitacionesService.generarLinkInvitado(
                    citaId,
                    usuarioId,
                    nombreInvitado,
                    rolInvitado,
                );

            this.logger.log(
                `Link de invitación generado para cita ${citaId} por usuario ${usuarioId}`,
            );

            return {
                message: 'Link de invitación generado exitosamente',
                data: linkResponse,
            };
        } catch (error) {
            this.logger.error(
                `Error al generar link de invitación: ${(error as Error).message}`,
            );
            throw error;
        }
    }

    /**
     * Valida un código de acceso y retorna información de la sesión
     *
     * Este endpoint es público (no requiere autenticación) porque los invitados
     * no tienen cuenta en el sistema.
     *
     * @param codigo - Código de acceso de la invitación
     * @returns Información de la sesión y validación del código
     */
    @Get('invitado/:codigo')
    @ApiOperation({
        summary: 'Validar código de invitación',
        description: `
        Valida un código de acceso de invitación y retorna la información de la sesión de videollamada.
        Este endpoint es público (no requiere autenticación) ya que los invitados no tienen cuenta.
        
        **Use cases:**
        - El invitado accede al link y el frontend valida el código
        - El frontend obtiene información de la sesión para mostrar la UI correcta
        - Verificación de que la cita aún existe y no está cancelada
        `,
    })
    @ApiParam({
        name: 'codigo',
        type: 'string',
        description: 'Código de acceso de la invitación',
        example: 'ABC123XY',
    })
    @ApiOkResponse({
        description: 'Token válido - información de la sesión',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Token válido',
                },
                data: {
                    type: 'object',
                    properties: {
                        valido: {
                            type: 'boolean',
                            example: true,
                            description: 'Siempre true en respuesta exitosa',
                        },
                        citaId: {
                            type: 'number',
                            example: 123,
                            description: 'ID de la cita',
                        },
                        nombreSesion: {
                            type: 'string',
                            example: 'Consulta - Dr. Juan Pérez / María García',
                            description: 'Nombre generado de la sesión',
                        },
                        nombreMedico: {
                            type: 'string',
                            example: 'Dr. Juan Pérez',
                            description: 'Nombre completo del médico',
                        },
                        nombrePaciente: {
                            type: 'string',
                            example: 'María García',
                            description: 'Nombre completo del paciente',
                        },
                        fechaHoraInicio: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T14:30:00Z',
                            description: 'Fecha y hora de inicio de la cita',
                        },
                        nombreInvitado: {
                            type: 'string',
                            example: 'Carlos Rodríguez',
                            description: 'Nombre del invitado que accede',
                        },
                        rolInvitado: {
                            type: 'string',
                            example: 'acompanante',
                            description: 'Rol del invitado en la sesión',
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'Código de acceso inválido o malformado',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 404,
                },
                message: {
                    type: 'string',
                    example: 'Código de acceso inválido o no encontrado',
                },
                error: {
                    type: 'string',
                    example: 'Not Found',
                },
            },
        },
    })
    @ApiForbiddenResponse({
        description: 'La cita fue cancelada',
    })
    @ApiNotFoundResponse({
        description: 'La cita asociada ya no existe',
    })
    async validarCodigoInvitado(
        @Param('codigo') codigo: string,
    ): Promise<{ message: string; data: ValidarCodigoResponse }> {
        try {
            const codigoResponse =
                await this.invitacionesService.validarCodigoInvitado(codigo);

            this.logger.log(`Código de invitado validado exitosamente`);

            return {
                message: 'Código válido',
                data: codigoResponse,
            };
        } catch (error) {
            this.logger.error(
                `Error al validar código de invitado: ${(error as Error).message}`,
            );
            throw error;
        }
    }
}
