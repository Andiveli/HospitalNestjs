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

    async compararPassword(
        password: string,
        confirmPassword: string,
    ): Promise<boolean> {
        if (password !== confirmPassword) {
            throw new HttpException(
                'Las contraseñas no coinciden',
                HttpStatus.BAD_REQUEST,
            );
        }
        return true;
    }

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

    async hashPass(password: string): Promise<string> {
        return await hash(password, 10);
    }

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

    async comprobarPass(email: string, password: string): Promise<boolean> {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            const passValida = await compare(password, usuario.password);
            if (passValida) {
                return true;
            }
            throw new HttpException(
                'Contraseña incorrecta',
                HttpStatus.UNAUTHORIZED,
            );
        }
        throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    async getByEmail(email: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) {
            return usuario;
        }
        throw new HttpException('El usuario no existe', HttpStatus.NOT_FOUND);
    }

    async generarJWT(id: number, nombre: string): Promise<string> {
        const payload = { username: nombre, sub: id };
        return this.jwtService.signAsync(payload);
    }
}
