import { Test, TestingModule } from '@nestjs/testing';
import { ThemeDesignService } from '../theme-design.service';
import { ThemeDesignOptions } from '../theme-design.service';

describe('ThemeDesignService', () => {
  let service: ThemeDesignService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThemeDesignService],
    }).compile();

    service = module.get<ThemeDesignService>(ThemeDesignService);
  });

  describe('getAllThemes', () => {
    it('should return all available themes', () => {
      const themes = service.getAllThemes();

      expect(themes).toBeDefined();
      expect(themes.length).toBeGreaterThan(0);

      // 验证包含预期的主题
      const themeIds = themes.map((t) => t.id);
      expect(themeIds).toContain('modern-tech');
      expect(themeIds).toContain('classic-professional');
      expect(themeIds).toContain('creative-vibrant');
      expect(themeIds).toContain('minimal-clean');
    });
  });

  describe('getThemeById', () => {
    it('should return theme when ID exists', () => {
      const theme = service.getThemeById('modern-tech');

      expect(theme).toBeDefined();
      expect(theme?.id).toBe('modern-tech');
      expect(theme?.name).toBe('现代科技');
      expect(theme?.colorScheme).toBe('blue-gradient');
      expect(theme?.visualEffects).toContain('glass-effect');
    });

    it('should return undefined when ID does not exist', () => {
      const theme = service.getThemeById('non-existent');
      expect(theme).toBeUndefined();
    });
  });

  describe('recommendTheme', () => {
    it('should recommend professional theme for business style', () => {
      const preferences = { style: 'professional' };
      const theme = service.recommendTheme(preferences);

      expect(theme.id).toBe('classic-professional');
    });

    it('should recommend modern theme for modern style', () => {
      const preferences = { style: 'modern' };
      const theme = service.recommendTheme(preferences);

      expect(theme.id).toBe('modern-tech');
    });

    it('should recommend creative theme for creative style', () => {
      const preferences = { style: 'creative' };
      const theme = service.recommendTheme(preferences);

      expect(theme.id).toBe('creative-vibrant');
    });

    it('should return default modern-tech theme for unknown style', () => {
      const preferences = { style: 'unknown' };
      const theme = service.recommendTheme(preferences);

      expect(theme.id).toBe('modern-tech');
    });
  });

  describe('generateThemeConfig', () => {
    it('should generate theme config for valid theme ID', () => {
      const config = service.generateThemeConfig('modern-tech', {
        primaryColor: '#custom-color',
      });

      expect(config.designTheme).toBe('modern-tech');
      expect(config.colorScheme).toBe('blue-gradient');
      expect(config.typography).toBe('modern-sans');
      expect(config.layoutStyle).toBe('glassmorphism');
      expect(config.visualEffects).toContain('glass-effect');
      expect(config.customizations.primaryColor).toBe('#custom-color');
    });

    it('should throw error for invalid theme ID', () => {
      expect(() => {
        service.generateThemeConfig('invalid-theme');
      }).toThrow('Theme with id invalid-theme not found');
    });
  });

  describe('validateThemeConfig', () => {
    it('should validate correct theme config', () => {
      const config: ThemeDesignOptions = {
        designTheme: 'modern-tech',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: ['glass-effect', 'gradient-bg'],
        customizations: {},
      };

      const result = service.validateThemeConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing required fields', () => {
      const config = {
        designTheme: '',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: [],
        customizations: {},
      };

      const result = service.validateThemeConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Design theme is required');
    });

    it('should detect invalid theme ID', () => {
      const config: ThemeDesignOptions = {
        designTheme: 'invalid-theme',
        colorScheme: 'blue-gradient',
        typography: 'modern-sans',
        layoutStyle: 'glassmorphism',
        visualEffects: [],
        customizations: {},
      };

      const result = service.validateThemeConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid design theme: invalid-theme');
    });
  });

  describe('getThemeStyles', () => {
    it('should return CSS styles for valid theme', () => {
      const styles = service.getThemeStyles('modern-tech');

      expect(styles).toBeDefined();
      expect(styles).toContain('--primary-color: #4A48E2');
      expect(styles).toContain('--secondary-color: #6366F1');
      expect(styles).toContain('.slide {');
    });

    it('should return empty string for invalid theme', () => {
      const styles = service.getThemeStyles('invalid-theme');
      expect(styles).toBe('');
    });
  });
});
