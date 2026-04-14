import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Server } from 'node:http';
import { AppModule } from './AppModule';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    const requestTimeoutMs = Number(process.env.REQUEST_TIMEOUT_MS ?? 120000);
    const server = app.getHttpServer() as Server;

    server.requestTimeout = requestTimeoutMs;
    server.headersTimeout = requestTimeoutMs + 1000;

    await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
