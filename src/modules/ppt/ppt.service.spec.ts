import { Test, TestingModule } from '@nestjs/testing';
import { PptService } from './ppt.service';
import { AiHtmlGeneratorService } from './ai-html-generator.service';
import {
  StoryboardSlide,
  GenerationContext,
  AiGeneratedHtml,
  AiGenerationOptions,
} from './ai-html-generator.service';

describe('PptService - Simplified', () => {
  let service: PptService;
  let aiHtmlGenerator: jest.Mocked<AiHtmlGeneratorService>;

  beforeEach(async () => {
    const mockAiHtmlGenerator = {
      generateAllSlides: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PptService,
        {
          provide: AiHtmlGeneratorService,
          useValue: mockAiHtmlGenerator,
        },
      ],
    }).compile();

    service = module.get<PptService>(PptService);
    aiHtmlGenerator = module.get(AiHtmlGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate PPT with AI and master slide successfully', async () => {
    // 准备测试数据
    const slides: StoryboardSlide[] = [
      {
        id: 'slide-1',
        title: 'Test Slide',
        content: ['This is a test slide'],
        type: 'content',
      } as any,
    ];

    const context: GenerationContext = {
      courseTitle: 'Master Slide Course',
    };

    const mockResults: AiGeneratedHtml[] = [
      {
        slideId: 'slide-1',
        html: '<div>Test HTML</div>',
        status: 'success',
        generatedAt: new Date().toISOString(),
      } as any,
    ];

    aiHtmlGenerator.generateAllSlides.mockResolvedValue(mockResults);

    // 执行测试 - 显式启用母版
    const result = await service.generatePptWithAi(slides, context, {
      enableMasterSlide: true,
    });

    // 验证结果
    expect(result).toBeDefined();
    expect(result.htmlPages).toHaveLength(1);
    expect(result.htmlPages[0]).toContain('ppt-page-wrapper');
    expect(result.htmlPages[0]).toContain('master-overlay');
    expect(result.htmlPages[0]).toContain('Master Slide Course');
    expect(result.htmlPages[0]).toContain('PAGE 01 / 01');
  });

  it('should handle AI generator initialization error', async () => {
    // 创建没有AI生成器的服务实例
    const serviceWithoutAi = new PptService(null as any);

    const slides: StoryboardSlide[] = [
      {
        id: 'slide-1',
        title: 'Test Slide',
        content: ['This is a test slide'],
        type: 'content',
      } as any,
    ];

    const context: GenerationContext = {
      courseTitle: 'Test Course',
    };

    // 验证抛出错误
    await expect(
      serviceWithoutAi.generatePptWithAi(slides, context),
    ).rejects.toThrow('AI HTML Generator 未初始化');
  });

  it('should pass options correctly to AI generator', async () => {
    const slides: StoryboardSlide[] = [
      {
        id: 'slide-1',
        title: 'Test Slide',
        content: ['This is a test slide'],
        type: 'content',
      } as any,
    ];

    const context: GenerationContext = {
      courseTitle: 'Test Course',
    };

    const options: AiGenerationOptions = {
      themeConfig: {
        colors: {
          primary: '#blue',
          background: '#white',
        },
      },
      concurrency: 5,
      maxRetries: 3,
      enableCache: false,
      skipValidation: true,
    };

    const mockResults: AiGeneratedHtml[] = [
      {
        slideId: 'slide-1',
        html: '<div>Test HTML</div>',
        status: 'success',
        generatedAt: new Date().toISOString(),
      } as any,
    ];

    aiHtmlGenerator.generateAllSlides.mockResolvedValue(mockResults);

    await service.generatePptWithAi(slides, context, options);

    expect(aiHtmlGenerator.generateAllSlides).toHaveBeenCalledWith(
      slides,
      context,
      options,
    );
  });
});
