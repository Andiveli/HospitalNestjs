import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Rol } from './roles.enum';
import { ROLES_KEY } from './roles.decorator';
import UserRequest from 'src/people/people.request';
import { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Rol[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );
        console.log('🔍 Required roles:', requiredRoles);

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
        console.log('👤 User roles:', user.roles);
        console.log('🔍 First role type:', typeof user.roles?.[0]);

        const hasAccess = requiredRoles.some((rol) =>
            user.roles?.includes(rol),
        );
        console.log('✅ Has access:', hasAccess);

        return hasAccess;
    }
}
