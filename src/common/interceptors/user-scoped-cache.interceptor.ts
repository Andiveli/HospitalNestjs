import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import UserRequest from 'src/features/people/people.request';

/**
 * Interceptor de caché con ámbito de usuario.
 *
 * Este interceptor extiende la funcionalidad del CacheInterceptor de NestJS
 * para incluir el ID del usuario autenticado en la clave de caché.
 *
 * Esto asegura que cada usuario tenga su propia caché aislada,
 * evitando que un usuario vea los datos de otro.
 *
 * Uso:
 * ```typescript
 * @UseInterceptors(UserScopedCacheInterceptor)
 * @CacheTTL(300000)
 * @Get('proximas')
 * async getProximasCitas(@Request() req: UserRequest) { ... }
 * ```
 */
@Injectable()
export class UserScopedCacheInterceptor implements NestInterceptor {
    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly reflector: Reflector,
    ) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Promise<Observable<unknown>> {
        const request = context.switchToHttp().getRequest<UserRequest>();
        const userId = request.user?.id;

        // Si no hay usuario autenticado, no usar caché (fallback a comportamiento normal)
        if (!userId) {
            return next.handle();
        }

        const cacheKey = this.generateCacheKey(context, userId);
        const ttl = this.getTTL(context);

        // Intentar obtener de caché
        const cachedValue = await this.cacheManager.get<unknown>(cacheKey);

        if (cachedValue) {
            return of(cachedValue);
        }

        // Si no está en caché, ejecutar el handler y guardar en caché
        return next.handle().pipe(
            tap((response) => {
                // Solo cachear respuestas exitosas
                if (response && typeof response === 'object') {
                    this.cacheManager
                        .set(cacheKey, response, ttl)
                        .catch((err) => {
                            console.error('Error al guardar en caché:', err);
                        });
                }
            }),
        );
    }

    /**
     * Genera una clave de caché única que incluye el ID del usuario
     */
    private generateCacheKey(
        context: ExecutionContext,
        userId: number,
    ): string {
        const request = context.switchToHttp().getRequest();
        const method = request.method;
        const url = request.originalUrl || request.url;

        // Permitir clave personalizada via @CacheKey() decorator
        const customKey = this.reflector.get<string>(
            CacheKey,
            context.getHandler(),
        );

        if (customKey) {
            return `user:${userId}:${customKey}`;
        }

        // Clave basada en método + URL + usuario
        return `user:${userId}:${method}:${url}`;
    }

    /**
     * Obtiene el TTL del caché desde el decorador @CacheTTL() o usa el default
     */
    private getTTL(context: ExecutionContext): number {
        const ttl = this.reflector.get<number>(CacheTTL, context.getHandler());

        // Default 5 minutos si no se especifica
        return ttl ?? 300000;
    }
}

/**
 * Genera una clave de caché específica para un usuario.
 * Útil para invalidación manual de caché.
 *
 * @param userId - ID del usuario
 * @param suffix - Sufijo opcional para identificar el recurso
 * @returns Clave de caché formateada
 *
 * Ejemplo:
 * ```typescript
 * const key = generateUserCacheKey(123, 'citas:proximas');
 * // Resultado: 'user:123:citas:proximas'
 * await this.cacheManager.del(key);
 * ```
 */
export function generateUserCacheKey(userId: number, suffix?: string): string {
    return suffix ? `user:${userId}:${suffix}` : `user:${userId}`;
}

/**
 * Genera un patrón de clave de caché para invalidación por patrón.
 * Útil para invalidar todas las cachés de un usuario específico.
 *
 * @param userId - ID del usuario
 * @returns Patrón de clave de caché
 *
 * Ejemplo:
 * ```typescript
 * const pattern = generateUserCachePattern(123);
 * // Resultado: 'user:123:*'
 * // Invalida todas las cachés del usuario 123
 * ```
 */
export function generateUserCachePattern(userId: number): string {
    return `user:${userId}:*`;
}
