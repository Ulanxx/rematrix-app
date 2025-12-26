import { Test, TestingModule } from '@nestjs/testing';
import { PdfMergeService } from '../pdf-merge.service';
import { PptSlideData } from '../../ppt/ppt.types';

describe('PdfMergeService', () => {
  let service: PdfMergeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PdfMergeService],
    }).compile();

    service = module.get<PdfMergeService>(PdfMergeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mergeSlides', () => {
    it('should merge slides into single page', async () => {
      // 准备测试数据
      const slidesData: PptSlideData[] = [
        {
          slideId: 'slide-1',
          title: '第一页',
          content: ['内容1'],
          bullets: ['要点1', '要点2'],
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
            totalSlides: 2,
          },
        },
        {
          slideId: 'slide-2',
          title: '第二页',
          content: ['内容2'],
          bullets: ['要点3', '要点4'],
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
          metadata: {
            slideNumber: 2,
            totalSlides: 2,
          },
        },
      ];

      const config = {
        targetLayout: 'single-page' as const,
        pageSize: 'A4' as const,
        mergeStrategy: 'grid' as const,
        preserveAspectRatio: true,
        maxSlidesPerPage: 6,
        spacing: {
          horizontal: 20,
          vertical: 20,
          margin: 40,
        },
        scaling: {
          autoScale: true,
          maxScale: 0.8,
          minScale: 0.3,
        },
      };

      // 执行测试
      const result = await service.mergeSlides(slidesData, config);

      // 验证结果
      expect(result).toBeDefined();
      expect(result.htmlContent).toContain('<!DOCTYPE html>');
      expect(result.htmlContent).toContain('merged-document');
      expect(result.config).toEqual(config);
      expect(result.metadata.totalSlides).toBe(2);
      expect(result.metadata.totalPages).toBe(1);
      expect(result.pages).toHaveLength(1);
      expect(result.pages[0].slideIndices).toEqual([0, 1]);
    });

    it('should handle empty slides data', async () => {
      const slidesData: PptSlideData[] = [];
      const config = {
        targetLayout: 'single-page' as const,
        pageSize: 'A4' as const,
        mergeStrategy: 'grid' as const,
        preserveAspectRatio: true,
        maxSlidesPerPage: 6,
        spacing: {
          horizontal: 20,
          vertical: 20,
          margin: 40,
        },
        scaling: {
          autoScale: true,
          maxScale: 0.8,
          minScale: 0.3,
        },
      };

      const result = await service.mergeSlides(slidesData, config);

      expect(result).toBeDefined();
      expect(result.metadata.totalSlides).toBe(0);
      expect(result.metadata.totalPages).toBe(0);
    });

    it('should use default config when not provided', async () => {
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

      const result = await service.mergeSlides(slidesData);

      expect(result.config.mergeStrategy).toBe('smart-fit');
      expect(result.config.pageSize).toBe('A4');
      expect(result.config.maxSlidesPerPage).toBe(6);
    });
  });
});
