import { SetMetadata } from '@nestjs/common';

/** Clave de metadata para identificar rutas públicas */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorador que marca una ruta como pública (no requiere autenticación)
 * @returns Decorador SetMetadata con la clave isPublic en true
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
