import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AccessLogMiddleware } from './common/access-log.middleware';
import { AccessLogHistoryService } from './common/access-log-history.service';
import * as path from 'path';
import * as fs from 'fs';
import express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(helmet());
  app.use(compression());
  // Sử dụng DI, lấy service bằng token class
  try {
    const accessLogHistoryService = app.get(AccessLogHistoryService);
    const accessLogMiddleware = new AccessLogMiddleware(accessLogHistoryService);
    app.use((req: Request, res: Response, next: NextFunction) => {
      try {
        accessLogMiddleware.use(req, res, next);
      } catch (error) {
        console.error('Error in access log middleware:', error);
        next(); // Ensure the request continues even if logging fails
      }
    });
  } catch (error) {
    console.error('Failed to setup access log middleware:', error);
    // Continue application startup even if middleware setup fails
  }
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidUnknownValues: true,
  }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  // If a built frontend exists (e.g. frontend/dist), serve it and fallback to index.html
  try {
    const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist')
    const devIndex = path.join(__dirname, '..', '..', 'frontend', 'index.html')
    const server = app.getHttpAdapter().getInstance() as express.Express

    if (fs.existsSync(distPath)) {
      // If a production build exists, serve it
      server.use(express.static(distPath))
      server.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api')) return next()
        res.sendFile(path.join(distPath, 'index.html'))
      })
      console.log('Serving frontend from', distPath)
    } else if (fs.existsSync(devIndex)) {
      // In dev without a build, serve the simple index.html as a fallback
      const frontendRoot = path.join(__dirname, '..', '..', 'frontend')
      server.use(express.static(frontendRoot))
      server.get('*', (req: Request, res: Response, next: NextFunction) => {
        if (req.path.startsWith('/api')) return next()
        res.sendFile(devIndex)
      })
      console.log('Serving frontend index.html from', devIndex)
    } else {
      // No frontend available; skip static serving
      console.log('No frontend found at', distPath, 'or', devIndex)
    }
  } catch (err) {
    console.error('Error while configuring static frontend serving:', err)
  }

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
