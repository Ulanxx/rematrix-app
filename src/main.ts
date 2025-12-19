import 'dotenv/config';
import type { NextFunction, Request, Response } from 'express';
import { json } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(json({ limit: '5mb' }));

  app.use((req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    const { method, originalUrl } = req;
    res.on('finish', () => {
      const ms = Date.now() - startedAt;
      console.log(
        `[http] ${method} ${originalUrl} -> ${res.statusCode} (${ms}ms)`,
      );
    });
    next();
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
