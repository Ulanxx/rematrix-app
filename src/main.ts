import 'dotenv/config';
import type { NextFunction, Request, Response } from 'express';
import { json } from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PromptopsInitService } from './modules/promptops/promptops-init.service';

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

  // 初始化 PromptOps 配置
  const promptopsInit = app.get(PromptopsInitService);
  try {
    await promptopsInit.initializeAllStages();
    console.log('[promptops] 所有阶段配置初始化完成');
  } catch (error) {
    console.error('[promptops] 初始化失败:', error);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
