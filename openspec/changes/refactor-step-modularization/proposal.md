# Change: Refactor Step Modularization

## Why
当前服务端的 Step（阶段）配置混在一起，每个阶段的类型、Prompt 配置、使用的模型、输入、输出都分散在不同文件中，缺乏清晰的模块化结构。这导致：
- 难以理解和维护各个阶段的完整配置
- 添加新阶段或修改现有阶段时需要改动多个文件
- 缺乏统一的阶段定义和配置接口
- 代码重复，每个阶段的处理逻辑相似但分散

## What Changes
- **创建统一的 Step 定义接口**：每个 Step 包含类型、Prompt 配置、模型、输入输出 schema
- **模块化 Step 配置**：将每个阶段的配置封装到独立的模块中
- **重构 PromptOps 服务**：基于新的 Step 模块化架构
- **统一 Step 执行引擎**：抽象通用的 Step 执行逻辑
- **添加 Step 类型验证**：确保配置的完整性和正确性

## Impact
- **Affected specs**: workflow-steps
- **Affected code**: 
  - `src/modules/promptops/` (重构)
  - `src/temporal/activities/video-generation.activities.ts` (简化)
  - `src/temporal/workflows/` (保持不变)
  - 新增 `src/modules/workflow-steps/` 模块
