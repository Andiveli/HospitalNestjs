import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { PeopleEntity } from 'src/people/people.entity';
import { Repository } from 'typeorm';
import { AuthInterface } from './auth.interface';
import { EstadoUsuarioEntity } from 'src/estado-vida/estado-vida.entity';
import { GeneroEntity } from 'src/generos/generos.entity';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(PeopleEntity)
        private authRepository: Repository<PeopleEntity>,
        private jwtService: JwtService,
        @InjectQueue('email')
        private emailQueue: Queue,
    ) {}

    /**
     * Verifica si un email ya está registrado en el sistema
     * @param email - Email a verificar
     * @returns true si el email no existe, lanza excepción si ya está registrado
     */
    async noExisteEmail(email: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (usuario) throw new ConflictException('El email ya está registrado');
    }

    /**
     * Compara dos contraseñas para verificar que coincidan
     * @param password - Contraseña original
     * @param confirmPassword - Contraseña de confirmación
     * @returns true si las contraseñas coinciden, lanza excepción si no coinciden
     */
    compararPassword(password: string, confirmPassword: string) {
        if (password !== confirmPassword)
            throw new BadRequestException('Las contraseñas no coinciden');
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
                return await this.enviarRecuperacionEmail(existe);
            }
            return await this.authRepository.save(usuario);
        }
        return await this.crearUsuarioToken(usuario);
    }

    async crearUsuarioToken(usuario: AuthInterface) {
        if (
            await this.authRepository.findOne({
                where: { cedula: usuario.cedula },
            })
        )
            throw new ConflictException('La cédula ya está registrada');
        const nuevoUsuario = this.authRepository.create(usuario);
        nuevoUsuario.passwordHash = await this.hashPass(usuario.passwordHash);
        nuevoUsuario.fechaCreacion = new Date();
        nuevoUsuario.token = randomBytes(32).toString('hex');
        nuevoUsuario.genero = { id: 1 } as GeneroEntity;
        nuevoUsuario.estado = { id: 1 } as EstadoUsuarioEntity;
        nuevoUsuario.tokenExpiracion = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
        );
        const user = await this.authRepository.save(nuevoUsuario);
        await this.emailQueue.add('sendEmail', {
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.primerNombre,
            token: nuevoUsuario.token,
            recovery: false,
        });
        return user;
    }

    async enviarRecuperacionEmail(existe: PeopleEntity) {
        existe.token = randomBytes(32).toString('hex');
        await this.emailQueue.add('sendRecovery', {
            email: existe.email,
            nombre: existe.primerNombre,
            token: existe.token,
            recovery: true,
        });
        return await this.authRepository.save(existe);
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
    async confirmarUsuario(token: string): Promise<PeopleEntity> {
        const usuario = await this.authRepository.findOne({ where: { token } });
        if (!usuario) throw new BadRequestException('Token inválido');
        return usuario;
    }

    /**
     * Verifica si un usuario ya ha sido confirmado
     * @param email - Email del usuario a verificar
     * @returns Usuario confirmado, lanza excepción si no está confirmado o no existe
     */
    async usuarioConfirmado(email: string) {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (!usuario) throw new NotFoundException('Usuario no encontrado');
        if (!usuario.verificado)
            throw new UnauthorizedException('Usuario no confirmado');
        return usuario;
    }

    /**
     * Valida las credenciales de un usuario (email y contraseña)
     * @param email - Email del usuario
     * @param password - Contraseña en texto plano
     * @returns Usuario validado, lanza excepción si las credenciales son inválidas
     */
    async validarUser(email: string, password: string): Promise<PeopleEntity> {
        const usuario = await this.usuarioConfirmado(email);
        if (!(await compare(password, usuario.passwordHash)))
            throw new UnauthorizedException('Contraseña incorrecta');
        return usuario;
    }

    /**
     * Obtiene un usuario por su email
     * @param email - Email del usuario a buscar
     * @returns Usuario encontrado, lanza excepción si no existe
     */
    async getByEmail(email: string): Promise<PeopleEntity> {
        const usuario = await this.authRepository.findOne({ where: { email } });
        if (!usuario) throw new NotFoundException('El usuario no existe');
        return usuario;
    }

    /**
     * Genera un token JWT para un usuario
     * @param email - Email del usuario para generar el token
     * @returns Token JWT firmado con los datos del usuario
     */
    async generarJWT(email: string): Promise<string> {
        const userWithRoles = await this.authRepository.findOne({
            where: { email },
            relations: ['roles'],
        });
        if (!userWithRoles) throw new NotFoundException('El usuario no existe');
        const payload = {
            sub: userWithRoles.id,
            email,
            roles: userWithRoles.roles.map((role) => role.nombre),
        };
        return this.jwtService.signAsync(payload);
    }
}
