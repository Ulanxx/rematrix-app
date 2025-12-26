/**
 * MVP 测试脚本 - 验证 AI PPT 生成
 * 
 * 运行: npx ts-node src/modules/ppt/test-ai-generation.ts
 */

import { PptService } from './ppt.service';
import { AiHtmlGeneratorService } from './ai-html-generator.service';
import { HtmlValidatorService } from './html-validator.service';
import { PptCacheService } from './ppt-cache.service';

import * as fs from 'fs';
async function testAiGeneration() {
  console.log('🚀 开始测试 AI PPT 生成...\n');

  const validator = new HtmlValidatorService();
  const cache = new PptCacheService();
  const aiGenerator = new AiHtmlGeneratorService(validator);
  const pptService = new PptService(aiGenerator, cache);

  const testSlides = [
    {
      id: 'slide-1',
      title: 'AI 驱动的 PPT 生成系统',
      content: [
        '使用大语言模型生成完整的 HTML',
        '支持 Tailwind CSS 和 Font Awesome',
        '每页设计独特且符合内容主题',
        '自动验证和重试机制',
      ],
      visualSuggestions: '使用现代渐变背景，添加图标装饰',
      slideNumber: 1,
    },
    {
      id: 'slide-2',
      title: '核心特性',
      content: [
        '并行生成提升效率',
        '智能缓存减少成本',
        'HTML 质量验证',
        '云存储集成',
      ],
      visualSuggestions: '使用卡片布局展示特性',
      slideNumber: 2,
    },
  ];

  const context = {
    courseTitle: 'AI PPT 生成系统演示',
    outline: '介绍系统架构和核心功能',
    totalSlides: testSlides.length,
  };

  const themeConfig = {
    colors: {
      primary: '#4A48E2',
      secondary: '#6366F1',
      accent: '#8B5CF6',
      background: '#0F172A',
      text: '#FFFFFF',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Poppins, sans-serif',
    },
    designStyle: 'modern' as const,
  };

  try {
    const result = await pptService.generatePptWithAi(testSlides, context, {
      themeConfig,
      concurrency: 2,
      maxRetries: 2,
      enableCache: true,
      uploadToCloud: false,
    });

    console.log('\n✅ 生成完成!');
    console.log(`📊 统计: 成功 ${result.stats.success}/${result.stats.total}`);
    console.log(`📄 生成了 ${result.htmlPages.length} 个 HTML 页面`);

    if (result.htmlPages.length > 0) {
      console.log('\n📝 第一页预览 (前 500 字符):');
      console.log(result.htmlPages[0].substring(0, 500) + '...');
    }

    fs.writeFileSync('test-ppt.html', result.htmlPages.join(''));

    console.log('\n🎉 测试成功!');
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testAiGeneration();
