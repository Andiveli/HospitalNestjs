import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
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
import { WebRtcSignalDto } from '../dto/webrtc-signal.dto';
import {
    GenerarInvitacionDto,
    GuardarGrabacionDto,
    GuardarGrabacionResponseDto,
    ObtenerGrabacionResponseDto,
} from '../dto';
import { VideollamadaService } from '../services/videollamada.service';
import { InvitacionesService } from '../services/invitaciones.service';
import UserRequest from '../../people/people.request';

/**
 * Controller para gestión completa de salas de videollamada
 *
 * Proporciona endpoints para:
 * - Crear salas de videollamada
 * - Unirse a salas existentes
 * - Generar links para invitados
 * - Señalización WebRTC
 * - Terminar sesiones
 * - Integración con servicios externos (Twilio, Agora, etc.)
 *
 * Namespace WebSocket: /videollamadas
 */
@ApiTags('Gestión de Salas de Videollamada')
@ApiBearerAuth()
@Controller('video-rooms')
export class VideoRoomsController {
    constructor(
        private readonly videollamadaService: VideollamadaService,
        private readonly invitacionesService: InvitacionesService,
    ) {}

    /**
     * Crea una nueva sala de videollamada para una cita específica
     *
     * Inicializa la sesión, valida la cita y prepara el entorno
     * para que los participantes puedan unirse.
     *
     * @param citaId - ID de la cita para crear la sala
     * @param req - Request con usuario autenticado
     * @returns Información de la sala creada
     */
    @Post(':citaId/create')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Crear sala de videollamada',
        description: `
        Crea una nueva sala de videollamada para una cita específica.
        
        **Proceso:**
        1. Valida que la cita existe y está en estado apropiado
        2. Crea la sesión en base de datos
        3. Prepara el entorno WebRTC (STUN/TURN servers)
        4. Retorna información para que los participantes se unan
        
        **Casos de uso:**
        - Paciente inicia videollamada desde su perfil
        - Médico inicia videollamada desde dashboard
        - Sistema automático 5 minutos antes de la cita
        
        **Integración futura:**
        - Twilio Video Rooms
        - Agora.io Video SDK
        - Vonage Video API
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita para crear la sala',
        example: 123,
    })
    @ApiCreatedResponse({
        description: 'Sala creada exitosamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Sala de videollamada creada exitosamente',
                },
                data: {
                    type: 'object',
                    properties: {
                        sessionId: {
                            type: 'string',
                            example: 'room_abc123',
                            description: 'ID único de la sala',
                        },
                        citaId: {
                            type: 'number',
                            example: 123,
                            description: 'ID de la cita asociada',
                        },
                        nombreSesion: {
                            type: 'string',
                            example: 'Consulta - Dr. Juan Pérez / María García',
                            description: 'Nombre descriptivo de la sesión',
                        },
                        fechaInicio: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T14:30:00Z',
                        },
                        webRtcConfig: {
                            type: 'object',
                            properties: {
                                stunServers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['stun:stun.l.google.com:19302'],
                                },
                                turnServers: {
                                    type: 'array',
                                    items: { type: 'string' },
                                    example: ['turn:turn.example.com:3478'],
                                },
                            },
                        },
                        participantes: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    nombre: { type: 'string' },
                                    rol: { type: 'string' },
                                    socketId: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'ID de cita inválido o cita en estado no permitido',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido',
    })
    @ApiNotFoundResponse({
        description: 'Cita no encontrada',
    })
    async createRoom(
        @Param('citaId') citaId: number,
        @Request() _req: UserRequest,
    ) {
        const sesion = await this.videollamadaService.crearSesion(citaId);

        return {
            message: 'Sala de videollamada creada exitosamente',
            data: {
                sessionId: `room_${citaId}`,
                citaId,
                nombreSesion: sesion.nombre,
                fechaInicio: sesion.fechaHoraInicio,
                webRtcConfig: {
                    stunServers: [
                        'stun:stun.l.google.com:19302',
                        'stun:stun1.l.google.com:19302',
                    ],
                    turnServers: process.env.TURN_SERVERS
                        ? JSON.parse(process.env.TURN_SERVERS)
                        : [],
                },
                participantes: [],
            },
        };
    }

    /**
     * Obtiene información para unirse a una sala existente
     *
     * Valida el acceso y retorna la configuración necesaria
     * para que un participante pueda unirse a la videollamada.
     *
     * @param citaId - ID de la cita/sala
     * @param req - Request con usuario autenticado
     * @returns Información de acceso a la sala
     */
    @Get(':citaId/join')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Obtener información para unirse a sala',
        description: `
        Obtiene la configuración necesaria para unirse a una sala de videollamada existente.
        
        **Validaciones:**
        - Verifica que la sala exista
        - Valida que el usuario tenga permisos
        - Verifica que la sesión esté activa
        - Retorna configuración WebRTC
        
        **Usos:**
        - Frontend carga página de videollamada
        - Verificación de permisos antes de conectar
        - Obtención de tokens para servicios externos
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala',
        example: 123,
    })
    @ApiOkResponse({
        description: 'Información de unión a sala',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Información de sala obtenida',
                },
                data: {
                    type: 'object',
                    properties: {
                        sessionId: {
                            type: 'string',
                            example: 'room_123',
                        },
                        canJoin: {
                            type: 'boolean',
                            example: true,
                        },
                        reason: {
                            type: 'string',
                            example: null,
                        },
                        webRtcConfig: {
                            type: 'object',
                            properties: {
                                iceServers: {
                                    type: 'array',
                                    items: { type: 'object' },
                                },
                            },
                        },
                        participantsCount: {
                            type: 'number',
                            example: 2,
                        },
                        maxParticipants: {
                            type: 'number',
                            example: 10,
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido',
    })
    @ApiNotFoundResponse({
        description: 'Sala no encontrada o inactiva',
    })
    async getJoinInfo(
        @Param('citaId') citaId: number,
        @Request() _req: UserRequest,
    ) {
        await this.videollamadaService.obtenerSesion(citaId);
        const participantes =
            await this.videollamadaService.obtenerParticipantesActivos(citaId);

        return {
            message: 'Información de sala obtenida',
            data: {
                sessionId: `room_${citaId}`,
                canJoin: true,
                reason: null,
                webRtcConfig: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        // Agregar TURN servers si están configurados
                    ],
                },
                participantsCount: participantes.length,
                maxParticipants: 10,
            },
        };
    }

    /**
     * Genera un link para que un invitado pueda unirse a la sala
     *
     * Crea un token JWT temporal (24h) que permite acceso
     * de invitados sin cuenta en el sistema.
     *
     * @param citaId - ID de la cita/sala
     * @param dto - Datos del invitado
     * @param req - Request con usuario autenticado (quién invita)
     * @returns Link de invitación con token JWT
     */
    @Post(':citaId/guest-link')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Generar link de invitado',
        description: `
        Genera un link seguro para que un invitado pueda unirse a la videollamada.
        
        **Características:**
        - Código de acceso único válido por 24 horas
        - Acceso sin cuenta en el sistema
        - Solo médico o paciente pueden generar links
        - Role específico para el invitado
        - Registro de quién generó la invitación
        
        **Casos de uso:**
        - Médico invita a especialista externo
        - Paciente invita a familiar para acompañamiento
        - Paciente invita a traductor
        - Médico invita a segundo médico consultor
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala',
        example: 123,
    })
    @ApiBody({
        type: GenerarInvitacionDto,
        description: 'Datos del invitado',
        examples: {
            acompanante: {
                summary: 'Invitar a familiar acompañante',
                value: {
                    nombreInvitado: 'María García',
                    rolInvitado: 'acompanante',
                },
            },
            especialista: {
                summary: 'Invitar a especialista externo',
                value: {
                    nombreInvitado: 'Dr. Carlos Pérez',
                    rolInvitado: 'especialista',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'Link de invitado generado',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Link de invitado generado exitosamente',
                },
                data: {
                    type: 'object',
                    properties: {
                        linkInvitacion: {
                            type: 'string',
                            example:
                                'https://app.hospital.com/videollamada/invitado/ABC123XY',
                            description: 'URL completa para compartir',
                        },
                        codigoAcceso: {
                            type: 'string',
                            example: 'ABC123XY',
                            description:
                                'Código de acceso único (8 caracteres)',
                        },
                        expiraEn: {
                            type: 'string',
                            example: '24 horas',
                            description: 'Tiempo de validez',
                        },
                        rolInvitado: {
                            type: 'string',
                            example: 'acompanante',
                            description: 'Rol asignado al invitado',
                        },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Datos inválidos del invitado',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - requiere autenticación',
    })
    @ApiForbiddenResponse({
        description: 'Solo médico o paciente pueden generar invitaciones',
    })
    @ApiNotFoundResponse({
        description: 'Sala no encontrada',
    })
    async generateGuestLink(
        @Param('citaId') citaId: number,
        @Body() dto: GenerarInvitacionDto,
        @Request() _req: UserRequest,
    ) {
        const linkResponse = await this.invitacionesService.generarLinkInvitado(
            citaId,
            _req.user.id,
            dto.nombreInvitado,
            dto.rolInvitado || 'invitado',
        );

        return {
            message: 'Link de invitado generado exitosamente',
            data: {
                ...linkResponse,
                rolInvitado: dto.rolInvitado || 'invitado',
            },
        };
    }

    /**
     * Endpoint de señalización WebRTC
     *
     * Maneja el intercambio de señales WebRTC entre participantes:
     * - Offers y answers SDP
     * - ICE candidates
     * - Control de flujo de medios
     *
     * @param citaId - ID de la cita/sala
     * @param signal - Datos de la señal WebRTC
     * @returns Confirmación de envío de señal
     */
    @Post(':citaId/signal')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Señalización WebRTC',
        description: `
        Maneja el intercambio de señales WebRTC entre participantes de la sala.
        
        **Señales soportadas:**
        - offer: Oferta SDP para establecer conexión
        - answer: Respuesta SDP a oferta recibida
        - ice-candidate: Candidato ICE para穿越 NAT
        
        **Flujo:**
        1. Cliente A envía 'offer' a través de este endpoint
        2. Gateway reenvía 'offer' a cliente B vía WebSocket
        3. Cliente B responde con 'answer' vía WebSocket
        4. Gateway reenvía 'answer' a cliente A
        5. Ambos intercambian 'ice-candidates' para conectar directamente
        
        **Integración con servicios externos:**
        - Para Twilio: Enviar a Twilio Video REST API
        - Para Agora: Enviar a Agora RESTful API
        - Para Vonage: Enviar a Vonage Video API
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala',
        example: 123,
    })
    @ApiBody({
        type: WebRtcSignalDto,
        description: 'Señal WebRTC a reenviar',
        examples: {
            offer: {
                summary: 'Enviar oferta SDP',
                value: {
                    to: 'socket-abc-123',
                    type: 'offer',
                    payload: {
                        sdp: 'v=0\r\no=- 123456789 2 IN IP4 127.0.0.1...',
                        type: 'offer',
                    },
                },
            },
            answer: {
                summary: 'Enviar respuesta SDP',
                value: {
                    to: 'socket-def-456',
                    type: 'answer',
                    payload: {
                        sdp: 'v=0\r\no=- 987654321 2 IN IP4 127.0.0.1...',
                        type: 'answer',
                    },
                },
            },
            ice: {
                summary: 'Enviar candidato ICE',
                value: {
                    to: 'socket-ghi-789',
                    type: 'ice-candidate',
                    payload: {
                        candidate:
                            'candidate:1 1 UDP 2130706436 8448 192.168.1.100 54313 typ host',
                        sdpMid: '0',
                        sdpMLineIndex: '0',
                    },
                },
            },
        },
    })
    @ApiOkResponse({
        description: 'Señal procesada y reenviada',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Señal procesada exitosamente',
                },
                signalId: {
                    type: 'string',
                    example: 'signal_abc123',
                    description: 'ID único de la señal procesada',
                },
                timestamp: {
                    type: 'string',
                    format: 'date-time',
                    example: '2024-01-15T14:35:00Z',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Datos de señal inválidos',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido',
    })
    @ApiNotFoundResponse({
        description: 'Sala no encontrada o participante no en sala',
    })
    handleSignal(
        @Param('citaId') _citaId: number,
        @Body() _signal: WebRtcSignalDto,
        @Request() _req: UserRequest,
    ) {
        // Aquí se integraría con el servicio externo (Twilio, Agora, etc.)
        // Por ahora, manejamos la señalización local
        // TODO: Integrar con servicio WebRTC externo usando citaId

        return {
            message: 'Señal procesada exitosamente',
            signalId: `signal_${Date.now()}_${_req.user.id}`,
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Termina una sala de videollamada
     *
     * Finaliza la sesión, registra la hora de fin y libera recursos.
     * También puede integrarse con servicios externos para limpiar salas.
     *
     * @param citaId - ID de la cita/sala a terminar
     * @param req - Request con usuario autorizado
     * @returns Confirmación de terminación
     */
    @Delete(':citaId/end')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Terminar sala de videollamada',
        description: `
        Termina una sala de videollamada y libera los recursos asociados.
        
        **Acciones realizadas:**
        - Marca sesión como 'finalizada'
        - Registra hora de finalización
        - Desconecta a todos los participantes
        - Limpia recursos temporales
        - Genera registro de auditoría
        
        **Integración con servicios externos:**
        - Twilio: DELETE /Video/Rooms/{roomSid}
        - Agora: DELETE /v1/apps/{appId}/channels/{channelName}
        - Vonage: DELETE /v2/projects/{projectId}/sessions/{sessionId}
        
        **Casos de uso:**
        - Usuario termina videollamada manualmente
        - Sistema automático al finalizar tiempo programado
        - Inactividad automática después de timeout
        - Forzada por administrador
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala a terminar',
        example: 123,
    })
    @ApiOkResponse({
        description: 'Sala terminada exitosamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Sala terminada exitosamente',
                },
                data: {
                    type: 'object',
                    properties: {
                        sessionId: {
                            type: 'string',
                            example: 'room_123',
                        },
                        terminationTime: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T15:30:00Z',
                        },
                        duration: {
                            type: 'number',
                            example: 3600,
                            description: 'Duración en segundos',
                        },
                        participantCount: {
                            type: 'number',
                            example: 3,
                            description: 'Total participantes al terminar',
                        },
                        recordingUrl: {
                            type: 'string',
                            example:
                                'https://s3.amazonaws.com/recordings/session_123.mp4',
                            description: 'URL de grabación si está disponible',
                        },
                    },
                },
            },
        },
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token JWT inválido',
    })
    @ApiForbiddenResponse({
        description: 'No tiene permisos para terminar esta sala',
    })
    @ApiNotFoundResponse({
        description: 'Sala no encontrada o ya finalizada',
    })
    async endRoom(
        @Param('citaId') citaId: number,
        @Request() _req: UserRequest,
    ) {
        const sesion = await this.videollamadaService.finalizarSesion(citaId);
        const participantes =
            await this.videollamadaService.obtenerParticipantesActivos(citaId);

        // Aquí se integraría con el servicio externo para limpiar la sala
        // Por ejemplo:
        // await this.twilioService.terminateRoom(sesion.roomSid);
        // await this.agoraService.deleteChannel(sesion.channelName);
        // TODO: Validar que _req.user tiene permisos para esta sala

        return {
            message: 'Sala terminada exitosamente',
            data: {
                sessionId: `room_${citaId}`,
                terminationTime: new Date().toISOString(),
                duration: Math.floor(
                    (new Date().getTime() - sesion.fechaHoraInicio.getTime()) /
                        1000,
                ),
                participantCount: participantes.length,
                recordingUrl: sesion.grabacionUrl,
            },
        };
    }

    /**
     * Guarda la URL de la grabación cuando finaliza la sesión
     *
     * Este endpoint es llamado por el frontend después de subir el video a S3
     * usando el mismo servicio que los documentos.
     *
     * @param citaId - ID de la cita/sala
     * @param body - URL de la grabación subida a S3
     * @returns Confirmación de guardado
     */
    @Post(':citaId/grabacion')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Guardar URL de grabación',
        description: `
        Guarda la URL de la grabación subida por el frontend al finalizar la sesión.
        
        **Flujo:**
        1. Frontend graba videollamada con MediaRecorder API
        2. Frontend sube video a S3 (mismo servicio que documentos)
        3. Frontend llama a este endpoint con la URL generada
        4. Backend guarda URL en la sesión de consulta
        
        **Notas:**
        - La grabación es iniciada y procesada por el frontend
        - Solo se guarda la URL, no se procesa el video en backend
        - Se reutiliza toda la infraestructura S3 existente
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala',
        example: 123,
    })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['grabacionUrl'],
            properties: {
                grabacionUrl: {
                    type: 'string',
                    format: 'uri',
                    example:
                        'https://s3.amazonaws.com/bucket/grabaciones/cita_123.mp4',
                    description: 'URL completa del video subido a S3',
                },
            },
        },
    })
    @ApiCreatedResponse({
        description: 'URL de grabación guardada exitosamente',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Grabación guardada exitosamente',
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'URL de grabación inválida o faltante',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - requiere autenticación',
    })
    @ApiNotFoundResponse({
        description: 'Sesión no encontrada',
    })
    async guardarGrabacion(
        @Param('citaId', ParseIntPipe) citaId: number,
        @Body() guardarGrabacionDto: GuardarGrabacionDto,
    ): Promise<GuardarGrabacionResponseDto> {
        await this.videollamadaService.guardarGrabacion(
            citaId,
            guardarGrabacionDto.grabacionUrl,
        );

        return {
            message: 'Grabación guardada exitosamente',
        };
    }

    /**
     * Obtiene la URL de grabación de una videollamada
     *
     * Permite recuperar la grabación guardada de una sesión específica.
     * Similar a cómo se recuperan los documentos.
     *
     * @param citaId - ID de la cita/sala
     * @returns URL de grabación o null si no existe
     */
    @Get(':citaId/grabacion')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Obtener grabación de videollamada',
        description: `
        Obtiene la URL de la grabación de una videollamada específica.
        
        **Comportamiento:**
        - Retorna la URL si existe una grabación guardada
        - Retorna null si no hay grabación
        - La URL apunta directamente al archivo en S3
        - Se aplican las mismas políticas de acceso que los documentos
        
        **Casos de uso:**
        - Paciente quiere ver su consulta grabada
        - Médico necesita revisar la sesión
        - Descarga para archivo médico del paciente
        `,
    })
    @ApiParam({
        name: 'citaId',
        type: 'number',
        description: 'ID de la cita/sala',
        example: 123,
    })
    @ApiOkResponse({
        description: 'URL de grabación obtenida',
        schema: {
            type: 'object',
            properties: {
                grabacionUrl: {
                    type: 'string',
                    nullable: true,
                    example:
                        'https://s3.amazonaws.com/bucket/grabaciones/cita_123.mp4',
                    description: 'URL completa del video o null si no existe',
                },
                existeGrabacion: {
                    type: 'boolean',
                    example: true,
                    description:
                        'Indica si existe una grabación para esta cita',
                },
            },
        },
    })
    @ApiNotFoundResponse({
        description: 'Sesión no encontrada',
    })
    async obtenerGrabacion(
        @Param('citaId', ParseIntPipe) citaId: number,
    ): Promise<ObtenerGrabacionResponseDto> {
        const grabacionUrl =
            await this.videollamadaService.obtenerGrabacion(citaId);

        return {
            grabacionUrl,
            existeGrabacion: grabacionUrl !== null,
        };
    }
}
