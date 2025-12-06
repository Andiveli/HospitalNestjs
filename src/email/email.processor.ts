import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { EmailService } from './email.service';
@Processor('email')
export class EmailProcessor {
    constructor(private readonly emailService: EmailService) {}

    @Process('sendEmail')
    async handleSendVerification(
        job: Job<{
            email: string;
            nombre: string;
            token: string;
            recovery: boolean;
        }>,
    ) {
        const { email, nombre, token, recovery } = job.data;

        if (recovery) {
            await this.emailService.recuperarEmail(email, nombre, token);
        }
        await this.emailService.enviarEmail(email, nombre, token);
    }
}
