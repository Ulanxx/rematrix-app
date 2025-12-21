import { Module } from '@nestjs/common';
import { ChatMessagesController } from './chat-messages.controller';
import { ChatMessagesService } from './chat-messages.service';

@Module({
  controllers: [ChatMessagesController],
  providers: [ChatMessagesService],
  exports: [ChatMessagesService],
})
export class ChatMessagesModule {}
