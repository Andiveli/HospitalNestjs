import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import UserRequest from '../people/people.request';
import { ROLES_KEY } from './roles.decorator';
import { Rol } from './roles.enum';

/**
 * Guard de roles que protege las rutas según los roles del usuario
 *
 * NOTA: Este guard detecta conexiones WebSocket y las omite ya que
 * la autorización de WebSocket se maneja de forma diferente
 * (generalmente dentro del gateway)
 */
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        // Omitir verificación de roles para WebSocket - se maneja en el gateway
        const contextType = context.getType();
        if (contextType === 'ws') {
            return true;
        }

        const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest<Request>();
        if (!request) {
            throw new Error(
                'Request no disponible en el contexto de ejecución',
            );
        }
        const user = request.user as UserRequest['user'];
        const hasAccess = requiredRoles.some((rol) =>
            user.roles?.includes(rol),
        );
        return hasAccess;
    }
}
