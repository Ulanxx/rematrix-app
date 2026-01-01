/**
 * MVP 测试脚本 - 验证 AI PPT 生成
 *
 * 运行: npx ts-node src/modules/ppt/test-ai-generation.ts
 */

import { PptService, StoryboardSlide } from './ppt.service';
import { AiHtmlGeneratorService } from './ai-html-generator.service';
import { HtmlValidatorService } from './html-validator.service';

import * as fs from 'fs';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testAiGeneration() {
  console.log('🚀 开始测试 AI PPT 生成...\n');

  const validator = new HtmlValidatorService();
  const aiGenerator = new AiHtmlGeneratorService(validator);
  const pptService = new PptService(aiGenerator);

  const testSlides: StoryboardSlide[] = [
    {
      id: 'slide-1',
      title: 'Agent 生产之殇',
      content: [
        '拒绝智能涌现神话',
        'Agent 关进规则之笼',
        '平衡智能与确定性',
      ],
      type: 'title',
      visualSuggestions:
        '深邃背景中剧烈扭动的淡蓝色 Agent 粒子球；大字标题：Agent 生产之殇；副标题：如何将 LLM 的不确定性关进工程沙盒',
      slideNumber: 1,
    },
    {
      id: 'slide-2',
      title: '现状：为什么我们在“抽卡”？',
      content: [
        '工程熵增与概率抽样',
        '齿轮 vs 云团',
        '确定性代码封装黑盒',
      ],
      visualSuggestions:
        '对比图：左侧精密齿轮，右侧变幻云团；动态演示：数据进入云团后产生随机概率方向箭头',
      slideNumber: 2,
      type: 'content',
    },
    {
      id: 'slide-3',
      title: '诊断：拒绝 LLM 函数化思维',
      content: [
        '拒绝 LLM 函数化思维',
        '输出分布的不稳定性',
        'Prompt 微调的连锁反应',
      ],
      visualSuggestions:
        '函数列表对比：f(x)=y 的唯一连线 vs 多重阴影输出；警告图标：闪烁的 Prompt 提示词像易碎纸张',
      slideNumber: 3,
      type: 'content',
    },
    {
      id: 'slide-4',
      title: '警惕实验室幻觉',
      content: [
        '警惕实验室幻觉',
        '长 Context 稀释注意力',
        '指令遗忘与自由发挥',
      ],
      visualSuggestions:
        '对比：左侧干净实验室短文本精准反应，右侧生产环境长上下文下眼神涣散的 Agent',
      slideNumber: 4,
      type: 'content',
    },
    {
      id: 'slide-5',
      title: '多 Agent 是错误放大器',
      content: [
        '多 Agent 是错误放大器',
        '偏差级数级放大',
        '自信的错误闭环',
      ],
      visualSuggestions:
        '三个 Agent 线性排布，偏差几何级放大；产出球体变形，标注：自信的错误',
      slideNumber: 5,
      type: 'content',
    },
    {
      id: 'slide-6',
      title: '控制流的致命直接连接',
      content: [
        '控制流的致命直接连接',
        'LLM 三无特征：无幂等、无边界、无 Trace',
        '不可逆操作灾难',
      ],
      visualSuggestions:
        '流程图：LLM 直接修改数据库（红叉）；标注：禁止直接驱动敏感业务流',
      slideNumber: 6,
      type: 'content',
    },
    {
      id: 'slide-7',
      title: '法则一：收回决策终审权',
      content: [
        '收回决策终审权',
        '角色降级：建议者而非决策官',
        '逻辑硬编码固化',
      ],
      visualSuggestions:
        '法官席上的硬编码模块，LLM 作为证人递交建议；关键逻辑锁进密码保险箱',
      slideNumber: 7,
      type: 'content',
    },
    {
      id: 'slide-8',
      title: '法则二：构建外部状态机',
      content: [
        '构建外部状态机',
        'Context Window 不可靠性',
        '强制状态共识',
      ],
      visualSuggestions:
        '外部数据库图标连接 Agent 标注为‘状态机’；模型查看系统快照而非聊天记录',
      slideNumber: 8,
      type: 'content',
    },
    {
      id: 'slide-9',
      title: '法则三：设计熔断与降级',
      content: [
        '设计熔断与降级',
        '构建三道防线护栏',
        '防止幻觉级联爆炸',
      ],
      visualSuggestions:
        '输出端口的过滤网（Guardrails）；展示：校验 -> 拦截 -> 确认防线',
      slideNumber: 9,
      type: 'content',
    },
    {
      id: 'slide-10',
      title: '总结：工程规范压缩不确定性',
      content: [
        '工程规范压缩不确定性',
        '确定性 > 聪明度',
        '最好的 Agent 是守规矩的',
      ],
      type: 'closing',
      visualSuggestions:
        '钢结构工程框架包裹发光智能核心；金句：确定性 > 聪明度',
      slideNumber: 10,
    },
  ];

  const context = {
    courseTitle: 'Agent 生产之殇：如何将 LLM 的不确定性关进工程沙盒',
    outline: [
      '引言：拒绝智能涌现神话',
      '现状：工程熵增与概率抽样',
      '诊断：拒绝 LLM 函数化思维',
      '风险：警惕实验室幻觉',
      '风险：多 Agent 是错误放大器',
      '警示：控制流的致命直接连接',
      '法则一：收回决策终审权',
      '法则二：构建外部状态机',
      '法则三：设计熔断与降级',
      '总结：工程规范压缩不确定性',
    ],
    totalSlides: testSlides.length,
  };

  const themeConfig = {
    colors: {
      primary: '#4285F4',
      secondary: '#34A853',
      accent: '#FBBC05',
      background: '#FFFFFF',
      text: '#202124',
    },
    typography: {
      fontFamily: 'Inter, sans-serif',
      headingFont: 'Poppins, sans-serif',
    },
    designStyle: 'google 风格',
  };

  try {
    console.log('🔧 测试模式对比：\n');

    // 使用优化后的直接生成路径
    console.log('🚀 使用优化后的直接生成路径...');
    const result = await pptService.generateDirectPpt(testSlides, context, {
      themeConfig,
      masterConfig: {
        showHeader: true,
        showPageNumber: true,
        headerLeftText: 'Rematrix AI PPT 实验室',
        headerRightText: 'INTERNAL DRAFT',
      },
    } as any);

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

void testAiGeneration();
