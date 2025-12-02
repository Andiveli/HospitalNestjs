import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

    const configAPI = new DocumentBuilder()
        .setTitle('Hospital Nestjs')
        .setDescription('Documentación de la api del hospital nestjs')
        .addServer('http://localhost:3000')
        .setVersion('1.0')
        .build();

    const documentAPI = SwaggerModule.createDocument(app, configAPI);
    SwaggerModule.setup('api', app, documentAPI);

    await app.listen(process.env.PORT ?? 3000);
    console.log(`Server running on port ${process.env.PORT ?? 3000}`);
}
bootstrap();
