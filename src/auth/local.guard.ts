import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard de autenticación local para login
 * Utiliza la estrategia LocalStrategy para validar email y contraseña
 */
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
