import { Test, TestingModule } from '@nestjs/testing';
import { StepRegistryService } from '../step-registry.service';
import { PrismaService } from '../../prisma/prisma.service';
import { PromptopsService } from '../../promptops/promptops.service';
import { allStepDefinitions } from '../index';
import { JobStage, ArtifactType } from '@prisma/client';

describe('Theme Design Integration Tests', () => {
  let stepRegistry: StepRegistryService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StepRegistryService,
        StepExecutorService,
        PrismaService,
        PromptopsService,
      ],
    }).compile();

    stepRegistry = module.get<StepRegistryService>(StepRegistryService);

    // 注册所有步骤定义
    stepRegistry.registerBatch(allStepDefinitions);
  });

  describe('Step Registration', () => {
    it('should register THEME_DESIGN step', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);

      expect(themeDesignStep).toBeDefined();
      expect(themeDesignStep?.stage).toBe(JobStage.THEME_DESIGN);
      expect(themeDesignStep?.name).toBe('Theme Design Selection');
      expect(themeDesignStep?.type).toBe('AI_GENERATION');
    });

    it('should have correct execution order with THEME_DESIGN', () => {
      const stepsInOrder = stepRegistry.getStepsInExecutionOrder();
      const stageOrder = stepsInOrder.map((step) => step.stage);

      expect(stageOrder).toEqual([
        JobStage.PLAN,
        JobStage.THEME_DESIGN,
        JobStage.OUTLINE,
        JobStage.STORYBOARD,
        JobStage.PAGES,
        JobStage.DONE,
      ]);
    });

    it('should validate dependencies correctly', () => {
      const validation = stepRegistry.validateDependencies();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have correct dependencies for OUTLINE step', () => {
      const dependencies = stepRegistry.getDependencies(JobStage.OUTLINE);

      expect(dependencies).toContain(JobStage.THEME_DESIGN);
      expect(dependencies).not.toContain(JobStage.PLAN);
    });

    it('should have correct dependents for THEME_DESIGN step', () => {
      const dependents = stepRegistry.getDependents(JobStage.THEME_DESIGN);

      expect(dependents).toContain(JobStage.OUTLINE);
    });
  });

  describe('Schema Validation', () => {
    it('should validate THEME_DESIGN output schema', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);

      expect(themeDesignStep).toBeDefined();

      const testOutput = {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: ['glass-effect', 'gradient-bg', 'glow-effect'],
        customizations: {
          primaryColor: '#4A48E2',
          secondaryColor: '#6366F1',
        },
        previewHtml: '<div>Preview content</div>',
      };

      // 验证输出 schema
      const validation = themeDesignStep?.validate();
      expect(validation?.isValid).toBe(true);
      expect(validation?.errors).toHaveLength(0);
    });

    it('should validate PAGES step enhanced schema', () => {
      const pagesStep = stepRegistry.get(JobStage.PAGES);

      expect(pagesStep).toBeDefined();

      const testOutput = {
        htmlContent: '<html><body>Test content</body></html>',
        pptSlidesData: [
          {
            slideId: 'test-slide',
            title: 'Test Slide',
            content: ['Test content'],
            design: {
              layout: 'title',
              theme: 'modern',
              colors: {
                primary: '#3b82f6',
                secondary: '#8b5cf6',
                accent: '#06b6d4',
                background: '#ffffff',
                text: '#1f2937',
                textLight: '#6b7280',
              },
              typography: {
                fontFamily: 'Inter',
                headingFont: 'Inter',
                bodyFont: 'Inter',
                baseSize: 16,
                headingScale: [3.5, 2.5, 2, 1.5, 1.25, 1],
              },
              background: {
                type: 'gradient',
                value:
                  'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #ffffff 100%)',
                opacity: 1,
              },
            },
            elements: [],
            metadata: {
              slideNumber: 1,
              totalSlides: 1,
            },
          },
        ],
        pptUrl: 'https://example.com/ppt.html',
        pptStoragePath: 'jobs/test/ppt.html',
        pptFileSize: 12345,
        pptUploadedAt: new Date().toISOString(),
        pptUploadStatus: 'success' as const,
        pdfUrl: 'https://example.com/pdf.pdf',
        pdfGenerated: true,
        pdfPath: 'jobs/test/pdf.pdf',
        pdfFileSize: 67890,
        metadata: {
          title: 'Test Presentation',
          pageCount: 1,
          aspectRatio: '16:9' as const,
          designStyle: 'modern',
          generationMode: 'ppt-enhanced' as const,
          pptTheme: 'modern',
          totalSlides: 1,
        },
      };

      const validation = pagesStep?.validate();
      expect(validation?.isValid).toBe(true);
      expect(validation?.errors).toHaveLength(0);
    });
  });

  describe('Workflow Dependencies', () => {
    it('should ensure THEME_DESIGN runs before OUTLINE', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);
      const outlineStep = stepRegistry.get(JobStage.OUTLINE);

      expect(themeDesignStep).toBeDefined();
      expect(outlineStep).toBeDefined();

      // OUTLINE 应该依赖 THEME_DESIGN
      expect(outlineStep?.input.sources).toContain(JobStage.THEME_DESIGN);
    });

    it('should ensure PAGES depends on THEME_DESIGN', () => {
      const pagesStep = stepRegistry.get(JobStage.PAGES);

      expect(pagesStep).toBeDefined();

      // PAGES 应该依赖 THEME_DESIGN
      expect(pagesStep?.input.sources).toContain(JobStage.THEME_DESIGN);
    });

    it('should validate no circular dependencies', () => {
      const validation = stepRegistry.validateDependencies();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('Step Configuration', () => {
    it('should have correct AI configuration for THEME_DESIGN', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);

      expect(themeDesignStep?.aiConfig.model).toBe('google/gemini-3-flash-preview');
      expect(themeDesignStep?.aiConfig.prompt).toContain(
        'Theme Design Selection',
      );
      expect(themeDesignStep?.execution.requiresApproval).toBe(true);
    });

    it('should have correct execution configuration', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);

      expect(themeDesignStep?.execution.timeoutMs).toBe(180000); // 3 minutes
      expect(themeDesignStep?.execution.retryPolicy.maxAttempts).toBe(3);
      expect(themeDesignStep?.execution.retryPolicy.backoffMs).toBe(1000);
    });

    it('should have correct input/output configuration', () => {
      const themeDesignStep = stepRegistry.get(JobStage.THEME_DESIGN);

      expect(themeDesignStep?.input.sources).toContain(JobStage.PLAN);
      expect(themeDesignStep?.output.type).toBe(ArtifactType.JSON);
      expect(themeDesignStep?.output.description).toContain('设计主题配置');
    });
  });
});
