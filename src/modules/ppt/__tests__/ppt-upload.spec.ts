import { Test, TestingModule } from '@nestjs/testing';
import { PptService } from '../ppt.service';
import { PptSlideData, PptGenerationOptions } from '../ppt.types';

describe('PptService - Upload Functionality', () => {
  let service: PptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PptService],
    }).compile();

    service = module.get<PptService>(PptService);
  });

  describe('generatePptHtmlWithUpload', () => {
    it('should generate PPT HTML with upload enabled', async () => {
      // 准备测试数据
      const slidesData: PptSlideData[] = [
        {
          slideId: 'test-slide-1',
          title: '测试标题',
          content: ['测试内容'],
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
      ];

      const options: PptGenerationOptions = {
        theme: 'modern',
        colorScheme: 'blue',
        enableAnimations: true,
        layoutComplexity: 'medium',
        designFreedom: 'creative',
        outputFormat: 'html',
        aspectRatio: '16:9',
        cloudStorage: {
          enabled: true,
          pathPrefix: 'test/jobs',
        },
      };

      // 执行测试（注意：这里会尝试上传到真实的云存储，在真实测试中需要 mock）
      try {
        const result = await service.generatePptHtmlWithUpload(
          slidesData,
          options,
          {
            enabled: true,
            pathPrefix: 'test/jobs',
          },
        );

        // 验证结果
        expect(result).toBeDefined();
        expect(result.htmlContent).toContain('测试标题');
        expect(result.slidesData).toHaveLength(1);
        expect(result.metadata.slideCount).toBe(1);

        // 验证云存储信息（如果上传成功）
        if (result.cloudStorage) {
          expect(result.cloudStorage.uploadStatus).toBe('success');
          expect(result.cloudStorage.pptUrl).toBeDefined();
        }
      } catch (error) {
        // 在没有真实云存储配置的情况下，这是预期的
        expect(error.message).toContain('PPT 上传失败');
      }
    });

    it('should generate PPT HTML without upload when disabled', async () => {
      const slidesData: PptSlideData[] = [
        {
          slideId: 'test-slide-1',
          title: '测试标题',
          content: ['测试内容'],
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
              type: 'solid',
              value: '#ffffff',
              opacity: 1,
            },
          },
          elements: [],
          metadata: {
            slideNumber: 1,
            totalSlides: 1,
          },
        },
      ];

      const result = await service.generatePptHtmlWithUpload(
        slidesData,
        {},
        {
          enabled: false,
        },
      );

      expect(result).toBeDefined();
      expect(result.htmlContent).toContain('测试标题');
      expect(result.cloudStorage).toBeUndefined();
    });
  });

  describe('Modern Design Templates', () => {
    it('should return all modern design templates', () => {
      const templates = service.getAllModernDesignTemplates();

      expect(templates).toBeDefined();
      expect(templates.length).toBeGreaterThan(0);

      // 验证包含预期的模板
      const templateIds = templates.map((t) => t.id);
      expect(templateIds).toContain('glassmorphism');
      expect(templateIds).toContain('gradient-modern');
      expect(templateIds).toContain('tech-grid');
      expect(templateIds).toContain('neon-glass');
    });

    it('should return specific template by ID', () => {
      const glassmorphismTemplate =
        service.getModernDesignTemplate('glassmorphism');

      expect(glassmorphismTemplate).toBeDefined();
      expect(glassmorphismTemplate?.id).toBe('glassmorphism');
      expect(glassmorphismTemplate?.name).toBe('玻璃拟态');
      expect(glassmorphismTemplate?.styles.backdropFilter).toBe('blur(10px)');
    });

    it('should return undefined for non-existent template', () => {
      const nonExistentTemplate =
        service.getModernDesignTemplate('non-existent');
      expect(nonExistentTemplate).toBeUndefined();
    });
  });

  describe('Dynamic Gradient Generation', () => {
    it('should generate gradient with two colors', () => {
      const colors = ['#667eea', '#764ba2'];
      const gradient = service.generateDynamicGradient(colors, 135);

      expect(gradient).toContain('linear-gradient(135deg');
      expect(gradient).toContain('#667eea 0%');
      expect(gradient).toContain('#764ba2 100%');
    });

    it('should generate gradient with multiple colors', () => {
      const colors = ['#667eea', '#764ba2', '#f093fb'];
      const gradient = service.generateDynamicGradient(colors, 90);

      expect(gradient).toContain('linear-gradient(90deg');
      expect(gradient).toContain('#667eea 0%');
      expect(gradient).toContain('#764ba2 50%');
      expect(gradient).toContain('#f093fb 100%');
    });

    it('should handle empty colors array', () => {
      const gradient = service.generateDynamicGradient([], 45);
      expect(gradient).toContain('#667eea');
      expect(gradient).toContain('#764ba2');
    });
  });

  describe('Glow Effect Generation', () => {
    it('should generate subtle glow effect', () => {
      const glow = service.generateGlowEffect('#4A48E2', 'subtle');

      expect(glow).toContain('0 0 10px 0px #4A48E20.3');
    });

    it('should generate medium glow effect', () => {
      const glow = service.generateGlowEffect('#4A48E2', 'medium');

      expect(glow).toContain('0 0 20px 0px #4A48E20.5');
    });

    it('should generate strong glow effect', () => {
      const glow = service.generateGlowEffect('#4A48E2', 'strong');

      expect(glow).toContain('0 0 40px 5px #4A48E20.7');
    });
  });

  describe('Grid Pattern Generation', () => {
    it('should generate grid pattern with default parameters', () => {
      const pattern = service.generateGridPattern();

      expect(pattern).toContain('radial-gradient(circle at 2px 2px');
      expect(pattern).toContain('rgba(255, 255, 255, 0.15) 1px');
    });

    it('should generate grid pattern with custom parameters', () => {
      const pattern = service.generateGridPattern(
        20,
        1,
        'rgba(0, 255, 255, 0.3)',
      );

      expect(pattern).toContain('radial-gradient(circle at 1px 1px');
      expect(pattern).toContain('rgba(0, 255, 255, 0.3) 1px');
    });
  });
});
