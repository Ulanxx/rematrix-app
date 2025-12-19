import {
  ApprovalStatus,
  ArtifactType,
  JobStage,
  JobStatus,
  PrismaClient,
} from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import ffmpegImport from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { chromium } from 'playwright';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  uploadBufferToBunny,
  uploadJsonToBunny,
} from '../../utils/bunny-storage';

function errorToString(err: unknown): string {
  if (err instanceof Error) {
    return err.stack ?? err.message;
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Missing DATABASE_URL');
}

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString }),
});

export type VideoGenerationInput = {
  jobId: string;
  markdown: string;
};

export async function ensureJob(jobId: string) {
  await prisma.job.upsert({
    where: { id: jobId },
    update: {},
    create: {
      id: jobId,
      status: JobStatus.DRAFT,
      currentStage: JobStage.PLAN,
    },
  });
}

export async function runPlanStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const plan = {
    estimatedPages: 6,
    estimatedDurationSec: 60,
    style: 'default',
    questions: ['是否需要更偏技术讲解还是偏科普风格？'],
  };

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.PLAN,
      type: ArtifactType.JSON,
      version: 1,
      content: plan,
      createdBy: 'system',
    },
  });

  await prisma.approval.upsert({
    where: { jobId_stage: { jobId: input.jobId, stage: JobStage.PLAN } },
    update: { status: ApprovalStatus.PENDING, comment: null },
    create: {
      jobId: input.jobId,
      stage: JobStage.PLAN,
      status: ApprovalStatus.PENDING,
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      status: JobStatus.WAITING_APPROVAL,
      currentStage: JobStage.PLAN,
    },
  });

  return plan;
}

export async function runOutlineStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const latest = await prisma.artifact.findFirst({
    where: { jobId: input.jobId, stage: JobStage.OUTLINE },
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  const nextVersion = (latest?.version ?? 0) + 1;

  const outline = {
    title: 'Auto Outline',
    sections: [
      {
        title: 'Intro',
        bullets: ['引入主题', '明确目标'],
      },
      {
        title: 'Main',
        bullets: ['关键点 1', '关键点 2', '关键点 3'],
      },
      {
        title: 'Outro',
        bullets: ['总结', '下一步'],
      },
    ],
    source: {
      markdownPreview: input.markdown.slice(0, 200),
    },
  };

  let blobUrl: string | null = null;
  try {
    const path = `jobs/${input.jobId}/artifacts/OUTLINE/v${nextVersion}.json`;
    const uploaded = await uploadJsonToBunny({ path, json: outline });
    blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
  } catch (err: unknown) {
    console.error('[bunny] upload outline failed', errorToString(err));
    blobUrl = null;
  }

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.OUTLINE,
      type: ArtifactType.JSON,
      version: nextVersion,
      content: outline,
      blobUrl,
      createdBy: 'system',
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      currentStage: JobStage.OUTLINE,
      status: JobStatus.RUNNING,
    },
  });

  return outline;
}

export async function runNarrationStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const latest = await prisma.artifact.findFirst({
    where: { jobId: input.jobId, stage: JobStage.NARRATION },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const narration = {
    pages: [
      {
        page: 1,
        text: '欢迎来到本课程。',
      },
      {
        page: 2,
        text: '我们将从 Markdown 输入生成结构化内容。',
      },
    ],
    source: {
      markdownPreview: input.markdown.slice(0, 200),
    },
  };

  let blobUrl: string | null = null;
  try {
    const path = `jobs/${input.jobId}/artifacts/NARRATION/v${nextVersion}.json`;
    const uploaded = await uploadJsonToBunny({ path, json: narration });
    blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
  } catch (err: unknown) {
    console.error('[bunny] upload narration failed', errorToString(err));
    blobUrl = null;
  }

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.NARRATION,
      type: ArtifactType.JSON,
      version: nextVersion,
      content: narration,
      blobUrl,
      createdBy: 'system',
    },
  });

  await prisma.approval.upsert({
    where: {
      jobId_stage: {
        jobId: input.jobId,
        stage: JobStage.NARRATION,
      },
    },
    update: { status: ApprovalStatus.PENDING, comment: null },
    create: {
      jobId: input.jobId,
      stage: JobStage.NARRATION,
      status: ApprovalStatus.PENDING,
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      currentStage: JobStage.NARRATION,
      status: JobStatus.WAITING_APPROVAL,
    },
  });

  return narration;
}

export async function runPagesStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const latest = await prisma.artifact.findFirst({
    where: { jobId: input.jobId, stage: JobStage.PAGES },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const pages = {
    theme: {
      primary: '#4285F4',
      background: '#F8F9FA',
      text: '#202124',
    },
    slides: [
      {
        title: '课程标题',
        bullets: ['要点 1', '要点 2'],
      },
      {
        title: '第二部分',
        bullets: ['示例 A', '示例 B'],
      },
    ],
  };

  let blobUrl: string | null = null;
  try {
    const path = `jobs/${input.jobId}/artifacts/PAGES/v${nextVersion}.json`;
    const uploaded = await uploadJsonToBunny({ path, json: pages });
    blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
  } catch (err: unknown) {
    console.error('[bunny] upload pages failed', errorToString(err));
    blobUrl = null;
  }

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.PAGES,
      type: ArtifactType.JSON,
      version: nextVersion,
      content: pages,
      blobUrl,
      createdBy: 'system',
    },
  });

  await prisma.approval.upsert({
    where: {
      jobId_stage: {
        jobId: input.jobId,
        stage: JobStage.PAGES,
      },
    },
    update: { status: ApprovalStatus.PENDING, comment: null },
    create: {
      jobId: input.jobId,
      stage: JobStage.PAGES,
      status: ApprovalStatus.PENDING,
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      currentStage: JobStage.PAGES,
      status: JobStatus.WAITING_APPROVAL,
    },
  });

  return pages;
}

function renderSlideHtml(params: {
  title: string;
  bullets: string[];
  theme?: { primary?: string; background?: string; text?: string };
}) {
  const primary = params.theme?.primary ?? '#4285F4';
  const background = params.theme?.background ?? '#F8F9FA';
  const text = params.theme?.text ?? '#202124';

  const bullets = params.bullets
    .map((b) => `<li>${escapeHtml(b)}</li>`)
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
      <h1>${escapeHtml(params.title)}</h1>
      <ul>${bullets}</ul>
      <div class="footer">Generated by Temporal</div>
    </div>
  </body>
</html>`;
}

function escapeHtml(input: string) {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function runRenderStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const pagesArtifact = await prisma.artifact.findFirst({
    where: {
      jobId: input.jobId,
      stage: JobStage.PAGES,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true, version: true },
  });

  const pages = (pagesArtifact?.content ?? {}) as {
    theme?: { primary?: string; background?: string; text?: string };
    slides?: Array<{ title?: string; bullets?: string[] }>;
  };

  const slides = Array.isArray(pages.slides) ? pages.slides : [];

  const latest = await prisma.artifact.findFirst({
    where: {
      jobId: input.jobId,
      stage: JobStage.RENDER,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const tmpDir = await fs.mkdtemp(
    path.join(os.tmpdir(), `rematrix-${input.jobId}-render-`),
  );
  const framePaths: string[] = [];
  const uploadedFrames: Array<{ index: number; blobUrl: string | null }> = [];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });

    for (let i = 0; i < Math.max(slides.length, 1); i++) {
      const slide = slides[i] ?? { title: '空白页', bullets: [] };
      const html = renderSlideHtml({
        title: String(slide.title ?? `Page ${i + 1}`),
        bullets: Array.isArray(slide.bullets) ? slide.bullets.map(String) : [],
        theme: pages.theme,
      });

      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const filename = `frame-${String(i + 1).padStart(3, '0')}.png`;
      const filePath = path.join(tmpDir, filename);
      await page.screenshot({ path: filePath, type: 'png' });
      framePaths.push(filePath);

      let blobUrl: string | null = null;
      try {
        const data = await fs.readFile(filePath);
        const uploadPath = `jobs/${input.jobId}/artifacts/RENDER/v${nextVersion}/${filename}`;
        const uploaded = await uploadBufferToBunny({
          path: uploadPath,
          contentType: 'image/png',
          data: new Uint8Array(data),
        });
        blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
      } catch (err: unknown) {
        console.error('[bunny] upload render frame failed', errorToString(err));
        blobUrl = null;
      }

      uploadedFrames.push({ index: i + 1, blobUrl });
    }
  } finally {
    await browser.close();
  }

  const renderResult = {
    sourcePagesVersion: pagesArtifact?.version ?? null,
    frameCount: uploadedFrames.length,
    frames: uploadedFrames,
  };

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.RENDER,
      type: ArtifactType.JSON,
      version: nextVersion,
      content: renderResult,
      createdBy: 'system',
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      currentStage: JobStage.RENDER,
      status: JobStatus.RUNNING,
    },
  });

  return renderResult;
}

export async function runMergeStage(input: VideoGenerationInput) {
  await ensureJob(input.jobId);

  const renderArtifact = await prisma.artifact.findFirst({
    where: {
      jobId: input.jobId,
      stage: JobStage.RENDER,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { version: true, content: true },
  });

  const render = (renderArtifact?.content ?? {}) as {
    frameCount?: number;
  };

  const renderVersion = renderArtifact?.version ?? 1;
  const tmpDir = await fs.mkdtemp(
    path.join(os.tmpdir(), `rematrix-${input.jobId}-merge-`),
  );
  const outPath = path.join(tmpDir, 'output.mp4');

  // We render frames locally again to guarantee FFmpeg input without relying on Bunny.
  // This keeps merge deterministic even if Bunny is unavailable.
  const pagesArtifact = await prisma.artifact.findFirst({
    where: {
      jobId: input.jobId,
      stage: JobStage.PAGES,
      type: ArtifactType.JSON,
    },
    orderBy: { version: 'desc' },
    select: { content: true, version: true },
  });

  const pages = (pagesArtifact?.content ?? {}) as {
    theme?: { primary?: string; background?: string; text?: string };
    slides?: Array<{ title?: string; bullets?: string[] }>;
  };
  const slides = Array.isArray(pages.slides) ? pages.slides : [];

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 },
    });
    for (let i = 0; i < Math.max(slides.length, 1); i++) {
      const slide = slides[i] ?? { title: '空白页', bullets: [] };
      const html = renderSlideHtml({
        title: String(slide.title ?? `Page ${i + 1}`),
        bullets: Array.isArray(slide.bullets) ? slide.bullets.map(String) : [],
        theme: pages.theme,
      });
      await page.setContent(html, { waitUntil: 'domcontentloaded' });

      const filename = `frame-${String(i + 1).padStart(3, '0')}.png`;
      const filePath = path.join(tmpDir, filename);
      await page.screenshot({ path: filePath, type: 'png' });
    }
  } finally {
    await browser.close();
  }

  ffmpegImport.setFfmpegPath(ffmpegInstaller.path);

  await new Promise<void>((resolve, reject) => {
    ffmpegImport()
      .input(path.join(tmpDir, 'frame-%03d.png'))
      .inputFPS(1)
      .outputOptions(['-c:v libx264', '-pix_fmt yuv420p', '-r 30'])
      .on('end', () => resolve())
      .on('error', (err: unknown) =>
        reject(err instanceof Error ? err : new Error(String(err))),
      )
      .save(outPath);
  });

  let blobUrl: string | null = null;
  try {
    const data = await fs.readFile(outPath);
    const uploadPath = `jobs/${input.jobId}/artifacts/MERGE/v${renderVersion}.mp4`;
    const uploaded = await uploadBufferToBunny({
      path: uploadPath,
      contentType: 'video/mp4',
      data: new Uint8Array(data),
    });
    blobUrl = uploaded.publicUrl ?? uploaded.storageUrl;
  } catch (err: unknown) {
    console.error('[bunny] upload video failed', errorToString(err));
    blobUrl = null;
  }

  const latest = await prisma.artifact.findFirst({
    where: {
      jobId: input.jobId,
      stage: JobStage.MERGE,
      type: ArtifactType.VIDEO,
    },
    orderBy: { version: 'desc' },
    select: { version: true },
  });
  const nextVersion = (latest?.version ?? 0) + 1;

  const videoMeta = {
    format: 'mp4',
    fps: 30,
    imageFps: 1,
    frameCount:
      typeof render.frameCount === 'number' ? render.frameCount : null,
    sourcePagesVersion: pagesArtifact?.version ?? null,
    sourceRenderVersion: renderArtifact?.version ?? null,
  };

  await prisma.artifact.create({
    data: {
      jobId: input.jobId,
      stage: JobStage.MERGE,
      type: ArtifactType.VIDEO,
      version: nextVersion,
      content: videoMeta,
      blobUrl,
      createdBy: 'system',
    },
  });

  await prisma.job.update({
    where: { id: input.jobId },
    data: {
      currentStage: JobStage.MERGE,
      status: JobStatus.RUNNING,
    },
  });

  return { ...videoMeta, blobUrl };
}

export async function markStageApproved(jobId: string, stage: string) {
  const stageEnum = stage as JobStage;
  try {
    await prisma.approval.upsert({
      where: { jobId_stage: { jobId, stage: stageEnum } },
      update: { status: ApprovalStatus.APPROVED },
      create: {
        jobId,
        stage: stageEnum,
        status: ApprovalStatus.APPROVED,
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.RUNNING },
    });
  } catch (err: unknown) {
    console.error('[activity] markStageApproved failed', {
      jobId,
      stage,
      error: errorToString(err),
    });
    throw err;
  }
}

export async function markStageRejected(
  jobId: string,
  stage: string,
  reason?: string,
) {
  const stageEnum = stage as JobStage;
  try {
    await prisma.approval.upsert({
      where: { jobId_stage: { jobId, stage: stageEnum } },
      update: { status: ApprovalStatus.REJECTED, comment: reason ?? null },
      create: {
        jobId,
        stage: stageEnum,
        status: ApprovalStatus.REJECTED,
        comment: reason ?? null,
      },
    });

    await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.WAITING_APPROVAL },
    });
  } catch (err: unknown) {
    console.error('[activity] markStageRejected failed', {
      jobId,
      stage,
      reason,
      error: errorToString(err),
    });
    throw err;
  }
}

export async function advanceAfterPlan(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      currentStage: JobStage.OUTLINE,
    },
  });
}

export async function markJobCompleted(jobId: string) {
  await prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.COMPLETED,
      currentStage: JobStage.DONE,
    },
  });
}
