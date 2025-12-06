import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import UserRequest from './people.request';
import { Request } from 'express';
import { Rol } from 'src/roles/roles.enum';

@Injectable()
export class PeopleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        if (!request.user) {
            throw new ForbiddenException('Usuario no autenticado');
        }
        const user = request.user as UserRequest['user'];
        const userRoles: string[] = user.roles || [];
        if (!userRoles.includes(Rol.Admin)) {
            throw new ForbiddenException('Solo administradores pueden acceder');
        }
        return true;
    }
}
