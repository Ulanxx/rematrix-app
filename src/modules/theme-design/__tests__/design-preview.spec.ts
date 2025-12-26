import { Test, TestingModule } from '@nestjs/testing';
import { DesignPreviewService } from '../design-preview.service';
import { ThemeDesignService } from '../theme-design.service';
import { DesignTemplateService } from '../design-template.service';

describe('DesignPreviewService', () => {
  let service: DesignPreviewService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DesignPreviewService,
        ThemeDesignService,
        DesignTemplateService,
      ],
    }).compile();

    service = module.get<DesignPreviewService>(DesignPreviewService);
  });

  describe('generatePreview', () => {
    it('should generate preview for valid theme and template', async () => {
      const themeConfig = {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: ['glass-effect', 'gradient-bg'],
        customizations: {
          primaryColor: '#4A48E2',
          secondaryColor: '#6366F1',
        },
      };

      const templateId = 'glassmorphism-card';

      const preview = await service.generatePreview(themeConfig, templateId);

      expect(preview).toBeDefined();
      expect(preview.id).toBeDefined();
      expect(preview.themeConfig).toEqual(themeConfig);
      expect(preview.template.id).toBe(templateId);
      expect(preview.htmlContent).toContain('<!DOCTYPE html>');
      expect(preview.cssStyles).toContain('.glass-card');
      expect(preview.generatedAt).toBeDefined();
    });

    it('should throw error for invalid template ID', async () => {
      const themeConfig = {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: [],
        customizations: {},
      };

      await expect(
        service.generatePreview(themeConfig, 'invalid-template'),
      ).rejects.toThrow('Template with id invalid-template not found');
    });

    it('should throw error for invalid theme config', async () => {
      const invalidThemeConfig = {
        designTheme: '', // 无效的主题
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: [],
        customizations: {},
      };

      await expect(
        service.generatePreview(invalidThemeConfig, 'glassmorphism-card'),
      ).rejects.toThrow('Invalid theme config');
    });
  });

  describe('evaluateDesignQuality', () => {
    it('should evaluate design quality for modern theme', async () => {
      const themeConfig = {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: ['glass-effect', 'gradient-bg', 'glow-effect'],
        customizations: {},
      };

      const templateId = 'glassmorphism-card';

      const qualityScore = await service.evaluateDesignQuality(
        themeConfig,
        templateId,
      );

      expect(qualityScore).toBeDefined();
      expect(qualityScore.overall).toBeGreaterThanOrEqual(0);
      expect(qualityScore.overall).toBeLessThanOrEqual(100);
      expect(qualityScore.visualAppeal).toBeGreaterThanOrEqual(0);
      expect(qualityScore.visualAppeal).toBeLessThanOrEqual(100);
      expect(qualityScore.readability).toBeGreaterThanOrEqual(0);
      expect(qualityScore.readability).toBeLessThanOrEqual(100);
      expect(qualityScore.accessibility).toBeGreaterThanOrEqual(0);
      expect(qualityScore.accessibility).toBeLessThanOrEqual(100);
      expect(qualityScore.performance).toBeGreaterThanOrEqual(0);
      expect(qualityScore.performance).toBeLessThanOrEqual(100);
      expect(qualityScore.responsiveness).toBeGreaterThanOrEqual(0);
      expect(qualityScore.responsiveness).toBeLessThanOrEqual(100);
      expect(Array.isArray(qualityScore.issues)).toBe(true);
    });

    it('should provide suggestions for low scores', async () => {
      const themeConfig = {
        designTheme: 'classic-professional',
        colorScheme: 'professional-blue',
        typography: 'classic-serif',
        layoutStyle: 'traditional',
        visualEffects: [], // 简单效果
        customizations: {},
      };

      const templateId = 'professional-layout';

      const qualityScore = await service.evaluateDesignQuality(
        themeConfig,
        templateId,
      );
      const suggestions = service.getImprovementSuggestions(qualityScore);

      expect(Array.isArray(suggestions)).toBe(true);
      // 对于简单设计，应该有改进建议
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('getImprovementSuggestions', () => {
    it('should provide suggestions based on quality issues', () => {
      const qualityScore = {
        overall: 60,
        visualAppeal: 50,
        readability: 80,
        accessibility: 70,
        performance: 90,
        responsiveness: 60,
        issues: [
          {
            type: 'suggestion' as const,
            category: 'visual' as const,
            message: '设计缺少现代视觉效果',
            suggestion: '考虑添加玻璃拟态效果或渐变背景以提升视觉吸引力',
            severity: 'low' as const,
          },
        ],
      };

      const suggestions = service.getImprovementSuggestions(qualityScore);

      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions).toContain(
        '考虑添加玻璃拟态效果或渐变背景以提升视觉吸引力',
      );
      expect(suggestions).toContain(
        '考虑添加更多视觉元素，如图标、渐变或阴影效果',
      );
    });

    it('should provide accessibility suggestions for low accessibility score', () => {
      const qualityScore = {
        overall: 60,
        visualAppeal: 80,
        readability: 80,
        accessibility: 50, // 低分
        performance: 90,
        responsiveness: 80,
        issues: [],
      };

      const suggestions = service.getImprovementSuggestions(qualityScore);

      expect(suggestions).toContain(
        '确保所有交互元素都有足够的对比度和焦点状态',
      );
    });

    it('should provide performance suggestions for low performance score', () => {
      const qualityScore = {
        overall: 60,
        visualAppeal: 80,
        readability: 80,
        accessibility: 80,
        performance: 50, // 低分
        responsiveness: 80,
        issues: [],
      };

      const suggestions = service.getImprovementSuggestions(qualityScore);

      expect(suggestions).toContain('简化CSS动画效果，减少复杂的选择器');
    });

    it('should provide responsiveness suggestions for low responsiveness score', () => {
      const qualityScore = {
        overall: 60,
        visualAppeal: 80,
        readability: 80,
        accessibility: 80,
        performance: 80,
        responsiveness: 50, // 低分
        issues: [],
      };

      const suggestions = service.getImprovementSuggestions(qualityScore);

      expect(suggestions).toContain('添加媒体查询以支持不同屏幕尺寸');
    });
  });
});
