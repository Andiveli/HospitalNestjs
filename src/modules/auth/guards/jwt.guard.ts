import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

/**
 * Guard de autenticación JWT que protege las rutas privadas
 * Permite omitir autenticación en rutas decoradas con @Public()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * Determina si una ruta puede ser accedida
     * Verifica si es pública o requiere autenticación JWT
     * @param context - Contexto de ejecución de la solicitud
     * @returns true si la ruta es pública o si la autenticación es exitosa
     */
    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            IS_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    /**
     * Maneja el resultado de la autenticación
     * @param err - Error ocurrido durante autenticación
     * @param user - Usuario autenticado o null si falló
     * @returns Usuario autenticado o lanza excepción de no autorizado
     */
    handleRequest(err: any, user: any) {
        if (err || !user) {
            throw (
                err ||
                new UnauthorizedException({
                    error: 'El usuario no esta autenticado',
                })
            );
        }
        return user;
    }
}
