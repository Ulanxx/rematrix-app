# 实施任务清单

## 1. 数据库迁移

- [x] 1.1 在 Prisma Schema 中添加 `SCRIPT` 到 `JobStage` 枚举
- [x] 1.2 生成数据库迁移文件
- [x] 1.3 执行数据库迁移
- [x] 1.4 验证迁移成功

## 2. 实现 SCRIPT 步骤

- [x] 2.1 创建 `src/modules/workflow-steps/steps/script.step.ts`
- [x] 2.2 定义 `scriptInputSchema` 和 `scriptOutputSchema`
- [x] 2.3 编写 AI Prompt，强调完整脚本和口播稿生成
- [x] 2.4 实现 `prepareScriptInput` 函数（从 STORYBOARD 和 OUTLINE 获取输入）
- [x] 2.5 实现 `customExecuteScriptStep` 函数（如需要）
- [x] 2.6 实现 `validate` 函数
- [x] 2.7 在 `src/modules/workflow-steps/index.ts` 中注册 SCRIPT 步骤
- [ ] 2.8 编写 SCRIPT 步骤的单元测试
- [ ] 2.9 编写 SCRIPT 步骤的集成测试

## 3. 重构 PAGES 步骤

- [x] 3.1 修改 `pagesInputSchema`，添加 SCRIPT 作为输入源
- [x] 3.2 移除 `pagesOutputSchema` 中的 `design.layout` 枚举限制
- [x] 3.3 更新 `design` 对象的 Schema，允许更自由的结构
- [x] 3.4 完全重写 AI Prompt，强调创意自由和内容驱动
- [x] 3.5 更新 `preparePagesInput` 函数，从 SCRIPT 获取完整口播稿
- [x] 3.6 更新 `customExecutePagesStep` 函数，适配新的输入结构
- [x] 3.7 移除所有布局模板相关的代码逻辑
- [ ] 3.8 更新 `validate` 函数，适配新的 Schema
- [ ] 3.9 更新 PAGES 步骤的单元测试
- [ ] 3.10 更新 PAGES 步骤的集成测试

## 4. 更新 PPT 服务

- [ ] 4.1 在 `src/modules/ppt/ppt.service.ts` 中移除布局模板逻辑
- [ ] 4.2 更新 `generatePptHtml` 函数，支持自由设计的页面结构
- [ ] 4.3 确保 PPT 生成逻辑可以处理任意的元素组合
- [ ] 4.4 更新 PPT 服务的测试用例

## 5. 更新工作流编排

- [ ] 5.1 在 `src/temporal/workflows/video-generation.workflow.ts` 中添加 SCRIPT 阶段
- [ ] 5.2 更新阶段依赖关系（STORYBOARD → SCRIPT → PAGES）
- [ ] 5.3 更新 `src/temporal/activities/video-generation.activities.ts` 支持 SCRIPT 阶段
- [ ] 5.4 更新工作流的测试用例

## 6. 更新 Step Registry

- [ ] 6.1 确保 `StepRegistryService` 正确注册 SCRIPT 步骤
- [ ] 6.2 验证步骤依赖关系正确配置
- [ ] 6.3 更新 Step Registry 的测试用例

## 7. 更新前端（如需要）

- [ ] 7.1 在前端工作流显示中添加 SCRIPT 阶段
- [ ] 7.2 更新阶段状态图标和描述
- [ ] 7.3 支持查看和编辑 SCRIPT artifact（可选）
- [ ] 7.4 更新前端的类型定义（JobStage 枚举）

## 8. 更新 API 和文档

- [ ] 8.1 更新 API 文档，说明新的 SCRIPT 阶段
- [ ] 8.2 更新 Job 相关的 DTO 和类型定义
- [ ] 8.3 更新 OpenAPI/Swagger 文档
- [ ] 8.4 编写用户文档，说明新的工作流程

## 9. 数据迁移和兼容性

- [ ] 9.1 编写数据迁移脚本，处理现有 Job 数据
- [ ] 9.2 实现版本检测逻辑，区分旧版和新版 Job
- [ ] 9.3 提供向后兼容的 fallback 逻辑（过渡期）
- [ ] 9.4 编写迁移文档和操作指南

## 10. 测试和验证

- [ ] 10.1 端到端测试完整工作流（PLAN → DONE）
- [ ] 10.2 验证 SCRIPT 阶段生成的脚本质量
- [ ] 10.3 验证 PAGES 阶段生成的页面设计质量和多样性
- [ ] 10.4 性能测试，评估 AI 调用成本和时间
- [ ] 10.5 回归测试，确保不影响其他功能
- [ ] 10.6 用户验收测试（UAT）

## 11. 监控和优化

- [ ] 11.1 添加 SCRIPT 和 PAGES 阶段的监控指标
- [ ] 11.2 监控 AI 生成质量和失败率
- [ ] 11.3 收集用户反馈
- [ ] 11.4 根据反馈优化 AI Prompt
- [ ] 11.5 调整 Schema 和验证规则（如需要）

## 12. 文档和培训

- [ ] 12.1 更新开发者文档
- [ ] 12.2 更新用户手册
- [ ] 12.3 创建示例和最佳实践指南
- [ ] 12.4 准备团队培训材料
- [ ] 12.5 进行内部培训和知识分享

## 依赖关系说明

- 任务 1 必须在所有其他任务之前完成（数据库迁移）
- 任务 2 和 3 可以并行进行
- 任务 4 依赖任务 3
- 任务 5 依赖任务 2 和 3
- 任务 6 依赖任务 2
- 任务 7-12 依赖任务 1-6 完成

## 预估工作量

- 数据库迁移：0.5 天
- SCRIPT 步骤实现：2 天
- PAGES 步骤重构：3 天
- PPT 服务更新：1 天
- 工作流编排更新：1 天
- 前端更新：1 天
- 测试和验证：2 天
- 文档和培训：1 天

**总计：约 11.5 天**

## 风险和注意事项

1. **数据库迁移风险**：确保有完整的备份和回滚计划
2. **AI 生成质量**：需要多次迭代优化 Prompt
3. **向后兼容性**：过渡期需要同时支持新旧两种模式
4. **性能影响**：新增 SCRIPT 阶段会增加整体处理时间
5. **用户体验**：需要充分测试和收集反馈
