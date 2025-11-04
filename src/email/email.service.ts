import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as path from 'path';
import * as fs from 'fs';
import * as hbs from 'handlebars';

@Injectable()
export class EmailService implements OnModuleInit {
    private transporter;
    constructor( private readonly configService: ConfigService ) {
    }

    onModuleInit() {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('EMAIL_HOST'),
            port: this.configService.get('EMAIL_PORT'),
            secure: false,
            auth: {
                user: this.configService.get('EMAIL_USER'),
                pass: this.configService.get('EMAIL_PASS'),
            },
        });
    }

    async enviarEmail(to: string, nombre: string, token: string) {
        const html = this.renderTemplate(nombre, `${this.configService.get('FRONTEND_URL')}/auth/confirmar/${token}`, 'confirmacion.html');
        await this.transporter.sendMail({
            from: `"No Reply" <${this.configService.get('EMAIL_USER')}>`,
            to,
            subject: 'Confirma tu cuenta',
            html
        });
    }

    async recuperarEmail(to: string, nombre: string, token: string) {
        const html = this.renderTemplate(nombre, `${this.configService.get('FRONTEND_URL')}/auth/recuperar-password/${token}`, 'recuperar.html');
        await this.transporter.sendMail({
            from: `"No Reply" <${this.configService.get('EMAIL_USER')}>`,
            to,
            subject: 'Recupera tu contraseña',
            html
        });
    }

    renderTemplate(nombre: string, url: string, archivo: string): string {
        const filePath = path.join(__dirname, '..', 'email/templates', archivo);
        const rawHtml = fs.readFileSync(filePath, 'utf8');
        const template = hbs.compile(rawHtml);
        return template({ nombre, url });
    }
}
