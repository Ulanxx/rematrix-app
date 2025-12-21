import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
  ExecutionContext,
} from '../step-definition.interface';
import ffmpegImport from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { uploadBufferToBunny } from '../../../utils/bunny-storage';

/**
 * TTS 阶段的输出 Schema
 */
export const ttsOutputSchema = z.object({
  format: z.string(),
  durationSec: z.number(),
  sourceNarrationVersion: z.number().nullable(),
});

/**
 * TTS 阶段的输入 Schema
 */
export const ttsInputSchema = z.object({
  narration: z.object({
    pages: z.array(
      z.object({
        page: z.number(),
        text: z.string(),
      }),
    ),
  }),
});

/**
 * TTS 阶段定义
 * 根据 NARRATION 生成音频文件（当前为占位实现）
 */
export const ttsStep: StepDefinition = createStepDefinition({
  stage: JobStage.TTS,
  type: 'PROCESSING',
  name: 'Text-to-Speech Generation',
  description: '根据旁白文稿生成音频文件，用于视频渲染',

  // 输入配置
  input: {
    sources: [JobStage.NARRATION], // 依赖 NARRATION 阶段
    schema: ttsInputSchema,
    description: 'NARRATION 阶段的旁白文稿',
  },

  // 输出配置
  output: {
    type: ArtifactType.AUDIO,
    schema: ttsOutputSchema,
    description: '生成的音频文件元数据',
  },

  // 执行配置
  execution: {
    requiresApproval: false, // TTS 不需要用户审批
    retryPolicy: {
      maxAttempts: 2,
      backoffMs: 2000,
      maxBackoffMs: 10000,
    },
    timeoutMs: 300000, // 5 分钟超时
  },

  // 自定义执行逻辑
  async customExecute(input: any, context: ExecutionContext): Promise<any> {
    const { narration } = input;

    // MVP: 生成一段静音音频，保证后续 pipeline 可运行
    // 后续可替换为真实的 TTS provider

    ffmpegImport.setFfmpegPath(ffmpegInstaller.path);

    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `rematrix-${context.jobId}-tts-`),
    );
    const outPath = path.join(tmpDir, 'tts.mp3');

    // 计算音频时长（基于旁白文本长度）
    const totalTextLength = narration.pages.reduce(
      (sum: number, page: any) => sum + page.text.length,
      0,
    );
    const estimatedDurationSec = Math.max(
      5,
      Math.min(600, Math.ceil(totalTextLength / 50)),
    ); // 估算：每50字符约1秒

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpegImport() as any;
      cmd
        .input('anullsrc=r=44100:cl=stereo')
        .inputFormat('lavfi')
        .outputOptions([
          '-t',
          String(estimatedDurationSec),
          '-q:a',
          '9',
          '-acodec',
          'libmp3lame',
        ])
        .on('end', () => resolve())
        .on('error', (err: unknown) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        )
        .save(outPath);
    });

    // 上传音频文件到云存储
    let blobUrl: string | null = null;
    try {
      const data = await fs.readFile(outPath);
      const uploadPath = `jobs/${context.jobId}/artifacts/TTS/v1.mp3`;
      const uploaded = await uploadBufferToBunny({
        path: uploadPath,
        contentType: 'audio/mpeg',
        data: new Uint8Array(data),
      });
      blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
    } catch (error) {
      console.warn('[TTS] Upload to cloud storage failed', error);
    }

    // 清理临时文件
    try {
      await fs.rm(tmpDir, { recursive: true });
    } catch (error) {
      console.warn('[TTS] Failed to cleanup temp files', error);
    }

    return {
      format: 'mp3',
      durationSec: estimatedDurationSec,
      sourceNarrationVersion: 1, // 这里应该从实际的 narration artifact 获取版本
      blobUrl,
    };
  },

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      format: 'mp3',
      durationSec: 120,
      sourceNarrationVersion: 1,
    };

    const validation = ttsOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    // 验证格式
    if (testOutput.format !== 'mp3') {
      errors.push('Only MP3 format is supported');
    }

    if (testOutput.durationSec < 1 || testOutput.durationSec > 3600) {
      errors.push('Duration must be between 1 and 3600 seconds');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

export default ttsStep;
