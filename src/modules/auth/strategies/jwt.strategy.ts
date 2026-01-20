import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Payload esperado en el token JWT
 */
interface jwtPayload {
    /** ID del usuario (subject) */
    sub: number;
    /** Email del usuario */
    email: string;
    /** Roles asignados al usuario */
    roles: string[];
}

/**
 * Estrategia JWT para validación de tokens
 * Extrae y valida tokens Bearer de las cabeceras HTTP
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || '',
        });
    }

    /**
     * Valida el payload del token JWT y extrae información del usuario
     * @param payload - Payload decodificado del token JWT
     * @returns Objeto con información del usuario para inyectar en la solicitud
     */
    validate(payload: jwtPayload) {
        return { id: payload.sub, email: payload.email, roles: payload.roles };
    }
}
