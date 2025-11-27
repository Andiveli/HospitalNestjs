import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class PeopleGuard implements CanActivate {
    constructor() {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || user.rol !== 'admin') {
            throw new Error('No tienes permiso para acceder a esta ruta');
        }
        return true;
    }
}
