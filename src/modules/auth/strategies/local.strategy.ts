import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * Estrategia local para autenticación con email y contraseña
 * Utilizada en el endpoint de login para validar credenciales
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            usernameField: 'email',
        });
    }

    /**
     * Valida las credenciales del usuario usando email y contraseña
     * @param email - Email del usuario (tratado como username)
     * @param password - Contraseña del usuario
     * @returns Usuario validado con todos sus datos
     */
    async validate(email: string, password: string) {
        return await this.authService.validarUser(email, password);
    }
}
