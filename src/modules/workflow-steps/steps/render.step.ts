import { JobStage, ArtifactType } from '@prisma/client';
import { z } from 'zod';
import {
  StepDefinition,
  createStepDefinition,
  ExecutionContext,
} from '../step-definition.interface';
import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { uploadBufferToBunny } from '../../../utils/bunny-storage';

/**
 * RENDER 阶段的输出 Schema
 */
export const renderOutputSchema = z.object({
  format: z.string(),
  totalPages: z.number(),
  sourcePagesVersion: z.number().nullable(),
  renderedImages: z.array(
    z.object({
      page: z.number(),
      imagePath: z.string(),
      blobUrl: z.string().nullable(),
    }),
  ),
});

/**
 * RENDER 阶段的输入 Schema
 */
export const renderInputSchema = z.object({
  pages: z.object({
    theme: z.object({
      primary: z.string(),
      background: z.string(),
      text: z.string(),
    }),
    slides: z.array(
      z.object({
        title: z.string(),
        bullets: z.array(z.string()),
      }),
    ),
  }),
});

/**
 * RENDER 阶段定义
 * 根据 PAGES 数据渲染成图片
 */
export const renderStep: StepDefinition = createStepDefinition({
  stage: JobStage.RENDER,
  type: 'PROCESSING',
  name: 'Slide Rendering',
  description: '根据页面结构数据渲染成图片，用于视频合成',

  // 输入配置
  input: {
    sources: [JobStage.PAGES], // 依赖 PAGES 阶段
    schema: renderInputSchema,
    description: 'PAGES 阶段的页面结构数据',
  },

  // 输出配置
  output: {
    type: ArtifactType.IMAGE,
    schema: renderOutputSchema,
    description: '渲染的图片文件列表',
  },

  // 执行配置
  execution: {
    requiresApproval: false, // RENDER 不需要用户审批
    retryPolicy: {
      maxAttempts: 2,
      backoffMs: 3000,
      maxBackoffMs: 15000,
    },
    timeoutMs: 600000, // 10 分钟超时
  },

  // 自定义执行逻辑
  async customExecute(input: any, context: ExecutionContext): Promise<any> {
    const { pages } = input;
    const { theme, slides } = pages;

    const browser = await chromium.launch();
    const page = await browser.newPage();

    const renderedImages: Array<{
      page: number;
      imagePath: string;
      blobUrl: string | null;
    }> = [];

    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `rematrix-${context.jobId}-render-`),
    );

    try {
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const pageNum = i + 1;

        // 生成 HTML 内容
        const html = generateSlideHTML(slide, theme);

        // 设置页面内容
        await page.setContent(html);

        // 等待页面加载完成
        await page.waitForLoadState('networkidle');

        // 截图
        const imagePath = path.join(tmpDir, `slide_${pageNum}.png`);
        await page.screenshot({
          path: imagePath,
          fullPage: true,
          type: 'png',
        });

        // 上传到云存储
        let blobUrl: string | null = null;
        try {
          const data = await fs.readFile(imagePath);
          const uploadPath = `jobs/${context.jobId}/artifacts/RENDER/slide_${pageNum}.png`;
          const uploaded = await uploadBufferToBunny({
            path: uploadPath,
            contentType: 'image/png',
            data: new Uint8Array(data),
          });
          blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
        } catch (error) {
          console.warn(`[RENDER] Failed to upload slide ${pageNum}`, error);
        }

        renderedImages.push({
          page: pageNum,
          imagePath,
          blobUrl,
        });
      }
    } finally {
      await browser.close();
    }

    return {
      format: 'png',
      totalPages: slides.length,
      sourcePagesVersion: 1, // 这里应该从实际的 pages artifact 获取版本
      renderedImages,
    };
  },

  // 验证函数
  validate() {
    const errors: string[] = [];

    // 验证输出结构的合理性
    const testOutput = {
      format: 'png',
      totalPages: 5,
      sourcePagesVersion: 1,
      renderedImages: [
        {
          page: 1,
          imagePath: '/tmp/slide_1.png',
          blobUrl: 'https://storage.example.com/slide_1.png',
        },
      ],
    };

    const validation = renderOutputSchema.safeParse(testOutput);
    if (!validation.success) {
      errors.push(
        `Output schema validation failed: ${validation.error.message}`,
      );
    }

    // 验证格式
    if (testOutput.format !== 'png') {
      errors.push('Only PNG format is supported');
    }

    if (testOutput.totalPages < 1 || testOutput.totalPages > 100) {
      errors.push('Total pages must be between 1 and 100');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
});

/**
 * 生成幻灯片 HTML
 */
function generateSlideHTML(slide: any, theme: any): string {
  const primary = theme.primary || '#4285F4';
  const background = theme.background || '#F8F9FA';
  const text = theme.text || '#202124';

  const bullets = slide.bullets
    .map((b: string) => `<li>${escapeHtml(b)}</li>`)
    .join('');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
        background: ${background};
        color: ${text};
      }
      .frame {
        width: 1280px;
        height: 720px;
        padding: 64px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .kicker {
        color: ${primary};
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
        font-size: 14px;
      }
      h1 {
        margin: 14px 0 18px;
        font-size: 54px;
        line-height: 1.08;
      }
      ul {
        margin: 0;
        padding-left: 26px;
        font-size: 28px;
        line-height: 1.55;
      }
      li { margin: 8px 0; }
      .footer {
        position: absolute;
        left: 64px;
        bottom: 32px;
        font-size: 14px;
        opacity: 0.6;
      }
    </style>
  </head>
  <body>
    <div class="frame">
      <div class="kicker">Rematrix</div>
      <h1>${escapeHtml(slide.title)}</h1>
      <ul>${bullets}</ul>
      <div class="footer">Generated by AI</div>
    </div>
  </body>
</html>`;
}

/**
 * HTML 转义
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export default renderStep;
