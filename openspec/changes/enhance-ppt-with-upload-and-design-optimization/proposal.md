# Change: 增强 PPT 生成功能 - 支持上传和设计优化

## Why
当前 PPT 生成功能虽然能创建 HTML 格式的幻灯片，但存在两个关键问题：1) 生成的 PPT 没有上传到云存储，用户无法直接访问；2) PPT 设计较为单调，缺乏像用户示例中的现代视觉冲击力。用户期望获得既可访问又具有专业设计感的 PPT 幻灯片。

## What Changes
- **新增主题设计步骤**: 在 PPT 生成前增加 THEME-DESIGN 步骤，让用户选择和确认设计风格
- **PPT 上传功能**: 将生成的 PPT HTML 文件上传到 Bunny 云存储，提供可访问的 URL
- **设计 Prompt 优化**: 增强 AI 生成 PPT 的 Prompt，参考用户提供的现代设计示例
- **视觉增强**: 集成玻璃拟态、渐变效果、动态光晕等现代设计元素
- **模板库扩展**: 新增多种专业设计模板，支持更丰富的视觉风格
- **响应式布局**: 确保 PPT 在不同设备上都有良好的显示效果

## Impact
- Affected specs: ppt-generation, workflow-steps, theme-design, artifacts
- Affected code: 
  - src/modules/ppt/ppt.service.ts (增加上传功能)
  - src/modules/workflow-steps/steps/pages.step.ts (更新为支持 PPT 上传)
  - src/modules/workflow-steps/steps/theme-design.step.ts (新增主题设计步骤)
  - src/temporal/activities/video-generation.activities.ts (更新 Prompt)
  - 新增 PPT 设计模板和样式库
  - 工作流程更新：PLAN → THEME-DESIGN → OUTLINE → STORYBOARD → NARRATION → PAGES → TTS → RENDER → MERGE → DONE
