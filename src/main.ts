import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { createSwaggerConfig } from './common/swagger/swagger.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(
        new ValidationPipe({
            stopAtFirstError: true,
            whitelist: true,
            transform: true,
        }),
    );

    const configService = app.get<ConfigService>(ConfigService);
    app.enableCors({
        origin: configService.get<string>('FRONTEND_URL'),
    });

    // Swagger solo en desarrollo o con token de acceso
    if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_TOKEN) {
        const configAPI = createSwaggerConfig();
        const documentAPI = SwaggerModule.createDocument(app, configAPI);

        // Middleware de protección para Swagger en producción
        if (
            process.env.NODE_ENV === 'production' &&
            process.env.SWAGGER_TOKEN
        ) {
            app.use('/api', (req, res, next) => {
                const authHeader = req.headers.authorization;
                if (
                    !authHeader ||
                    authHeader !== `Bearer ${process.env.SWAGGER_TOKEN}`
                ) {
                    return res.status(401).json({
                        message:
                            'Unauthorized - API documentation requires valid token',
                    });
                }
                next();
            });
        }

        SwaggerModule.setup('api', app, documentAPI, {
            customSiteTitle: '🏥 Hospital API Documentation',
            customCss: `
            .swagger-ui .topbar { display: none }
            .swagger-ui .info { margin: 50px 0 }
            .swagger-ui .scheme-container { margin: 30px 0 }
            .swagger-ui .info .title { color: #2563eb }
        `,
            swaggerOptions: {
                persistAuthorization: true,
                displayRequestDuration: true,
                filter: true,
                showExtensions: true,
                showCommonExtensions: true,
                defaultModelsExpandDepth: 2,
                defaultModelExpandDepth: 2,
            },
        });
    }

    await app.listen(process.env.PORT ?? 3000);
    console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
    if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_TOKEN) {
        console.log(
            `📚 Swagger docs available at http://localhost:${process.env.PORT ?? 3000}/api`,
        );
        if (process.env.NODE_ENV === 'production') {
            console.log(`🔐 Swagger protected with Bearer token`);
        }
    }
}
bootstrap();
