import { Test, TestingModule } from '@nestjs/testing';
import { PptService } from '../ppt.service';
import { PptSlideData, PptGenerationOptions } from '../ppt.types';

describe('PptService', () => {
  let service: PptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PptService],
    }).compile();

    service = module.get<PptService>(PptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generatePptHtml', () => {
    it('should generate HTML from PPT slides data', async () => {
      // 准备测试数据
      const slidesData: PptSlideData[] = [
        {
          slideId: 'slide-1',
          title: '测试标题',
          subtitle: '测试副标题',
          content: ['内容1', '内容2'],
          bullets: ['要点1', '要点2', '要点3'],
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
              value: 'linear-gradient(135deg, #f0f9ff 0%, #ffffff 100%)',
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
        aspectRatio: '16:9',
      };

      // 执行测试
      const result = await service.generatePptHtml(slidesData, options);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.htmlContent).toContain('测试标题');
      expect(result.htmlContent).toContain('要点1');
      expect(result.slidesData).toEqual(slidesData);
      expect(result.options).toEqual(expect.objectContaining(options));
      expect(result.metadata.slideCount).toBe(1);
      expect(result.metadata.hasAnimations).toBe(true);
    });

    it('should handle empty slides data', async () => {
      const slidesData: PptSlideData[] = [];
      const options: PptGenerationOptions = {};

      const result = await service.generatePptHtml(slidesData, options);

      expect(result).toBeDefined();
      expect(result.metadata.slideCount).toBe(0);
      expect(result.htmlContent).toContain('<!DOCTYPE html>');
    });

    it('should use default options when not provided', async () => {
      const slidesData: PptSlideData[] = [
        {
          slideId: 'slide-1',
          title: '测试',
          content: [],
          bullets: [],
          design: {
            layout: 'content',
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
            },
          },
          elements: [],
        },
      ];

      const result = await service.generatePptHtml(slidesData);

      expect(result.options.theme).toBe('modern');
      expect(result.options.colorScheme).toBe('blue');
      expect(result.options.enableAnimations).toBe(true);
    });
  });
});
