## 1. 创建 AI HTML 生成服务 ✅

- [x] 1.1 创建 `src/modules/ppt/ai-html-generator.service.ts`
- [x] 1.2 定义 `AiGenerationOptions` 和 `GenerationContext` 接口
- [x] 1.3 实现 `generateSlideHtml` 方法（单页生成）
- [x] 1.4 设计和实现 LLM Prompt 模板
- [x] 1.5 集成 Vercel AI SDK 调用 OpenRouter
- [x] 1.6 实现 Prompt 参数注入（分镜内容、主题、大纲）
- [x] 1.7 处理 LLM 响应并提取 HTML
- [x] 1.8 添加超时控制（30 秒）
- [x] 1.9 添加错误处理和日志记录

## 2. 创建 HTML 验证服务 ✅

- [x] 2.1 创建 `src/modules/ppt/html-validator.service.ts`
- [x] 2.2 定义 `ValidationResult` 和 `ValidationIssue` 接口
- [x] 2.3 实现文档结构验证（DOCTYPE、html、head、body）
- [x] 2.4 实现必需资源验证（Tailwind CDN、Font Awesome CDN）
- [x] 2.5 实现基本语法验证（标签闭合、属性格式）
- [x] 2.6 集成 HTML 解析库（如 parse5 或 cheerio）
- [x] 2.7 实现可选的 CSS 语法验证
- [x] 2.8 添加验证问题分类和严重级别
- [ ] 2.9 编写单元测试（覆盖各种验证场景）

## 3. 实现并行生成和重试机制 ✅

- [x] 3.1 在 `AiHtmlGeneratorService` 中实现 `generateAllSlides` 方法
- [x] 3.2 集成 `p-map` 库实现并发控制
- [x] 3.3 实现 `generateSlideWithRetry` 方法（最多重试 2 次）
- [x] 3.4 实现重试延迟策略（指数退避）
- [ ] 3.5 实现生成进度跟踪和回调
- [x] 3.6 处理部分失败场景（部分页面成功，部分失败）
- [x] 3.7 实现单页重新生成接口
- [x] 3.8 添加并发数和重试次数配置选项
- [ ] 3.9 编写集成测试（测试并行和重试逻辑）

## 4. 实现缓存机制 ✅

- [x] 4.1 创建 `src/modules/ppt/ppt-cache.service.ts`
- [x] 4.2 实现内容哈希计算（基于分镜内容 + 主题配置）
- [x] 4.3 集成 Redis 缓存服务（使用内存缓存作为 MVP）
- [x] 4.4 实现缓存键生成逻辑（`ppt:slide:{contentHash}:{themeHash}`）
- [x] 4.5 实现缓存读取方法
- [x] 4.6 实现缓存写入方法（TTL: 7 天）
- [x] 4.7 实现缓存禁用选项
- [x] 4.8 添加缓存命中率统计
- [ ] 4.9 编写缓存相关单元测试

## 5. 重构 PptService (MVP 完成) ✅

- [x] 5.1 在 `PptService` 中注入 `AiHtmlGeneratorService`
- [x] 5.2 在 `PptService` 中注入 `HtmlValidatorService`（通过 AiHtmlGenerator）
- [x] 5.3 在 `PptService` 中注入 `PptCacheService`
- [x] 5.4 创建 `generatePptWithAi` 方法（MVP 版本）
- [ ] 5.5 移除旧的模板生成方法（`generateSlideHtml`、`generateElementHtml` 等）
- [ ] 5.6 保留 `generatePpt` 方法签名和返回类型
- [ ] 5.7 实现从分镜脚本到 AI 生成的数据转换
- [x] 5.8 集成 HTML 验证和重试逻辑
- [x] 5.9 保持与云存储上传的兼容性
- [ ] 5.10 保持与 PDF 生成的兼容性
- [ ] 5.11 更新 `PptGenerationResult` 元数据（添加 AI 生成相关信息）

## 6. 更新类型定义

- [ ] 6.1 在 `ppt.types.ts` 中添加 `AiGenerationOptions` 接口
- [ ] 6.2 在 `ppt.types.ts` 中添加 `GenerationContext` 接口
- [ ] 6.3 在 `ppt.types.ts` 中添加 `GeneratedSlide` 接口
- [ ] 6.4 在 `ppt.types.ts` 中添加 `ValidationResult` 接口
- [ ] 6.5 在 `ppt.types.ts` 中添加 `ValidationIssue` 接口
- [ ] 6.6 在 `ppt.types.ts` 中添加 `ThemeConfig` 接口
- [ ] 6.7 扩展 `PptGenerationOptions` 接口（添加缓存、并发、重试选项）
- [ ] 6.8 扩展 `PptGenerationResult.metadata`（添加 AI 生成指标）

## 7. 更新 PAGES 步骤

- [ ] 7.1 在 `pages.step.ts` 中更新 `PptService.generatePpt` 调用
- [ ] 7.2 传递分镜脚本数据到 PPT 生成
- [ ] 7.3 传递主题配置和大纲上下文
- [ ] 7.4 处理生成进度反馈（可选）
- [ ] 7.5 处理部分失败场景
- [ ] 7.6 更新 artifact 存储逻辑
- [ ] 7.7 确保与现有流程的兼容性

## 8. 实现监控和日志

- [ ] 8.1 在 `AiHtmlGeneratorService` 中添加详细日志
- [ ] 8.2 记录每次 AI 调用的耗时和 token 使用
- [ ] 8.3 记录缓存命中和未命中事件
- [ ] 8.4 记录验证失败和重试事件
- [ ] 8.5 实现生成指标收集（总时间、成功率、缓存命中率）
- [ ] 8.6 实现错误日志记录（包含上下文信息）
- [ ] 8.7 添加 Prometheus 指标（可选）
- [ ] 8.8 创建监控仪表板配置（可选）

## 9. 编写测试

- [ ] 9.1 为 `AiHtmlGeneratorService` 编写单元测试
  - [ ] 9.1.1 测试 Prompt 构建逻辑
  - [ ] 9.1.2 测试 AI 调用和响应解析
  - [ ] 9.1.3 测试错误处理
  - [ ] 9.1.4 测试超时控制
- [ ] 9.2 为 `HtmlValidatorService` 编写单元测试
  - [ ] 9.2.1 测试各种验证场景（成功、失败）
  - [ ] 9.2.2 测试边界情况（空 HTML、格式错误）
- [ ] 9.3 为 `PptCacheService` 编写单元测试
  - [ ] 9.3.1 测试缓存读写
  - [ ] 9.3.2 测试哈希计算
  - [ ] 9.3.3 测试 TTL 和过期
- [ ] 9.4 为 `PptService` 编写集成测试
  - [ ] 9.4.1 测试完整的 PPT 生成流程
  - [ ] 9.4.2 测试并行生成
  - [ ] 9.4.3 测试重试机制
  - [ ] 9.4.4 测试缓存集成
  - [ ] 9.4.5 测试主题自定义
- [ ] 9.5 为 PAGES 步骤编写 E2E 测试
  - [ ] 9.5.1 测试从分镜到 PPT 的完整流程
  - [ ] 9.5.2 测试 PPT 上传
  - [ ] 9.5.3 测试 PDF 生成

## 10. 性能测试和优化

- [ ] 10.1 测试单页生成性能（目标 < 5 秒）
- [ ] 10.2 测试 10 页 PPT 生成性能（目标 < 20 秒）
- [ ] 10.3 测试并发性能（不同并发数）
- [ ] 10.4 测试缓存性能（命中率、延迟）
- [ ] 10.5 优化 Prompt 以减少 token 使用
- [ ] 10.6 优化并发数配置
- [ ] 10.7 优化缓存策略（TTL、键设计）
- [ ] 10.8 负载测试（模拟多用户并发生成）

## 11. 文档和示例

- [ ] 11.1 更新 `ppt.service.ts` 的 JSDoc 注释
- [ ] 11.2 编写 AI HTML 生成的技术文档
- [ ] 11.3 编写 Prompt 设计指南
- [ ] 11.4 创建生成示例和最佳实践
- [ ] 11.5 更新 API 文档（如有）
- [ ] 11.6 编写故障排查指南
- [ ] 11.7 创建性能调优指南

## 12. 部署和监控

- [ ] 12.1 配置 OpenRouter API 密钥
- [ ] 12.2 配置 Redis 缓存服务
- [ ] 12.3 设置环境变量（并发数、重试次数、缓存 TTL 等）
- [ ] 12.4 部署到测试环境
- [ ] 12.5 执行冒烟测试
- [ ] 12.6 灰度发布（10% 流量）
- [ ] 12.7 监控生成成功率和性能指标
- [ ] 12.8 收集用户反馈
- [ ] 12.9 根据监控数据调优配置
- [ ] 12.10 全量发布

## 13. 清理和优化

- [ ] 13.1 删除未使用的模板代码
- [ ] 13.2 删除未使用的类型定义
- [ ] 13.3 清理导入和依赖
- [ ] 13.4 代码格式化和 lint 检查
- [ ] 13.5 更新 CHANGELOG
- [ ] 13.6 创建 Git commit 和 PR
