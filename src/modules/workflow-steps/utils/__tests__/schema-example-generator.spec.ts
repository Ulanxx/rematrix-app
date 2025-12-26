import { JobStage } from '@prisma/client';
import {
  generateSchemaExample,
  generateExampleForStage,
  generateFormattedExample,
} from '../schema-example-generator';

describe('SchemaExampleGenerator', () => {
  describe('generateExampleForStage', () => {
    it('should generate valid example for PLAN stage', () => {
      const example = generateExampleForStage(JobStage.PLAN);

      expect(example).toHaveProperty('estimatedPages');
      expect(example).toHaveProperty('estimatedDurationSec');
      expect(example).toHaveProperty('style');
      expect(example).toHaveProperty('questions');

      expect(typeof example.estimatedPages).toBe('number');
      expect(typeof example.estimatedDurationSec).toBe('number');
      expect(typeof example.style).toBe('string');
      expect(Array.isArray(example.questions)).toBe(true);
    });

    it('should generate valid example for OUTLINE stage', () => {
      const example = generateExampleForStage(JobStage.OUTLINE);

      expect(example).toHaveProperty('title');
      expect(example).toHaveProperty('sections');

      expect(typeof example.title).toBe('string');
      expect(Array.isArray(example.sections)).toBe(true);

      if (example.sections.length > 0) {
        const section = example.sections[0];
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('bullets');
        expect(typeof section.title).toBe('string');
        expect(Array.isArray(section.bullets)).toBe(true);
      }
    });

    it('should generate valid example for STORYBOARD stage', () => {
      const example = generateExampleForStage(JobStage.STORYBOARD);

      expect(example).toHaveProperty('pages');
      expect(Array.isArray(example.pages)).toBe(true);

      if (example.pages.length > 0) {
        const slide = example.pages[0];
        expect(slide).toHaveProperty('page');
        expect(slide).toHaveProperty('visual');
        expect(slide).toHaveProperty('narrationHints');
        expect(typeof slide.page).toBe('number');
        expect(Array.isArray(slide.visual)).toBe(true);
        expect(Array.isArray(slide.narrationHints)).toBe(true);
      }
    });

    it('should generate valid example for PAGES stage', () => {
      const example = generateExampleForStage(JobStage.PAGES);

      expect(example).toHaveProperty('theme');
      expect(example).toHaveProperty('slides');
      expect(example).toHaveProperty('pdfUrl');
      expect(example).toHaveProperty('pdfGenerated');

      expect(typeof example.pdfGenerated).toBe('boolean');
      expect(Array.isArray(example.slides)).toBe(true);

      if (example.slides.length > 0) {
        const slide = example.slides[0];
        expect(slide).toHaveProperty('title');
        expect(slide).toHaveProperty('bullets');
        expect(slide).toHaveProperty('design');
        expect(Array.isArray(slide.bullets)).toBe(true);
      }
    });

    it('should generate valid example for DONE stage', () => {
      const example = generateExampleForStage(JobStage.DONE);

      expect(example).toHaveProperty('jobId');
      expect(example).toHaveProperty('status');
      expect(example).toHaveProperty('completedAt');
      expect(example).toHaveProperty('summary');

      expect(typeof example.jobId).toBe('string');
      expect(typeof example.status).toBe('string');
      expect(typeof example.completedAt).toBe('string');
      expect(typeof example.summary).toBe('string');
    });
  });

  describe('generateFormattedExample', () => {
    it('should return formatted JSON string for PLAN stage', () => {
      const formatted = generateFormattedExample(JobStage.PLAN);

      expect(typeof formatted).toBe('string');

      // 验证是否为有效的JSON
      const parsed = JSON.parse(formatted);
      expect(parsed).toHaveProperty('estimatedPages');
      expect(parsed).toHaveProperty('estimatedDurationSec');
      expect(parsed).toHaveProperty('style');
      expect(parsed).toHaveProperty('questions');
    });

    it('should return properly formatted JSON with indentation', () => {
      const formatted = generateFormattedExample(JobStage.OUTLINE);

      // 验证JSON格式包含换行符和缩进
      expect(formatted).toContain('\n');
      expect(formatted).toContain('  ');

      // 验证可以解析为JSON
      const parsed = JSON.parse(formatted);
      expect(parsed).toHaveProperty('title');
      expect(parsed).toHaveProperty('sections');
    });
  });

  describe('generateSchemaExample', () => {
    it('should generate example for simple object schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        name: z.string(),
        age: z.number(),
        active: z.boolean(),
      });

      const example = generateSchemaExample(schema);

      expect(example).toHaveProperty('name');
      expect(example).toHaveProperty('age');
      expect(example).toHaveProperty('active');

      expect(typeof example.name).toBe('string');
      expect(typeof example.age).toBe('number');
      expect(typeof example.active).toBe('boolean');
    });

    it('should generate example for array schema', () => {
      const { z } = require('zod');
      const schema = z.array(z.string());

      const example = generateSchemaExample(schema);

      expect(Array.isArray(example)).toBe(true);
      if (example.length > 0) {
        expect(typeof example[0]).toBe('string');
      }
    });

    it('should generate example for nested object schema', () => {
      const { z } = require('zod');
      const schema = z.object({
        user: z.object({
          name: z.string(),
          email: z.string(),
        }),
        tags: z.array(z.string()),
      });

      const example = generateSchemaExample(schema);

      expect(example).toHaveProperty('user');
      expect(example).toHaveProperty('tags');

      expect(example.user).toHaveProperty('name');
      expect(example.user).toHaveProperty('email');
      expect(Array.isArray(example.tags)).toBe(true);
    });

    it('should handle optional and default values', () => {
      const { z } = require('zod');
      const schema = z.object({
        required: z.string(),
        optional: z.string().optional(),
        withDefault: z.string().default('default_value'),
      });

      const example = generateSchemaExample(schema);

      expect(example).toHaveProperty('required');
      expect(example).toHaveProperty('optional');
      expect(example).toHaveProperty('withDefault');

      expect(typeof example.required).toBe('string');
      expect(example.optional).toBeUndefined();
      expect(example.withDefault).toBe('default_value');
    });
  });
});
