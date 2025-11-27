import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SingupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './auth.public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async signUp(@Body() body: SingupDto): Promise<{ msg: string }> {
        const { nombre, apellido, email, password, confirmPassword } = body;
        await this.authService.noExisteEmail(email);
        await this.authService.compararPassword(password, confirmPassword);
        await this.authService.guardar({ nombre, apellido, email, password });
        return { msg: 'Usuario registrado correctamente' };
    }

    @Public()
    @Get('confirmar/:token')
    @HttpCode(HttpStatus.OK)
    async confirmarUsuario(
        @Param('token') token: string,
    ): Promise<{ msg: string }> {
        const usuarioConfirmar = await this.authService.confirmarUsuario(token);
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await this.authService.guardar(usuarioConfirmar);
        return { msg: 'Usuario confirmado correctamente' };
    }

    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async auth(@Body() body: LoginDto) {
        const { email, password } = body;
        const usuario = await this.authService.usuarioConfirmado(email);
        if (await this.authService.comprobarPass(email, password)) {
            return {
                id: usuario.id,
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                admin: usuario.rol === 'admin' ? true : false,
                token: await this.authService.generarJWT(
                    usuario.id,
                    usuario.nombre,
                ),
            };
        } else {
            const error = new Error('Contraseña incorrecta');
            throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
        }
    }

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

    @Public()
    @Get('recuperar-password/:token')
    @HttpCode(HttpStatus.OK)
    async comprobarToken(
        @Param('token') token: string,
    ): Promise<{ msg: string }> {
        await this.authService.confirmarUsuario(token);
        return { msg: 'Coloca tu nueva contraseña' };
    }

    @Public()
    @Post('recuperar-password/:token')
    @HttpCode(HttpStatus.OK)
    async restablecer(
        @Param('token') token: string,
        @Body('password') password: string,
        @Body('confirmPassword') confirmPassword: string,
    ): Promise<{ msg: string }> {
        const usuario = await this.authService.confirmarUsuario(token);
        await this.authService.compararPassword(password, confirmPassword);
        usuario.password = await this.authService.hashPass(password);
        usuario.token = null;
        await this.authService.guardar(usuario);
        return { msg: 'Contraseña reestablecida correctamente' };
    }
}
