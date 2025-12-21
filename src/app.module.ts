import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArtifactsModule } from './modules/artifacts/artifacts.module';
import { ChatMessagesModule } from './modules/chat-messages/chat-messages.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { PageGenerationModule } from './modules/page-generation/page-generation.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { PromptopsModule } from './modules/promptops/promptops.module';
import { StorageModule } from './modules/storage/storage.module';
import { TemporalModule } from './modules/temporal/temporal.module';
import { WorkflowEngineModule } from './modules/workflow-engine/workflow-engine.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TemporalModule,
    JobsModule,
    ArtifactsModule,
    PromptopsModule,
    StorageModule,
    ChatMessagesModule,
    WorkflowEngineModule,
    PageGenerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
