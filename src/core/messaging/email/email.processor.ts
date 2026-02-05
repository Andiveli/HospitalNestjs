import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
@Processor('email')
export class EmailProcessor extends WorkerHost implements OnModuleInit {
    private readonly logger = new Logger(EmailProcessor.name);

    constructor(private readonly emailService: EmailService) {
        super();
    }

    async onModuleInit() {
        // Inicializar el worker
        await this.worker.waitUntilReady();
        this.logger.log(
            '✅ EmailProcessor worker inicializado y escuchando jobs',
        );
    }

    async process(
        job: Job<{
            email: string;
            nombre: string;
            token: string;
        }>,
    ): Promise<void> {
        const { email, nombre, token } = job.data;

        this.logger.log(`📧 Processing job: ${job.name} for ${email}`);

        switch (job.name) {
            case 'sendEmail':
                const successConfirmacion = await this.emailService.enviarEmail(
                    email,
                    nombre,
                    token,
                );
                this.logger.log(
                    `📧 Email de confirmación enviado: ${successConfirmacion}`,
                );
                break;

            case 'sendRecovery':
                const successRecuperacion =
                    await this.emailService.recuperarEmail(
                        email,
                        nombre,
                        token,
                    );
                this.logger.log(
                    `📧 Email de recuperación enviado: ${successRecuperacion}`,
                );
                break;

            default:
                this.logger.warn(`⚠️ Unknown job type: ${job.name}`);
        }
    }
}
