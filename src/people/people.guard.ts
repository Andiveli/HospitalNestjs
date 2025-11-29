import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
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
            console.log(user);
            throw new ForbiddenException(
                'Access denied: Solo los administradores pueden realizar esta acción.',
            );
        }
        return true;
    }
}
