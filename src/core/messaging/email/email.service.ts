import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transporter, createTransport } from 'nodemailer';
import { join } from 'path';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter!: Transporter;
    private templates: Record<string, HandlebarsTemplateDelegate> = {};
    constructor(private readonly configService: ConfigService) {}

    onModuleInit() {
        const host = this.configService.get<string>('EMAIL_HOST');
        const port = this.configService.get<number>('EMAIL_PORT');
        const user = this.configService.get<string>('EMAIL_USER');
        const pass = this.configService.get<string>('EMAIL_PASS');

        // Validar que las credenciales estén configuradas
        if (!host || !port || !user || !pass) {
            console.error(
                '❌ EmailService: Faltan configurar las variables de entorno EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS',
            );
            return;
        }

        this.transporter = createTransport({
            host,
            port,
            secure: port === 465, // SSL para puerto 465, TLS para otros
            auth: {
                user,
                pass,
            },
        });

        console.log('✅ EmailService inicializado correctamente');
    }

    async enviarEmail(to: string, nombre: string, token: string) {
        const html = this.renderTemplate(
            nombre,
            `${this.configService.get('FRONTEND_URL')}/auth/confirmar/${token}`,
            'confirmacion.html',
        );
        try {
            await this.transporter.sendMail({
                from: `"No Reply" <${this.configService.get('EMAIL_USER')}>`,
                to,
                subject: 'Confirma tu cuenta',
                html,
            });
            return true;
        } catch (error: unknown) {
            console.log(error);
            return false;
        }
    }

    async recuperarEmail(to: string, nombre: string, token: string) {
        const html = this.renderTemplate(
            nombre,
            `${this.configService.get('FRONTEND_URL')}/auth/recuperar-password/${token}`,
            'recuperar.html',
        );
        try {
            await this.transporter.sendMail({
                from: `"No Reply" <${this.configService.get('EMAIL_USER')}>`,
                to,
                subject: 'Recupera tu contraseña',
                html,
            });
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    renderTemplate(nombre: string, url: string, archivo: string): string {
        if (!this.templates[archivo]) {
            // Corrección: La ruta correcta es 'templates' dentro de la misma carpeta
            const filePath = join(__dirname, 'templates', archivo);
            console.log(`📧 Cargando template desde: ${filePath}`);
            const rawHtml = readFileSync(filePath, 'utf8');
            this.templates[archivo] = compile(rawHtml);
        }
        return this.templates[archivo]({ nombre, url });
    }
}
