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

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}
bootstrap();
