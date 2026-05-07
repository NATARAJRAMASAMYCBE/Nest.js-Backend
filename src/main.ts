import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
        })
    );

    app.enableCors({
        origin: 'http://localhost:2026',
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type, Authorization',
    });

    console.log('DATABASE_URL:', process.env.DATABASE_URL);

    await app.listen(7000);
}

bootstrap();
