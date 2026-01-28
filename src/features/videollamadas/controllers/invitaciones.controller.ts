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
    ValidarTokenResponse,
} from '../services/invitaciones.service';
import UserRequest from 'src/features/people/people.request';

/**
 * Controller para manejar invitaciones a videollamadas
 *
 * Permite generar links de invitación para acompañantes/invitados
 * y validar tokens de acceso a videollamadas.
 *
 * Endpoints:
 * - POST /citas/:id/generar-link-invitado - Generar link de invitación
 * - GET /citas/invitado/:token - Validar token de invitado
 */
@ApiTags('Invitaciones a Videollamadas')
@ApiBearerAuth()
@Controller('citas')
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
     * @returns Link de invitación y token JWT
     */
    @Post(':id/generar-link-invitado')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Generar link de invitación para videollamada',
        description: `
        Genera un link de invitación con token JWT para que un invitado pueda unirse a la videollamada.
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
                                'http://localhost:3000/videollamada/invitado/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            description:
                                'URL completa para compartir con el invitado',
                        },
                        token: {
                            type: 'string',
                            example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                            description:
                                'Token JWT (si el frontend necesita usarlo separado)',
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
        description: 'No autorizado - token JWT inválido',
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
     * Valida un token de invitación y retorna información de la sesión
     *
     * Este endpoint es público (no requiere autenticación) porque los invitados
     * no tienen cuenta en el sistema.
     *
     * @param token - Token JWT del link de invitación
     * @returns Información de la sesión y validación del token
     */
    @Get('invitado/:token')
    @ApiOperation({
        summary: 'Validar token de invitación',
        description: `
        Valida un token JWT de invitación y retorna la información de la sesión de videollamada.
        Este endpoint es público (no requiere autenticación) ya que los invitados no tienen cuenta.
        
        **Use cases:**
        - El invitado accede al link y el frontend valida el token
        - El frontend obtiene información de la sesión para mostrar la UI correcta
        - Verificación de que la cita aún existe y no está cancelada
        `,
    })
    @ApiParam({
        name: 'token',
        type: 'string',
        description: 'Token JWT del link de invitación',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
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
        description: 'Token inválido, expirado o malformado',
        schema: {
            type: 'object',
            properties: {
                statusCode: {
                    type: 'number',
                    example: 401,
                },
                message: {
                    type: 'string',
                    example: 'El link de invitación es inválido o ha expirado',
                },
                error: {
                    type: 'string',
                    example: 'Unauthorized',
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
    async validarTokenInvitado(
        @Param('token') token: string,
    ): Promise<{ message: string; data: ValidarTokenResponse }> {
        try {
            const tokenResponse =
                await this.invitacionesService.validarTokenInvitado(token);

            this.logger.log(`Token de invitado validado exitosamente`);

            return {
                message: 'Token válido',
                data: tokenResponse,
            };
        } catch (error) {
            this.logger.error(
                `Error al validar token de invitado: ${(error as Error).message}`,
            );
            throw error;
        }
    }
}
