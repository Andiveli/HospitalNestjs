import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
    Request,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiInternalServerErrorResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import UserRequest from 'src/people/people.request';
import { Roles } from 'src/roles/roles.decorator';
import { Rol } from 'src/roles/roles.enum';
import { DocumentsService } from './documents.service';
import {
    BadRequestErrorResponseDto,
    DocumentResponseDto,
    InternalServerErrorResponseDto,
    NotFoundErrorResponseDto,
    UnauthorizedErrorResponseDto,
    UploadDocumentDto,
} from './dto/documents.dto';
import { TipoDocumentoEntity } from './tipo-documento.entity';

@ApiTags('Documentos')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    /**
     * Sube un nuevo documento a S3
     * @param file - Archivo a subir (PDF o imagen)
     * @param dto - Metadata del documento
     * @returns Documento creado con URL
     */
    @ApiConsumes('multipart/form-data')
    @ApiOperation({
        summary: 'Subir documento',
        description:
            'Sube un documento (PDF o imagen) a S3 y guarda su metadata',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Archivo (PDF, JPEG, PNG, GIF, WebP - max 10MB)',
                },
                titulo: {
                    type: 'string',
                    description: 'Título del documento',
                    example: 'Radiografía de tórax',
                },
                tipo: {
                    type: 'number',
                    description: 'El tipo al que pertenece el documento',
                    example: 1,
                },
            },
            required: ['file', 'titulo', 'tipo'],
        },
    })
    @ApiCreatedResponse({
        type: DocumentResponseDto,
        description: 'Documento subido exitosamente',
    })
    @ApiBadRequestResponse({
        type: BadRequestErrorResponseDto,
        description:
            'Error de validación - Archivo no permitido o demasiado grande',
    })
    @ApiNotFoundResponse({
        type: NotFoundErrorResponseDto,
        description:
            'No existe historia clínica o tipo de documento no encontrado',
    })
    @ApiUnauthorizedResponse({
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiInternalServerErrorResponse({
        type: InternalServerErrorResponseDto,
        description: 'Error al subir archivo a S3',
    })
    @UseInterceptors(FileInterceptor('file'))
    @Roles(Rol.Medico)
    @Post('upload/:pacienteId')
    @HttpCode(HttpStatus.CREATED)
    async uploadDocument(
        @Param('pacienteId', ParseIntPipe) pacienteId: number,
        @UploadedFile() file: Express.Multer.File,
        @Body() dto: UploadDocumentDto,
    ): Promise<DocumentResponseDto> {
        return await this.documentsService.uploadDocument(
            file,
            dto,
            pacienteId,
        );
    }

    /**
     * Obtiene todos los documentos de una historia clínica
     * @param tipo - Opcional: Filtrar por tipo de documento (ej: Laboratorio, Radiología)
     * @returns Lista de documentos filtrados o todos
     */
    @ApiOperation({
        summary: 'Obtener documentos por historia clínica',
        description:
            'Retorna todos los documentos de una historia clínica. Usa ?tipo=NombreTipo para filtrar por tipo específico.',
    })
    @ApiQuery({
        name: 'tipo',
        required: false,
        description:
            'Opcional: Filtrar por tipo de documento (ej: Laboratorio, Radiología, Informe Médico)',
        example: 'Laboratorio',
        type: String,
    })
    @ApiOkResponse({
        type: [DocumentResponseDto],
        description: 'Documentos obtenidos exitosamente',
    })
    @ApiNotFoundResponse({
        type: NotFoundErrorResponseDto,
        description: 'No existe una historia clínica para el paciente',
    })
    @ApiUnauthorizedResponse({
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiInternalServerErrorResponse({
        type: InternalServerErrorResponseDto,
        description: 'Error interno del servidor',
    })
    @ApiBadRequestResponse({
        type: BadRequestErrorResponseDto,
        description: 'Tipo de documento no encontrado',
    })
    @Roles(Rol.Paciente)
    @Get('historia')
    @HttpCode(HttpStatus.OK)
    async getDocumentsByHistoria(
        @Request() req: UserRequest,
        @Query('tipo') tipo?: string,
    ): Promise<DocumentResponseDto[]> {
        if (tipo) {
            return await this.documentsService.getDocumentsByHistoriaFiltro(
                tipo,
                req.user.id,
            );
        }
        return await this.documentsService.getDocumentsByHistoria(req.user.id);
    }

    /**
     * Genera URL de descarga firmada para un documento
     * @param documentId - ID del documento
     * @returns URL de descarga temporal
     */
    @ApiOperation({
        summary: 'Descargar documento',
        description:
            'Descarga directamente un documento via redirect a S3. Frontend puede usar: `<a href="/documents/{documentId}/download">Descargar</a>` o `<a href="/documents/{documentId}/download?force=true">Forzar descarga</a>`',
    })
    @ApiParam({
        name: 'documentId',
        description: 'ID del documento',
        example: 1,
    })
    @ApiResponse({
        status: 302,
        description: 'Redirect a la URL de descarga firmada de S3',
    })
    @ApiNotFoundResponse({
        type: NotFoundErrorResponseDto,
        description: 'Documento no encontrado',
    })
    @ApiUnauthorizedResponse({
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiInternalServerErrorResponse({
        type: InternalServerErrorResponseDto,
        description: 'Error al generar URL de descarga o error en S3',
    })
    @Get(':documentId/download')
    async downloadDocument(
        @Param('documentId', ParseIntPipe) documentId: number,
        @Res({ passthrough: true }) res: Response,
        @Query('force') force?: boolean,
    ): Promise<void> {
        const downloadUrl = await this.documentsService.getDownloadUrl(
            documentId,
            force,
        );
        res.redirect(302, downloadUrl.downloadUrl);
    }

    /**
     * Obtiene todos los tipos de documento disponibles
     * @returns Lista de tipos de documento disponibles
     */
    @ApiOperation({
        summary: 'Obtener tipos de documento',
        description:
            'Retorna todos los tipos de documento disponibles para el filtrado',
    })
    @ApiOkResponse({
        type: [TipoDocumentoEntity],
        description: 'Tipos de documento obtenidos exitosamente',
    })
    @ApiUnauthorizedResponse({
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiInternalServerErrorResponse({
        type: InternalServerErrorResponseDto,
        description: 'Error interno del servidor',
    })
    /**
     * Elimina un documento del sistema
     * @param documentId - ID del documento a eliminar
     */
    @Delete(':documentId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({
        summary: 'Eliminar documento',
        description:
            'Elimina un documento tanto de S3 como de la base de datos',
    })
    @ApiParam({
        name: 'documentId',
        description: 'ID del documento a eliminar',
        example: 1,
    })
    @ApiResponse({
        status: 204,
        description: 'Documento eliminado exitosamente',
    })
    @ApiResponse({
        status: 404,
        type: NotFoundErrorResponseDto,
        description: 'Documento no encontrado',
    })
    @ApiResponse({
        status: 401,
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiResponse({
        status: 500,
        type: InternalServerErrorResponseDto,
        description: 'Error al eliminar documento de S3 o de la base de datos',
    })
    async deleteDocument(
        @Param('documentId', ParseIntPipe) documentId: number,
    ): Promise<void> {
        await this.documentsService.deleteDocument(documentId);
    }

    /**
     * Obtiene todos los tipos de documento disponibles
     * @returns Lista de tipos de documento disponibles
     */
    @ApiOperation({
        summary: 'Obtener tipos de documento',
        description:
            'Retorna todos los tipos de documento disponibles para el filtrado. Use estos nombres en el parámetro ?tipo= del endpoint GET /documents/historia',
    })
    @ApiOkResponse({
        type: [TipoDocumentoEntity],
        description: 'Tipos de documento obtenidos exitosamente',
    })
    @ApiUnauthorizedResponse({
        type: UnauthorizedErrorResponseDto,
        description: 'Usuario no autenticado',
    })
    @ApiInternalServerErrorResponse({
        type: InternalServerErrorResponseDto,
        description: 'Error interno del servidor',
    })
    @Roles(Rol.Paciente)
    @Get('tipos')
    @HttpCode(HttpStatus.OK)
    async getTiposDocumento(): Promise<TipoDocumentoEntity[]> {
        return await this.documentsService.getTiposDocumento();
    }
}
