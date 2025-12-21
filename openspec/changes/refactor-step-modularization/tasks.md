## 1. 创建 Step 模块基础架构
- [ ] 1.1 创建 `src/modules/workflow-steps/` 目录结构
- [ ] 1.2 定义 `StepDefinition` 接口和类型
- [ ] 1.3 创建 `StepRegistry` 服务用于注册和管理所有 Step
- [ ] 1.4 创建 `StepExecutor` 服务提供统一的执行逻辑

## 2. 实现各个 Step 定义模块
- [ ] 2.1 实现 `plan.step.ts` - PLAN 阶段定义
- [ ] 2.2 实现 `outline.step.ts` - OUTLINE 阶段定义  
- [ ] 2.3 实现 `storyboard.step.ts` - STORYBOARD 阶段定义
- [ ] 2.4 实现 `narration.step.ts` - NARRATION 阶段定义
- [ ] 2.5 实现 `pages.step.ts` - PAGES 阶段定义
- [ ] 2.6 实现 `tts.step.ts` - TTS 阶段定义
- [ ] 2.7 实现 `render.step.ts` - RENDER 阶段定义
- [ ] 2.8 实现 `merge.step.ts` - MERGE 阶段定义
- [ ] 2.9 实现 `done.step.ts` - DONE 阶段定义

## 3. 重构执行层
- [ ] 3.1 重构 `video-generation.activities.ts` 使用新的 Step 架构
- [ ] 3.2 简化各个 `run*Stage` 函数，委托给 StepExecutor
- [ ] 3.3 保持现有的 Artifact 创建和管理逻辑
- [ ] 3.4 保持现有的 Approval 逻辑

## 4. 更新 PromptOps 集成
- [ ] 4.1 修改 `PromptopsService` 支持新的 Step 验证
- [ ] 4.2 添加 Step 配置的完整性检查
- [ ] 4.3 保持现有数据库 schema 兼容性
- [ ] 4.4 更新默认配置生成逻辑

## 5. 添加验证和测试
- [ ] 5.1 为每个 Step 模块添加单元测试
- [ ] 5.2 为 StepExecutor 添加集成测试
- [ ] 5.3 为 StepRegistry 添加测试
- [ ] 5.4 添加端到端测试验证完整流程

## 6. 文档和清理
- [ ] 6.1 添加 Step 定义文档和使用示例
- [ ] 6.2 清理旧的重复代码
- [ ] 6.3 更新相关 API 文档
- [ ] 6.4 验证性能影响在可接受范围内
