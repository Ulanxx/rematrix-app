import { Injectable } from '@nestjs/common';
import { tool } from '@langchain/core/tools';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';
import { z } from 'zod';

type AgentMessage = {
  role?: string;
  content?: unknown;
  _getType?: () => string;
  type?: string;
};

type AgentApp = {
  invoke: (inputs: unknown) => Promise<unknown>;
  stream: (
    inputs: unknown,
    options: unknown,
  ) => Promise<AsyncIterable<unknown>>;
};

@Injectable()
export class AppService {
  private weatherAgent?: AgentApp;

  getHello(): string {
    return 'Hello World!';
  }

  private getWeatherAgent(): AgentApp {
    if (this.weatherAgent) return this.weatherAgent;

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      throw new Error('Missing OPENROUTER_API_KEY');
    }

    const weatherTool = tool(
      ({ query }: { query: string }) => {
        return `今天是个做视频的好日子，晴天，25度（${query}）`;
      },
      {
        name: 'get_weather',
        description: '获取天气信息',
        schema: z.object({ query: z.string() }),
      },
    );

    const model = new ChatOpenAI({
      model: 'z-ai/glm-4.6v',
      temperature: 2,
      apiKey,
      configuration: {
        baseURL: 'https://openrouter.ai/api/v1',
      },
    });

    this.weatherAgent = createAgent({
      model,
      tools: [weatherTool],
    }) as unknown as AgentApp;

    return this.weatherAgent;
  }

  private normalizeContent(content: unknown): string {
    if (typeof content === 'string') return content;
    if (content == null) return '';
    try {
      return JSON.stringify(content);
    } catch {
      if (typeof content === 'object' || typeof content === 'function') {
        return '[unserializable]';
      }
      if (typeof content === 'symbol') return content.toString();
      if (
        typeof content === 'string' ||
        typeof content === 'number' ||
        typeof content === 'boolean' ||
        typeof content === 'bigint'
      ) {
        return `${content}`;
      }
      return '';
    }
  }

  private extractMessages(value: unknown): AgentMessage[] {
    if (typeof value !== 'object' || value === null) return [];
    if (!('messages' in value)) return [];

    const messages = (value as Record<string, unknown>).messages;
    if (!Array.isArray(messages)) return [];

    return messages as AgentMessage[];
  }

  private getLastMessage(messages: AgentMessage[]): AgentMessage | undefined {
    if (messages.length === 0) return undefined;
    return messages[messages.length - 1];
  }

  private getMessageRole(message: AgentMessage | undefined): string {
    if (!message) return 'unknown';
    if (typeof message.role === 'string' && message.role) return message.role;
    if (typeof message._getType === 'function') return message._getType();
    if (typeof message.type === 'string' && message.type) return message.type;
    return 'unknown';
  }

  async getWeather(
    query: string,
    debug = false,
  ): Promise<{
    answer: string;
    trace?: Array<{ role: string; content: string }>;
  }> {
    const app = this.getWeatherAgent();
    const inputs = {
      messages: [{ role: 'user', content: query }],
    };

    if (!debug) {
      const result = await app.invoke(inputs);
      const lastMsg = this.getLastMessage(this.extractMessages(result));
      return {
        answer: this.normalizeContent(lastMsg?.content),
      };
    }

    const trace: Array<{ role: string; content: string }> = [];
    let answer = '';
    const stream = await app.stream(inputs, {
      streamMode: 'values',
    });

    for await (const chunk of stream) {
      const lastMsg = this.getLastMessage(this.extractMessages(chunk));
      const role = this.getMessageRole(lastMsg);
      const content = this.normalizeContent(lastMsg?.content);
      answer = content;
      trace.push({ role, content });
    }

    return { answer, trace };
  }
}
