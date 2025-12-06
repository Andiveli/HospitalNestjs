import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';

@Injectable()
@Processor('email')
export class EmailProcessor extends WorkerHost {
    constructor(private readonly emailService: EmailService) {
        super();
    }

    async process(
        job: Job<{
            email: string;
            nombre: string;
            token: string;
        }>,
    ): Promise<void> {
        const { email, nombre, token } = job.data;

        console.log(`📧 Processing job: ${job.name} for ${email}`);

        switch (job.name) {
            case 'sendEmail':
                await this.emailService.enviarEmail(email, nombre, token);
                break;

            case 'sendRecovery':
                await this.emailService.recuperarEmail(email, nombre, token);
                break;

            default:
                console.warn(`⚠️ Unknown job type: ${job.name}`);
        }
    }
}
