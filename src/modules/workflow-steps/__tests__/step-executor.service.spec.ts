import { Test, TestingModule } from '@nestjs/testing';
import { StepExecutorService } from '../step-executor.service';
import { StepRegistryService } from '../step-registry.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptopsService } from '../../promptops/promptops.service';
import {
  StepDefinition,
  createStepDefinition,
} from '../step-definition.interface';
import { JobStage, ArtifactType, JobStatus } from '@prisma/client';
import { z } from 'zod';

describe('StepExecutorService', () => {
  let service: StepExecutorService;
  let stepRegistry: StepRegistryService;
  let prismaService: PrismaService;
  let promptopsService: PromptopsService;
  let mockStep: StepDefinition;

  beforeEach(async () => {
    // 创建 mock 服务
    const mockPrismaService = {
      job: {
        upsert: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      artifact: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      approval: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const mockPromptopsService = {
      getActiveConfig: jest.fn(),
    };

    const mockStepRegistryService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepExecutorService,
        {
          provide: StepRegistryService,
          useValue: mockStepRegistryService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: PromptopsService,
          useValue: mockPromptopsService,
        },
      ],
    }).compile();

    service = module.get<StepExecutorService>(StepExecutorService);
    stepRegistry = module.get<StepRegistryService>(StepRegistryService);
    prismaService = module.get<PrismaService>(PrismaService);
    promptopsService = module.get<PromptopsService>(PromptopsService);

    // 创建测试用的 Step 定义
    mockStep = createStepDefinition({
      stage: JobStage.PLAN,
      type: 'AI_GENERATION',
      name: 'Test Plan Step',
      description: 'Test step for unit testing',
      aiConfig: {
        model: 'google/gemini-3.0-flash',
        temperature: 0.7,
        prompt: 'Test prompt with <markdown>',
        schema: z.object({ test: z.string() }),
      },
      input: {
        sources: [],
        schema: z.object({ markdown: z.string() }),
      },
      output: {
        type: ArtifactType.JSON,
        schema: z.object({ test: z.string() }),
      },
      execution: {
        requiresApproval: true,
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('execute', () => {
    const jobId = 'test-job-id';
    const markdown = 'Test markdown content';

    beforeEach(() => {
      // 设置默认的 mock 返回值
      stepRegistry.get = jest.fn().mockReturnValue(mockStep);
      prismaService.job.upsert = jest.fn().mockResolvedValue({});
      prismaService.artifact.findFirst = jest.fn().mockResolvedValue(null);
      prismaService.approval.findUnique = jest.fn().mockResolvedValue(null);
      promptopsService.getActiveConfig = jest
        .fn()
        .mockReturnValue(mockStep.aiConfig);
      prismaService.artifact.create = jest.fn().mockResolvedValue({});
      prismaService.approval.upsert = jest.fn().mockResolvedValue({});
      prismaService.job.update = jest.fn().mockResolvedValue({});
    });

    it('should execute a step successfully', async () => {
      // Mock AI generation
      jest.mock('ai', () => ({
        generateObject: jest.fn().mockResolvedValue({
          object: { test: 'success' },
        }),
      }));

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ test: 'success' });
      expect(stepRegistry.get).toHaveBeenCalledWith(JobStage.PLAN);
    });

    it('should throw error when step definition not found', async () => {
      stepRegistry.get = jest.fn().mockReturnValue(undefined);

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No step definition found');
    });

    it('should return existing result when available and approved', async () => {
      const existingArtifact = {
        content: { test: 'existing' },
      };

      prismaService.artifact.findFirst = jest
        .fn()
        .mockResolvedValue(existingArtifact);
      prismaService.approval.findUnique = jest
        .fn()
        .mockResolvedValue({ status: 'APPROVED' });
      prismaService.job.findUnique = jest
        .fn()
        .mockResolvedValue({ currentStage: 'DONE' });

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ test: 'existing' });
    });

    it('should handle AI generation step', async () => {
      const aiStep = createStepDefinition({
        stage: JobStage.PLAN,
        type: 'AI_GENERATION',
        name: 'AI Step',
        description: 'Test AI step',
        aiConfig: mockStep.aiConfig,
        input: mockStep.input,
        output: mockStep.output,
        execution: mockStep.execution,
      });

      stepRegistry.get = jest.fn().mockReturnValue(aiStep);

      // Mock the AI generation
      const mockGenerateObject = jest.fn().mockResolvedValue({
        object: { test: 'ai-generated' },
      });

      // We need to mock the AI module at the top level
      jest.doMock('ai', () => ({
        generateObject: mockGenerateObject,
      }));

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ test: 'ai-generated' });
    });

    it('should handle processing step with custom execute', async () => {
      const customExecute = jest
        .fn()
        .mockResolvedValue({ test: 'custom-processed' });

      const processingStep = createStepDefinition({
        stage: JobStage.TTS,
        type: 'PROCESSING',
        name: 'Processing Step',
        description: 'Test processing step',
        input: {
          sources: [JobStage.NARRATION],
          schema: z.object({ narration: z.any() }),
        },
        output: {
          type: ArtifactType.AUDIO,
          schema: z.object({ test: z.string() }),
        },
        execution: {
          requiresApproval: false,
        },
        customExecute,
      });

      stepRegistry.get = jest.fn().mockReturnValue(processingStep);

      const result = await service.execute(JobStage.TTS, jobId, markdown);

      expect(result.success).toBe(true);
      expect(result.output).toEqual({ test: 'custom-processed' });
      expect(customExecute).toHaveBeenCalled();
    });

    it('should handle merge step with default logic', async () => {
      const mergeStep = createStepDefinition({
        stage: JobStage.MERGE,
        type: 'MERGE',
        name: 'Merge Step',
        description: 'Test merge step',
        input: {
          sources: [JobStage.RENDER, JobStage.TTS],
          schema: z.object({ render: z.any(), tts: z.any() }),
        },
        output: {
          type: ArtifactType.VIDEO,
          schema: z.object({ test: z.string() }),
        },
        execution: {
          requiresApproval: false,
        },
      });

      stepRegistry.get = jest.fn().mockReturnValue(mergeStep);

      const result = await service.execute(JobStage.MERGE, jobId, markdown);

      expect(result.success).toBe(true);
      expect(result.output).toBeDefined();
    });

    it('should create approval when required', async () => {
      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(true);
      expect(prismaService.approval.upsert).toHaveBeenCalledWith({
        where: { jobId_stage: { jobId, stage: JobStage.PLAN } },
        update: { status: 'PENDING', comment: null },
        create: {
          jobId,
          stage: JobStage.PLAN,
          status: 'PENDING',
        },
      });
    });

    it('should update job status after execution', async () => {
      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(true);
      expect(prismaService.job.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: {
          status: JobStatus.WAITING_APPROVAL,
          currentStage: JobStage.PLAN,
        },
      });
    });

    it('should handle execution errors', async () => {
      // Mock an error during execution
      jest.doMock('ai', () => ({
        generateObject: jest.fn().mockRejectedValue(new Error('AI Error')),
      }));

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(false);
      expect(result.error).toContain('AI Error');
      expect(prismaService.job.update).toHaveBeenCalledWith({
        where: { id: jobId },
        data: {
          status: JobStatus.FAILED,
          currentStage: JobStage.PLAN,
          error: expect.any(String),
        },
      });
    });

    it('should validate input schema', async () => {
      const stepWithStrictInput = createStepDefinition({
        stage: JobStage.PLAN,
        type: 'AI_GENERATION',
        name: 'Strict Input Step',
        description: 'Test step with strict input',
        aiConfig: mockStep.aiConfig,
        input: {
          sources: [],
          schema: z.object({
            markdown: z.string().min(10), // Require at least 10 characters
          }),
        },
        output: mockStep.output,
        execution: mockStep.execution,
      });

      stepRegistry.get = jest.fn().mockReturnValue(stepWithStrictInput);

      const result = await service.execute(JobStage.PLAN, jobId, 'short'); // Too short

      expect(result.success).toBe(false);
      expect(result.error).toContain('Input validation failed');
    });

    it('should validate output schema', async () => {
      // Mock AI generation to return invalid output
      jest.doMock('ai', () => ({
        generateObject: jest.fn().mockResolvedValue({
          object: { invalidField: 'value' }, // Missing required 'test' field
        }),
      }));

      const result = await service.execute(JobStage.PLAN, jobId, markdown);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Output validation failed');
    });
  });

  describe('buildPrompt', () => {
    it('should build prompt correctly for different stages', async () => {
      // Test PLAN stage
      const planResult = await service.execute(JobStage.PLAN, jobId, markdown);
      expect(planResult.success).toBe(true);

      // Test OUTLINE stage with dependencies
      const outlineStep = createStepDefinition({
        stage: JobStage.OUTLINE,
        type: 'AI_GENERATION',
        name: 'Outline Step',
        description: 'Test outline step',
        aiConfig: {
          model: 'google/gemini-3.0-flash',
          temperature: 0.7,
          prompt: 'Outline prompt <markdown> <plan_json>',
          schema: z.object({ outline: z.string() }),
        },
        input: {
          sources: [JobStage.PLAN],
          schema: z.object({ markdown: z.string(), plan: z.any() }),
        },
        output: {
          type: ArtifactType.JSON,
          schema: z.object({ outline: z.string() }),
        },
        execution: {
          requiresApproval: false,
        },
      });

      stepRegistry.get = jest.fn().mockReturnValue(outlineStep);
      prismaService.artifact.findFirst = jest.fn().mockResolvedValue({
        content: { outline: 'plan content' },
      });

      const outlineResult = await service.execute(
        JobStage.OUTLINE,
        jobId,
        markdown,
      );
      expect(outlineResult.success).toBe(true);
    });
  });
});
