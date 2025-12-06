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
import { AuthService } from './auth.service';
import { SingupDto } from './dto/signup.dto';
import { LocalAuthGuard } from './local.guard';
import { Public } from './public.decorator';
import UserRequest from 'src/people/people.request';
import { CambiarPassDto } from './dto/cambiarPass.dto';

/**
 * Controlador de autenticación
 * Maneja el registro, login, confirmación de usuarios y recuperación de contraseña
 */
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
    async signUp(@Body() body: SingupDto): Promise<{ msg: string }> {
        await this.authService.noExisteEmail(body.email);
        this.authService.compararPassword(
            body.passwordHash,
            body.confirmPassword,
        );
        await this.authService.guardar(body);
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
    async confirmarUsuario(
        @Param('token') token: string,
    ): Promise<{ msg: string }> {
        const usuarioConfirmar = await this.authService.confirmarUsuario(token);
        usuarioConfirmar.token = '';
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
    async auth(@Request() req: UserRequest) {
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
    async olvidePassword(
        @Body('email') email: string,
    ): Promise<{ msg: string }> {
        const usuario = await this.authService.getByEmail(email);
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
    async restablecer(
        @Param('token') token: string,
        @Body('password') password: string,
        @Body('confirmPassword') confirmPassword: string,
    ): Promise<{ msg: string }> {
        const usuario = await this.authService.confirmarUsuario(token);
        this.authService.compararPassword(password, confirmPassword);
        usuario.passwordHash = await this.authService.hashPass(password);
        usuario.token = '';
        await this.authService.guardar(usuario);
        return { msg: 'Contraseña reestablecida correctamente' };
    }

    @Post('cambiarPass')
    @HttpCode(HttpStatus.OK)
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
}
