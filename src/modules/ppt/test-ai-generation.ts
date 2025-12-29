/**
 * MVP 测试脚本 - 验证 AI PPT 生成
 *
 * 运行: npx ts-node src/modules/ppt/test-ai-generation.ts
 */

import { PptService } from './ppt.service';
import { AiHtmlGeneratorService } from './ai-html-generator.service';
import { HtmlValidatorService } from './html-validator.service';

import * as fs from 'fs';
async function testAiGeneration() {
  console.log('🚀 开始测试 AI PPT 生成...\n');

  const validator = new HtmlValidatorService();
  const aiGenerator = new AiHtmlGeneratorService(validator);
  const pptService = new PptService(aiGenerator);

  const testSlides = [
    {
      id: 'slide-1',
      title: '拒绝“抽卡式”上线：AI 自动化测试实战',
      content: [
        '从“运维监控”转向“工程化测试”',
        '核心痛点：LLM 的不确定性与非确定性输出',
        '目标：构建 AI 系统的“生死线”保证',
        'Evals：用魔法打败魔法 (LLM-as-a-Judge)',
      ],
      visualSuggestions:
        '主视觉为一个天平，左侧是发光的 AI 芯片，右侧是一叠厚厚的测试卷子；背景采用 Matrix 风格代码雨；警示色配色（黄黑）。',
      slideNumber: 1,
    },
    {
      id: 'slide-2',
      title: '现状：为什么我们在“抽卡”？',
      content: [
        '传统开发：单元测试 (Unit Test) 保证逻辑',
        'AI 开发现状：改 Prompt -> 跑几个 Case -> LGTM -> 上线爆炸',
        '根本原因：概率模型无法使用简单的 assert 逻辑',
        '风险：修一个 Bug，可能引发十个新 Bug',
      ],
      visualSuggestions:
        '对比图：左边是精密的齿轮咬合（传统软件），右边是一个老虎机/抽卡界面（AI 开发现状）。',
      slideNumber: 2,
    },
    {
      id: 'slide-3',
      title: '诊断：你是否需要 Evals？',
      content: [
        '恐惧重构：不敢修改 Prompt，怕牵一发而动全身',
        '模型切换困难：无法量化换成 DeepSeek/Claude 后的效果损耗',
        '幻觉不可控：知道有幻觉，但不知道具体概率是 5% 还是 50%',
        '结论：Evals 是 AI 工程成熟度的分水岭',
      ],
      visualSuggestions:
        '一个焦虑的工程师面对三个巨大的问号，或者一个带有警告标志的仪表盘。',
      slideNumber: 3,
    },
    {
      id: 'slide-4',
      title: '核心方法论：LLM-as-a-Judge',
      content: [
        '基本架构：让更强的模型来“阅卷”',
        '考生 (Student)：你的应用模型 (7B / Fine-tuned)',
        '考官 (Judge)：最强基座模型 (GPT-4o / Claude 3.5)',
        '判卷逻辑：不只问好坏，更要定义多维指标',
      ],
      visualSuggestions:
        '流程图：Input -> Student Model -> Output -> Judge Model (拿着放大镜) -> Score/Report。',
      slideNumber: 4,
    },
    {
      id: 'slide-5',
      title: '评分维度：怎么定义“好”？',
      content: [
        'Faithfulness (忠实度)：是否违背参考文档？(防幻觉核心)',
        'Answer Relevancy (相关性)：是否答非所问？',
        'Coherence (连贯性)：逻辑是否通顺？',
        '量化指标：将主观感受转化为 0-1 的分数',
      ],
      visualSuggestions:
        '雷达图 (Radar Chart)，展示三个维度（忠实度、相关性、连贯性）的评分覆盖。',
      slideNumber: 5,
    },
    {
      id: 'slide-6',
      title: '利器 1：Ragas (RAG 系统的标配)',
      content: [
        '适用场景：专注于 RAG (检索增强生成) 应用',
        '核心价值：区分是“检索拉跨”还是“生成拉跨”',
        '关键指标：Context Precision (上下文精度) & Recall (召回率)',
        '代码风格：几行 Python 代码即可集成评分',
      ],
      visualSuggestions:
        '展示 Ragas 的 Python 代码片段，或者 RAG 链路的切面诊断图。',
      slideNumber: 6,
    },
    {
      id: 'slide-7',
      title: '利器 2：DeepEval & Promptfoo',
      content: [
        'DeepEval (TDD 风格)：集成 CI/CD，分数不达标禁止上线',
        'Promptfoo (对比神器)：CLI 工具，生成矩阵视图',
        'Promptfoo 优势：一眼看清 GPT-4 vs DeepSeek 的表现差异',
        '拒绝造轮子：使用成熟框架替代手写脚本',
      ],
      visualSuggestions:
        '左侧展示 DeepEval 的流水线 Pass/Fail 截图，右侧展示 Promptfoo 的矩阵对比表格 (Matrix View)。',
      slideNumber: 7,
    },
    {
      id: 'slide-8',
      title: '题库来源：黄金数据集 (Golden Dataset)',
      content: [
        '最难的一步：没有题库无法考试',
        '冷启动 (Synthetic)：让 LLM 根据文档自动生成 Q&A 对',
        '线上回流 (Production)：利用可观测性数据',
        '闭环：将用户点踩 (👎) 的真实问题导出为测试用例',
      ],
      visualSuggestions:
        '循环示意图：文档 -> AI生成题目 -> 测试 -> 上线 -> 用户反馈 -> 导出错题 -> 回归测试。',
      slideNumber: 8,
    },
    {
      id: 'slide-9',
      title: '总结与行动：从炼金术到化学',
      content: [
        '没有 Evals = 炼金术士 (靠运气)',
        '有 Evals = 化学家 (靠实验与数据)',
        '行动指南：在该 Prompt 前，先问“测试集准备好了吗？”',
        '下期预告：性能优化篇 (Cache、路由与模型蒸馏)',
      ],
      visualSuggestions:
        '分割画面：左边是古代炼金术士在冒烟的炉子前，右边是现代科学家在整洁的实验室分析数据。',
      slideNumber: 9,
    },
  ];

  const context = {
    courseTitle: 'AI 系统的生死线：LLM Evals 自动化测试实战',
    outline: [
      '引言：拒绝抽卡式上线与不确定性',
      '痛点：为什么传统测试在 LLM 面前失效',
      '诊断：你需要 Evals 的三个信号',
      '核心：LLM-as-a-Judge 架构详解',
      '维度：忠实度、相关性与连贯性量化',
      '工具：Ragas - RAG 系统的评分标配',
      '工具：DeepEval 与 Promptfoo 的工程实践',
      '数据：如何冷启动构建黄金数据集',
      '总结：从炼金术士到化学家的进阶',
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

    // 生成完整PPT（使用快速模式）
    console.log('🚀 生成完整PPT（快速模式）...');
    const result = await pptService.generatePptWithAi(testSlides, context, {
      themeConfig,
      concurrency: 10,
      maxRetries: 5,
      enableCache: true,
      skipValidation: false, // 使用快速模式
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

void testAiGeneration();
