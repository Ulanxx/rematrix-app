# Change: 增强 PPT 页面多样性和 PDF 生成功能

## Why
当前 PPT 生成功能存在以下问题：
1. 所有页面样式单一，缺乏视觉多样性
2. 缺少标准的演示结构（首页、详情页、结尾页）
3. PDF 生成功能缺失，无法将 HTML PPT 转换为 PDF 格式

## What Changes
- **PPT 页面多样性**：引入多种页面布局模板，包括标题页、内容页、图片页、对比页等
- **结构完整性**：自动生成首页、目录页、内容页、总结页、结尾页的完整结构
- **PDF 生成**：集成 Playwright 实现 HTML 到 PDF 的截图转换功能
- **内容优化**：支持卡片布局、图文混排、分栏展示等丰富内容形式

## Impact
- **Affected specs**: ppt-generation, workflow-steps, pdf-merge
- **Affected code**: 
  - `src/modules/ppt/ppt.service.ts` - 扩展页面模板和布局
  - `src/modules/pdf-merge/` - 新增 PDF 生成服务
  - `src/modules/workflow-steps/steps/pages.step.ts` - 集成新功能
- **Breaking changes**: 无，向后兼容现有 API
