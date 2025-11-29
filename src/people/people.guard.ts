import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import UserRequest from './people.request';
import { Request } from 'express';

@Injectable()
export class PeopleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        if (!request.user) {
            throw new ForbiddenException('Usuario no autenticado');
        }
        const user = request.user as UserRequest['user'];
        if (user.rol !== 'admin') {
            throw new ForbiddenException('Solo administradores pueden acceder');
        }
        return true;
    }
}
