# Change: 重构 PPT 输出为独立幻灯片数组

## Why
当前 PAGES 阶段返回单个合并的 `pptUrl`，但这导致：
1. 浏览器渲染时多页内容可能叠加显示
2. PDF 生成依赖合并后的 HTML，难以精确控制每页截图
3. 前端无法单独访问和展示每一页的内容

改为返回 `sliders` 数组（每页独立的 `htmlContent` 和 `url`）可以：
- 提供更灵活的页面访问和展示方式
- 让 PDF 生成基于每页独立截图拼接，提高质量和可控性
- 简化前端对单页内容的处理

## What Changes
- **移除** `pptUrl` 字段（单个合并 HTML 的 URL）
- **新增** `sliders` 数组字段，每个元素包含：
  - `htmlContent`: 该页的完整 HTML 内容
  - `url`: 该页上传到云存储的 URL
  - `slideNumber`: 页码
- **修改** PDF 生成逻辑：从 `sliders` 数组中逐页截图，然后拼接成最终 PDF

## Impact
- **受影响的能力**: `pages-step`（PAGES 工作流阶段）
- **受影响的代码**:
  - `src/modules/workflow-steps/steps/pages.step.ts` - 输出结构调整
  - `src/modules/ppt/ppt.service.ts` - 需要支持逐页上传
  - `src/modules/pdf/pdf.service.ts` - PDF 生成改为逐页截图拼接
- **破坏性变更**: **BREAKING** - API 响应结构变化，前端需要适配新的 `sliders` 字段
