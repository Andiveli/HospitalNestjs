import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PeopleEntity } from 'src/people/people.entity';
import { Repository } from 'typeorm';
import { compare, hash } from 'bcrypt';
import { EmailService } from 'src/email/email.service';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { AuthInterface } from './auth.interface';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(PeopleEntity)
        private authRepository: Repository<PeopleEntity>,
        private mailService: EmailService,
        private jwtService: JwtService,
    ) {}

    /**
     * Verifica si un email ya está registrado en el sistema
     * @param email - Email a verificar
     * @returns true si el email no existe, lanza excepción si ya está registrado
     */
    async noExisteEmail(email: string): Promise<boolean> {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            throw new HttpException(
                'El email ya está registrado',
                HttpStatus.BAD_REQUEST,
            );
        }
        return true;
    }

    /**
     * Compara dos contraseñas para verificar que coincidan
     * @param password - Contraseña original
     * @param confirmPassword - Contraseña de confirmación
     * @returns true si las contraseñas coinciden, lanza excepción si no coinciden
     */
    compararPassword(password: string, confirmPassword: string): boolean {
        if (password !== confirmPassword) {
            throw new HttpException(
                'Las contraseñas no coinciden',
                HttpStatus.BAD_REQUEST,
            );
        }
        return true;
    }

    /**
     * Guarda un usuario en la base de datos, ya sea creando uno nuevo o actualizando uno existente
     * @param usuario - Datos del usuario a guardar
     * @param enviarEmail - Indica si se debe enviar email de recuperación (default: false)
     * @returns Usuario guardado con su token generado
     */
    async guardar(usuario: AuthInterface, enviarEmail: boolean = false) {
        const existe = await this.authRepository.findOne({
            where: { email: usuario.email },
        });
        if (existe) {
            if (enviarEmail) {
                usuario.token = randomBytes(32).toString('hex');
                await this.mailService.recuperarEmail(
                    existe.email,
                    existe.nombre,
                    usuario.token,
                );
            }
            const resultado = await this.authRepository.save(usuario);
            return resultado;
        }
        const nuevoUsuario = this.authRepository.create(usuario);
        nuevoUsuario.password = await this.hashPass(nuevoUsuario.password);
        nuevoUsuario.token = randomBytes(32).toString('hex');
        const resultado = await this.authRepository.save(nuevoUsuario);
        await this.mailService.enviarEmail(
            nuevoUsuario.email,
            nuevoUsuario.nombre,
            nuevoUsuario.token,
        );
        return resultado;
    }

    /**
     * Hashea una contraseña usando bcrypt
     * @param password - Contraseña en texto plano a hashear
     * @returns Contraseña hasheada
     */
    async hashPass(password: string): Promise<string> {
        return await hash(password, 10);
    }

    /**
     * Confirma un usuario mediante su token de verificación
     * @param token - Token de confirmación enviado por email
     * @returns Usuario encontrado con el token válido
     */
    async confirmarUsuario(token: string) {
        const usuario = await this.authRepository.findOne({ where: { token } });
        if (usuario) {
            return usuario;
        }
        throw new HttpException(
            'Token inválido o usuario no encontrado',
            HttpStatus.BAD_REQUEST,
        );
    }

    /**
     * Verifica si un usuario ya ha sido confirmado
     * @param email - Email del usuario a verificar
     * @returns Usuario confirmado, lanza excepción si no está confirmado o no existe
     */
    async usuarioConfirmado(email: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            if (usuario.confirmado) {
                return usuario;
            }
            throw new HttpException(
                'El usuario no ha sido confirmado',
                HttpStatus.UNAUTHORIZED,
            );
        }
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    /**
     * Valida las credenciales de un usuario (email y contraseña)
     * @param email - Email del usuario
     * @param password - Contraseña en texto plano
     * @returns Usuario validado, lanza excepción si las credenciales son inválidas
     */
    async validarUser(email: string, password: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            const passValida = await compare(password, usuario.password);
            if (passValida) {
                return usuario;
            }
            throw new HttpException(
                'Contraseña incorrecta',
                HttpStatus.UNAUTHORIZED,
            );
        }
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    /**
     * Obtiene un usuario por su email
     * @param email - Email del usuario a buscar
     * @returns Usuario encontrado, lanza excepción si no existe
     */
    async getByEmail(email: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            return usuario;
        }
        throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
    }

    /**
     * Genera un token JWT para un usuario
     * @param email - Email del usuario para generar el token
     * @returns Token JWT firmado con los datos del usuario
     */
    async generarJWT(email: string): Promise<string> {
        const user = await this.authRepository.findOne({ where: { email } });
        const payload = { sub: user?.id, email: user?.email, rol: user?.rol };
        return this.jwtService.signAsync(payload);
    }
}
