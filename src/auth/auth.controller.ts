import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import UserRequest from 'src/people/people.request';
import { AuthService } from './auth.service';
import {
    AuthResponseDto,
    MensajeResponseDto,
    PerfilResponseDto,
} from './dto/auth-response.dto';
import { CambiarPassDto } from './dto/cambiarPass.dto';
import { LoginDto } from './dto/login.dto';
import { OlvidePasswordDto } from './dto/olvidePassword.dto';
import { RestablecerPasswordDto } from './dto/restablecerPassword.dto';
import { SingupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './local.guard';
import { Public } from './public.decorator';

/**
 * Controlador de autenticación
 * Maneja el registro, login, confirmación de usuarios y recuperación de contraseña
 */

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    /**
     * Registra un nuevo usuario en el sistema
     * @param body - Datos del usuario a registrar
     * @returns Mensaje de confirmación del registro
     */
    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'Registrar nuevo usuario',
        description:
            'Crea una nueva cuenta de usuario en el sistema y envía email de confirmación',
    })
    @ApiBody({
        type: SingupDto,
        description: 'Datos del nuevo usuario a registrar',
    })
    @ApiCreatedResponse({
        type: MensajeResponseDto,
        description: 'Usuario registrado correctamente',
    })
    @ApiBadRequestResponse({ description: 'Datos inválidos o faltantes' })
    @ApiConflictResponse({ description: 'El email ya está registrado' })
    async signUp(@Body() body: SingupDto): Promise<{ msg: string }> {
        await this.authService.noExisteEmail(body.email);
        this.authService.compararPassword(
            body.passwordHash,
            body.confirmPassword,
        );
        const { genero, ...rest } = body;
        await this.authService.guardar({
            ...rest,
            genero: await this.authService.getGeneroById(genero),
        });
        return { msg: 'Usuario registrado correctamente' };
    }

    /**
     * Confirma un usuario mediante token enviado por email
     * @param token - Token de confirmación
     * @returns Mensaje de confirmación exitosa
     */
    @Public()
    @Get('confirmar/:token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Confirmar usuario',
        description:
            'Confirma la cuenta de usuario mediante el token enviado por email',
    })
    @ApiParam({
        name: 'token',
        description: 'Token de confirmación enviado al email del usuario',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @ApiOkResponse({
        type: MensajeResponseDto,
        description: 'Usuario confirmado correctamente',
    })
    @ApiNotFoundResponse({ description: 'Token inválido o no encontrado' })
    @ApiUnprocessableEntityResponse({ description: 'Token expirado' })
    async confirmarUsuario(
        @Param('token') token: string,
    ): Promise<{ msg: string }> {
        const usuarioConfirmar = await this.authService.confirmarUsuario(token);
        this.authService.validarTokenExpiracion(usuarioConfirmar);
        usuarioConfirmar.token = null;
        usuarioConfirmar.tokenExpiracion = null;
        usuarioConfirmar.verificado = true;
        await this.authService.guardar(usuarioConfirmar);
        return { msg: 'Usuario confirmado correctamente' };
    }

    /**
     * Inicia sesión de usuario y genera token JWT
     * @param req - Objeto de solicitud con datos del usuario autenticado
     * @returns Token JWT para autenticación
     */
    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Iniciar sesión de usuario',
        description:
            'Autentica un usuario con email y contraseña y devuelve un token JWT',
    })
    @ApiBody({
        type: LoginDto,
        description: 'Credenciales del usuario',
    })
    @ApiOkResponse({
        type: AuthResponseDto,
        description: 'Login exitoso',
    })
    @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
    async auth(@Request() req: UserRequest, @Body() _loginData: LoginDto) {
        return { token: await this.authService.generarJWT(req.user.email) };
    }

    /**
     * Envía email con instrucciones para recuperar contraseña
     * @param email - Email del usuario que solicita recuperación
     * @returns Mensaje de confirmación de envío de email
     */
    @Public()
    @Post('olvide-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Solicitar recuperación de contraseña',
        description:
            'Envía un email con instrucciones para restablecer la contraseña',
    })
    @ApiBody({
        type: OlvidePasswordDto,
        description: 'Email del usuario que solicita recuperación',
    })
    @ApiOkResponse({
        type: MensajeResponseDto,
        description: 'Email de recuperación enviado correctamente',
    })
    @ApiNotFoundResponse({ description: 'Email no encontrado en el sistema' })
    async olvidePassword(
        @Body() body: OlvidePasswordDto,
    ): Promise<{ msg: string }> {
        const usuario = await this.authService.getByEmail(body.email);
        await this.authService.guardar(usuario, true);
        return {
            msg: 'Se ha enviado un correo con las instrucciones para restablecer la contraseña',
        };
    }

    /**
     * Verifica token de recuperación de contraseña
     * @param token - Token de recuperación
     * @returns Mensaje para proceder con nueva contraseña
     */
    @Public()
    @Get('recuperar-password/:token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verificar token de recuperación',
        description:
            'Verifica si el token de recuperación de contraseña es válido',
    })
    @ApiParam({
        name: 'token',
        description: 'Token de recuperación de contraseña',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @ApiOkResponse({
        type: MensajeResponseDto,
        description: 'Token válido, puede proceder con el cambio de contraseña',
    })
    @ApiNotFoundResponse({ description: 'Token inválido o no encontrado' })
    @ApiUnprocessableEntityResponse({ description: 'Token expirado' })
    async comprobarToken(
        @Param('token') token: string,
    ): Promise<{ msg: string }> {
        await this.authService.confirmarUsuario(token);
        return { msg: 'Coloca tu nueva contraseña' };
    }

    /**
     * Restablece contraseña del usuario con token válido
     * @param token - Token de recuperación
     * @param password - Nueva contraseña
     * @param confirmPassword - Confirmación de nueva contraseña
     * @returns Mensaje de restablecimiento exitoso
     */
    @Public()
    @Post('recuperar-password/:token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Restablecer contraseña',
        description:
            'Restablece la contraseña del usuario usando un token válido',
    })
    @ApiParam({
        name: 'token',
        description: 'Token de recuperación de contraseña',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    @ApiBody({
        type: RestablecerPasswordDto,
        description: 'Nueva contraseña y su confirmación',
    })
    @ApiOkResponse({
        type: MensajeResponseDto,
        description: 'Contraseña restablecida correctamente',
    })
    @ApiNotFoundResponse({ description: 'Token inválido o no encontrado' })
    @ApiUnprocessableEntityResponse({
        description: 'Token expirado o contraseñas no coinciden',
    })
    async restablecer(
        @Param('token') token: string,
        @Body() body: RestablecerPasswordDto,
    ): Promise<{ msg: string }> {
        const usuario = await this.authService.confirmarUsuario(token);
        this.authService.validarTokenExpiracion(usuario);
        this.authService.compararPassword(body.password, body.confirmPassword);
        usuario.passwordHash = await this.authService.hashPass(body.password);
        usuario.token = '';
        usuario.tokenExpiracion = null;
        await this.authService.guardar(usuario);
        return { msg: 'Contraseña reestablecida correctamente' };
    }

    @Post('cambiarPass')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Cambiar contraseña',
        description: 'Cambia la contraseña del usuario autenticado',
    })
    @ApiBody({
        type: CambiarPassDto,
        description: 'Contraseña actual y nueva contraseña',
    })
    @ApiOkResponse({
        type: MensajeResponseDto,
        description: 'Contraseña cambiada correctamente',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - contraseña actual inválida',
    })
    @ApiBadRequestResponse({ description: 'Nuevas contraseñas no coinciden' })
    async cambiarPass(
        @Request() req: UserRequest,
        @Body() body: CambiarPassDto,
    ) {
        const { passwordActual, newPassword, confirmNewPass } = body;
        const user = await this.authService.validarUser(
            req.user.email,
            passwordActual,
        );
        this.authService.compararPassword(newPassword, confirmNewPass);
        user.passwordHash = await this.authService.hashPass(newPassword);
        await this.authService.guardar(user);
        return { msg: 'Contraseña cambiada correctamente' };
    }

    @Get('perfil')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Obtener perfil del usuario',
        description:
            'Obtiene la información completa del perfil del usuario autenticado',
    })
    @ApiOkResponse({
        type: PerfilResponseDto,
        description: 'Perfil del usuario obtenido correctamente',
    })
    @ApiUnauthorizedResponse({
        description: 'No autorizado - token inválido o ausente',
    })
    async getMiPerfil(@Request() req: UserRequest) {
        return await this.authService.obtenerPerfilesCompletos(req.user.email);
    }
}
