import { InjectQueue } from '@nestjs/bullmq';
import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Queue } from 'bullmq';
import type { Cache } from 'cache-manager';
import { randomBytes } from 'crypto';
import { EstadoUsuarioEntity } from 'src/estado-vida/estado-vida.entity';
import { GeneroEntity } from 'src/generos/generos.entity';
import { PeopleEntity } from 'src/people/people.entity';
import { PerfilContext } from 'src/perfiles/perfil.context';
import { RolesEntity } from 'src/roles/roles.entity';
import { Repository } from 'typeorm';
import { AuthInterface } from './auth.interface';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        @InjectRepository(PeopleEntity)
        private authRepository: Repository<PeopleEntity>,
        @InjectQueue('email')
        private emailQueue: Queue,
        @Inject('CACHE_MANAGER')
        private cache: Cache,
        @InjectRepository(GeneroEntity)
        private genero: Repository<GeneroEntity>,
        @InjectRepository(RolesEntity)
        private rolesRepository: Repository<RolesEntity>,
        private perfilContext: PerfilContext,
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
            const user = await this.authRepository.save(usuario);
            await this.cache.del(this.cacheKey(user.email));
            return user;
        }
        return await this.crearUsuarioToken(usuario);
    }

    async getGeneroById(id: number): Promise<GeneroEntity> {
        const genero = await this.genero.findOne({ where: { id } });
        if (!genero) throw new NotFoundException('Género no valido');
        return genero;
    }

    async crearUsuarioToken(usuario: AuthInterface) {
        const existe = await this.authRepository.findOne({
            where: { cedula: usuario.cedula },
        });
        if (existe) throw new ConflictException('La cédula ya está registrada');
        const rolPaciente = await this.rolesRepository.findOne({
            where: { nombre: 'paciente' },
        });
        if (!rolPaciente)
            throw new NotFoundException('Rol por defecto no encontrado');
        const nuevoUsuario = this.authRepository.create(usuario);
        nuevoUsuario.passwordHash = await this.hashPass(usuario.passwordHash);
        nuevoUsuario.fechaCreacion = new Date();
        nuevoUsuario.token = randomBytes(32).toString('hex');
        nuevoUsuario.estado = { id: 1 } as EstadoUsuarioEntity;
        nuevoUsuario.tokenExpiracion = new Date(
            Date.now() + 24 * 60 * 60 * 1000,
        );

        // Asignar el rol por defecto
        nuevoUsuario.roles = [rolPaciente];

        const user = await this.authRepository.save(nuevoUsuario);
        await this.emailQueue.add('sendEmail', {
            email: nuevoUsuario.email,
            nombre: nuevoUsuario.primerNombre,
            token: nuevoUsuario.token,
        });
        return user;
    }

    async enviarRecuperacionEmail(existe: PeopleEntity) {
        existe.token = randomBytes(32).toString('hex');
        existe.tokenExpiracion = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await this.emailQueue.add('sendRecovery', {
            email: existe.email,
            nombre: existe.primerNombre,
            token: existe.token,
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

    validarTokenExpiracion(usuario: PeopleEntity) {
        const fechaExp = usuario.tokenExpiracion;
        if (!fechaExp || fechaExp < new Date()) {
            throw new BadRequestException('El token ha expirado');
        }
        return;
    }

    async obtenerPerfilesCompletos(email: string) {
        const userCached = await this.cache.get(this.cacheKey(email));
        if (userCached) {
            console.log('Cache hit for user:', email);
            return userCached;
        }
        const user = await this.authRepository.findOne({
            where: { email },
            relations: ['roles'],
        });
        if (!user) throw new NotFoundException('El usuario no existe');
        const perfil = await this.perfilContext.obtenerPerfilesCompletos(user);
        await this.cache.set(this.cacheKey(user.email), perfil);
        console.log('Cache set for user:', user.email);
        return perfil;
    }

    private cacheKey(email: string) {
        return `user:${email}`;
    }
}
