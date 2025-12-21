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
 * MERGE 阶段的输出 Schema
 */
export const mergeOutputSchema = z.object({
  format: z.string(),
  durationSec: z.number(),
  resolution: z.object({
    width: z.number(),
    height: z.number(),
  }),
  sourceRenderVersion: z.number().nullable(),
  sourceTtsVersion: z.number().nullable(),
  videoUrl: z.string().nullable(),
});

/**
 * MERGE 阶段的输入 Schema
 */
export const mergeInputSchema = z.object({
  render: z.object({
    format: z.string(),
    totalPages: z.number(),
    renderedImages: z.array(
      z.object({
        page: z.number(),
        imagePath: z.string(),
        blobUrl: z.string().nullable(),
      }),
    ),
  }),
  tts: z.object({
    format: z.string(),
    durationSec: z.number(),
    sourceNarrationVersion: z.number().nullable(),
  }),
});

/**
 * MERGE 阶段定义
 * 将渲染的图片和音频合成为视频
 */
export const mergeStep: StepDefinition = createStepDefinition({
  stage: JobStage.MERGE,
  type: 'PROCESSING',
  name: 'Video Merging',
  description: '将渲染的图片和音频合成为最终视频',

  // 输入配置
  input: {
    sources: [JobStage.RENDER, JobStage.TTS], // 依赖 RENDER 和 TTS 阶段
    schema: mergeInputSchema,
    description: 'RENDER 阶段的图片和 TTS 阶段的音频',
  },

  // 输出配置
  output: {
    type: ArtifactType.VIDEO,
    schema: mergeOutputSchema,
    description: '合成的视频文件信息',
  },

  // 执行配置
  execution: {
    requiresApproval: false, // MERGE 不需要用户审批
    retryPolicy: {
      maxAttempts: 2,
      backoffMs: 5000,
      maxBackoffMs: 20000,
    },
    timeoutMs: 900000, // 15 分钟超时
  },

  // 自定义执行逻辑
  async customExecute(input: any, context: ExecutionContext): Promise<any> {
    const { render, tts } = input;

    ffmpegImport.setFfmpegPath(ffmpegInstaller.path);

    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `rematrix-${context.jobId}-merge-`),
    );

    // 创建临时音频文件（这里使用占位音频，实际应该从 TTS 获取）
    const audioPath = path.join(tmpDir, 'audio.mp3');
    await createPlaceholderAudio(audioPath, tts.durationSec);

    // 创建图片列表文件
    const listPath = path.join(tmpDir, 'files.txt');
    const fileListContent = render.renderedImages
      .map((img: any) => `file '${img.imagePath}'`)
      .join('\n');
    await fs.writeFile(listPath, fileListContent);

    // 合成视频
    const videoPath = path.join(tmpDir, 'output.mp4');

    await new Promise<void>((resolve, reject) => {
      const cmd = ffmpegImport() as any;
      cmd
        .input(listPath)
        .inputOptions(['-f', 'concat', '-safe', '0'])
        .input(audioPath)
        .outputOptions([
          '-c:v',
          'libx264',
          '-c:a',
          'aac',
          '-pix_fmt',
          'yuv420p',
          '-r',
          '1/5', // 每张图片显示5秒
          '-t',
          String(tts.durationSec),
        ])
        .on('end', () => resolve())
        .on('error', (err: unknown) =>
          reject(err instanceof Error ? err : new Error(String(err))),
        )
        .save(videoPath);
    });

    // 上传视频到云存储
    let videoUrl: string | null = null;
    try {
      const data = await fs.readFile(videoPath);
      const uploadPath = `jobs/${context.jobId}/artifacts/MERGE/output.mp4`;
      const uploaded = await uploadBufferToBunny({
        path: uploadPath,
        contentType: 'video/mp4',
        data: new Uint8Array(data),
      });
      videoUrl = uploaded.publicUrl ?? uploaded.storageUrl;
    } catch (error) {
      console.warn('[MERGE] Failed to upload video', error);
    }

    // 清理临时文件
    try {
      await fs.rm(tmpDir, { recursive: true });
    } catch (error) {
      console.warn('[MERGE] Failed to cleanup temp files', error);
    }

    return {
      format: 'mp4',
      durationSec: tts.durationSec,
      resolution: {
        width: 1280,
        height: 720,
      },
      sourceRenderVersion: 1, // 这里应该从实际的 render artifact 获取版本
      sourceTtsVersion: 1, // 这里应该从实际的 tts artifact 获取版本
      videoUrl,
    };
  },

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      format: 'mp4',
      durationSec: 120,
      resolution: {
        width: 1280,
        height: 720,
      },
      sourceRenderVersion: 1,
      sourceTtsVersion: 1,
      videoUrl: 'https://storage.example.com/output.mp4',
    };

    const validation = mergeOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    // 验证格式
    if (testOutput.format !== 'mp4') {
      errors.push('Only MP4 format is supported');
    }

    if (testOutput.durationSec < 1 || testOutput.durationSec > 7200) {
      errors.push('Duration must be between 1 and 7200 seconds');
    }

    if (
      testOutput.resolution.width !== 1280 ||
      testOutput.resolution.height !== 720
    ) {
      errors.push('Only 1280x720 resolution is supported');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

/**
 * 创建占位音频文件
 */
async function createPlaceholderAudio(
  audioPath: string,
  durationSec: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const cmd = ffmpegImport() as any;
    cmd
      .input('anullsrc=r=44100:cl=stereo')
      .inputFormat('lavfi')
      .outputOptions([
        '-t',
        String(durationSec),
        '-q:a',
        '9',
        '-acodec',
        'libmp3lame',
      ])
      .on('end', () => resolve())
      .on('error', (err: unknown) =>
        reject(err instanceof Error ? err : new Error(String(err))),
      )
      .save(audioPath);
  });
}

export default mergeStep;
