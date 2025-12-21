import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { ChatMessagesService } from './chat-messages.service';

@Controller('chat-messages')
export class ChatMessagesController {
  constructor(private readonly chatMessages: ChatMessagesService) {}

  @Post()
  async create(
    @Body()
    body: {
      jobId: string;
      role: 'user' | 'assistant';
      content: string;
      metadata?: unknown;
    },
  ) {
    const message = await this.chatMessages.create(
      body.jobId,
      body.role,
      body.content,
      body.metadata,
    );
    return { message };
  }

  @Get('job/:jobId')
  async findByJobId(@Param('jobId') jobId: string) {
    const messages = await this.chatMessages.findByJobId(jobId);
    return { messages };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const message = await this.chatMessages.findById(id);
    return { message };
  }

  @Delete('job/:jobId')
  async deleteByJobId(@Param('jobId') jobId: string) {
    await this.chatMessages.deleteByJobId(jobId);
    return { deleted: true };
  }
}
