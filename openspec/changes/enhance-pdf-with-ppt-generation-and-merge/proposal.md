# Change: 增强 PDF 生成功能 - PPT 生成与合并架构

## Why
当前 PDF 生成直接从 HTML 转换，缺乏专业的 PPT 设计感和视觉冲击力。用户期望通过先生成炫酷的 PPT 幻灯片，再将多页内容合并为单页 PDF 的方式，获得更具演示效果和视觉吸引力的文档。

## What Changes
- **PPT 生成架构**: 新增 PPT 生成服务，支持创建炫酷的幻灯片设计
- **页面合并逻辑**: 实现将多页 PPT 内容智能合并为单页 PDF 的算法
- **视觉设计增强**: 集成专业 PPT 设计元素，包括动画、过渡效果和现代布局
- **AI 自由发挥**: 给予 AI 模型更大的设计自由度，创建独特的视觉效果
- **流程重构**: 从直接 HTML->PDF 改为 PPT->合并->PDF 的三阶段流程

## Impact
- Affected specs: workflow-steps, ppt-generation, pdf-merge
- Affected code: 
  - src/modules/pdf/ (重构为支持 PPT 合并)
  - src/modules/workflow-steps/steps/pages.step.ts (更新为 PPT 生成流程)
  - 新增 src/modules/ppt/ (PPT 生成服务)
  - 新增 src/modules/pdf-merge/ (PDF 合并服务)
