import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import UserRequest from '../people/people.request';
import { ROLES_KEY } from './roles.decorator';
import { Rol } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
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
