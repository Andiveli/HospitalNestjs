import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PeopleEntity } from 'src/people/people.entity';

/**
 * Servicio de limpieza automática de tokens expirados
 * Se ejecuta mediante cron job para mantener la base de datos limpia
 */
@Injectable()
export class TokenCleanupService {
    private readonly logger = new Logger(TokenCleanupService.name);

    constructor(
        @InjectRepository(PeopleEntity)
        private readonly peopleRepo: Repository<PeopleEntity>,
    ) {}

    /**
     * Limpia todos los tokens de verificación/recuperación que han expirado
     * Se ejecuta automáticamente todos los días a medianoche
     * Elimina el token y su fecha de expiración de usuarios con tokens vencidos
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async clearExpiredTokens() {
        const now = new Date();

        const result = await this.peopleRepo
            .createQueryBuilder()
            .update(PeopleEntity)
            .set({
                token: '',
                tokenExpiracion: null,
            })
            .where('tokenExpiracion IS NOT NULL')
            .andWhere('tokenExpiracion < :now', { now })
            .execute();

        this.logger.log(`Tokens expirados limpiados: ${result.affected}`);
    }
}
