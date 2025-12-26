# Change: 重构页面设计为创意驱动的自由生成模式

## Why

当前的页面生成流程存在严重的创意限制问题：

1. **模板化严重**：页面设计基于固定的布局模板（title、content、two-column 等），导致所有页面千篇一律
2. **内容单调**：每页只有标题和几个文本要点，缺乏视觉多样性和创意表达
3. **设计受限**：AI 被限制在预定义的设计元素和布局中，无法发挥创意潜能
4. **流程割裂**：先生成分镜脚本，再根据分镜生成页面，导致页面设计无法充分理解完整的内容上下文

理想的页面设计应该是：
- **天马行空**：AI 可以根据内容自由设计页面，不受任何模板限制
- **内容驱动**：基于完整的脚本和口播稿理解内容，而不是简单的要点列表
- **视觉丰富**：可以使用各种视觉元素、布局方式、设计风格来表达内容
- **创意自由**：给 AI 最大的设计自由度，让每一页都独一无二

## What Changes

### 核心变更

1. **新增脚本生成阶段（SCRIPT）**
   - 在 STORYBOARD 之后、PAGES 之前新增 SCRIPT 阶段
   - 为整个视频生成完整的脚本和每页的详细口播稿
   - 提供完整的内容上下文，而不仅仅是要点

2. **重构页面生成流程（PAGES）**
   - 移除所有布局模板限制（title、content、two-column 等）
   - AI 基于完整脚本和口播稿自由设计每一页
   - 不再限制页面元素类型和数量
   - 给予 AI 完全的设计自由度

3. **增强 AI Prompt**
   - 强调创意和独特性
   - 移除所有设计限制和模板引用
   - 鼓励 AI 根据内容特点设计独特的视觉风格

### 新的工作流程

```
OUTLINE → STORYBOARD → SCRIPT → PAGES → TTS → RENDER → MERGE → DONE
                          ↑新增
```

**SCRIPT 阶段**：
- 输入：STORYBOARD（分镜脚本）、OUTLINE（大纲）
- 输出：完整视频脚本 + 每页详细口播稿
- 作用：为页面设计提供完整的内容理解基础

**PAGES 阶段（重构后）**：
- 输入：SCRIPT（完整脚本和口播稿）、THEME_DESIGN（主题设计）
- 输出：自由设计的页面数据
- 特点：无模板限制，完全创意驱动

## Impact

### 受影响的能力规范
- **video-page-generation**（新增）：定义自由页面生成能力
- **video-script-generation**（新增）：定义脚本生成能力

### 受影响的代码
- `src/modules/workflow-steps/steps/pages.step.ts`：重构页面生成逻辑
- `src/modules/workflow-steps/steps/script.step.ts`：新增脚本生成步骤
- `src/modules/workflow-steps/index.ts`：注册新步骤
- `src/modules/ppt/ppt.service.ts`：移除布局模板限制
- `@prisma/client` JobStage 枚举：新增 SCRIPT 阶段

### 破坏性变更
- **BREAKING**：JobStage 枚举新增 SCRIPT，需要数据库迁移
- **BREAKING**：PAGES 阶段的输入和输出 Schema 发生变化
- **BREAKING**：现有的页面生成逻辑将被完全重构

### 兼容性考虑
- 现有的 Job 需要重新执行或迁移
- 前端需要适配新的工作流阶段显示
- 测试用例需要更新以适应新的数据结构
