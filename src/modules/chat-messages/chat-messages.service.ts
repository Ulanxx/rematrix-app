import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatMessagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    jobId: string,
    role: 'user' | 'assistant',
    content: string,
    metadata?: unknown,
  ) {
    return await (this.prisma as any).chatMessage.create({
      data: {
        jobId,
        role,
        content,
        metadata: metadata as any,
      },
    });
  }

  async findByJobId(jobId: string) {
    return await (this.prisma as any).chatMessage.findMany({
      where: { jobId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string) {
    return await (this.prisma as any).chatMessage.findUnique({ where: { id } });
  }

  async deleteByJobId(jobId: string) {
    return await (this.prisma as any).chatMessage.deleteMany({
      where: { jobId },
    });
  }
}
