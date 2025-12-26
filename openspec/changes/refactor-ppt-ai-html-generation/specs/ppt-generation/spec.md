## ADDED Requirements

### Requirement: AI 驱动的 HTML 生成

系统 SHALL 使用 LLM 为每个 PPT 页面生成完整的 HTML 文档，包含内联 CSS 和 JavaScript。

#### Scenario: 基于分镜脚本生成单页 HTML

- **WHEN** 系统接收到单个分镜页面的内容、主题配置和大纲上下文
- **THEN** 系统调用 LLM 生成完整的 HTML 文档
- **AND** 生成的 HTML 包含 DOCTYPE 声明、head 和 body 标签
- **AND** HTML 中引用 Tailwind CSS CDN 和 Font Awesome CDN
- **AND** HTML 包含内联 style 标签定义自定义样式
- **AND** HTML 页面比例为 16:9（1920x1080px）

#### Scenario: 应用用户自定义主题

- **WHEN** 用户提供自定义主题配置（颜色、字体、设计风格）
- **THEN** 系统将主题配置传递给 LLM Prompt
- **AND** 生成的 HTML 应用用户指定的颜色方案
- **AND** 生成的 HTML 使用用户指定的字体
- **AND** 生成的 HTML 符合用户选择的设计风格

#### Scenario: 并行生成多页 PPT

- **WHEN** 系统需要生成包含多个页面的 PPT
- **THEN** 系统并行调用 LLM 生成各页 HTML（默认并发数为 3）
- **AND** 系统提供实时进度反馈
- **AND** 所有页面生成完成后返回完整结果

### Requirement: HTML 质量验证

系统 SHALL 验证 AI 生成的 HTML 的完整性和有效性。

#### Scenario: 验证 HTML 文档结构

- **WHEN** AI 生成 HTML 后
- **THEN** 系统检查 HTML 包含 DOCTYPE 声明
- **AND** 系统检查 HTML 包含完整的 html、head、body 标签
- **AND** 系统检查所有标签正确闭合
- **AND** 如果验证失败，系统标记该页面为无效状态

#### Scenario: 验证必需的外部资源

- **WHEN** 验证 HTML 文档
- **THEN** 系统检查 HTML 包含 Tailwind CSS CDN 引用
- **AND** 系统检查 HTML 包含 Font Awesome CDN 引用
- **AND** 如果缺少必需资源，系统标记为错误

#### Scenario: CSS 语法验证（可选）

- **WHEN** 启用 CSS 验证选项
- **THEN** 系统解析 style 标签中的 CSS
- **AND** 系统检查 CSS 语法错误
- **AND** 如果发现严重错误，系统标记为警告

### Requirement: 单页重试机制

系统 SHALL 支持对生成失败或质量不佳的单页进行重新生成。

#### Scenario: 自动重试失败页面

- **WHEN** 某页 HTML 生成失败（网络错误、超时等）
- **THEN** 系统自动重试该页面生成（最多重试 2 次）
- **AND** 每次重试之间有适当的延迟
- **AND** 如果所有重试均失败，系统返回失败状态和错误信息

#### Scenario: 自动重试验证失败页面

- **WHEN** 某页 HTML 验证失败
- **THEN** 系统自动重试该页面生成（最多重试 2 次）
- **AND** 如果重试后仍然验证失败，系统返回无效状态和验证问题列表

#### Scenario: 手动重试单个页面

- **WHEN** 用户请求重新生成特定页面
- **THEN** 系统仅重新生成该页面的 HTML
- **AND** 系统保留其他页面的生成结果
- **AND** 系统返回更新后的完整 PPT 结果

### Requirement: 生成结果缓存

系统 SHALL 基于内容哈希缓存 AI 生成的 HTML，以减少重复调用和成本。

#### Scenario: 缓存命中

- **WHEN** 生成某页 HTML 前
- **THEN** 系统计算该页内容和主题配置的哈希值
- **AND** 系统查询缓存中是否存在该哈希对应的 HTML
- **AND** 如果缓存命中，系统直接返回缓存的 HTML
- **AND** 系统记录缓存命中日志

#### Scenario: 缓存未命中

- **WHEN** 缓存中不存在对应的 HTML
- **THEN** 系统调用 AI 生成新的 HTML
- **AND** 系统将生成的 HTML 写入缓存（TTL 为 7 天）
- **AND** 系统返回新生成的 HTML

#### Scenario: 禁用缓存

- **WHEN** 用户在生成选项中禁用缓存
- **THEN** 系统跳过缓存查询
- **AND** 系统直接调用 AI 生成 HTML
- **AND** 系统不将结果写入缓存

### Requirement: 兼容现有 PPT 流程

系统 SHALL 保持与现有 PPT 上传和 PDF 生成流程的兼容性。

#### Scenario: 生成后上传到云存储

- **WHEN** AI 生成完整的 PPT HTML
- **THEN** 系统将 HTML 文件上传到 Bunny 云存储
- **AND** 系统返回可访问的 PPT URL
- **AND** 系统记录上传状态和文件大小

#### Scenario: 生成 PDF

- **WHEN** 用户启用 PDF 生成选项
- **THEN** 系统基于生成的 HTML 创建 PDF
- **AND** 系统将 PDF 上传到云存储
- **AND** 系统返回 PDF URL 和元数据

#### Scenario: 保持 API 接口兼容

- **WHEN** 外部代码调用 PptService.generatePpt 方法
- **THEN** 方法签名保持不变
- **AND** 返回的 PptGenerationResult 接口保持不变
- **AND** 现有的调用代码无需修改

### Requirement: 性能和成本优化

系统 SHALL 优化 AI 生成的性能和成本。

#### Scenario: 并发控制

- **WHEN** 生成多页 PPT
- **THEN** 系统限制并发 AI 调用数量（默认 3 个）
- **AND** 系统可通过配置调整并发数
- **AND** 系统避免过载 LLM API

#### Scenario: 超时控制

- **WHEN** 调用 AI 生成 HTML
- **THEN** 系统设置合理的超时时间（默认 30 秒）
- **AND** 如果超时，系统取消请求并触发重试
- **AND** 系统记录超时事件

#### Scenario: Token 使用优化

- **WHEN** 构建 LLM Prompt
- **THEN** 系统精简 Prompt 内容以减少 token 使用
- **AND** 系统避免重复信息
- **AND** 系统监控每次调用的 token 消耗

### Requirement: 监控和日志

系统 SHALL 记录 AI 生成过程的关键指标和日志。

#### Scenario: 记录生成指标

- **WHEN** 完成 PPT 生成
- **THEN** 系统记录总生成时间
- **AND** 系统记录每页生成时间
- **AND** 系统记录 AI 调用次数
- **AND** 系统记录缓存命中率
- **AND** 系统记录失败和重试次数

#### Scenario: 记录错误日志

- **WHEN** 生成过程中发生错误
- **THEN** 系统记录详细的错误信息
- **AND** 系统记录失败的页面内容
- **AND** 系统记录 AI 返回的原始响应（如有）
- **AND** 系统记录错误堆栈

#### Scenario: 质量监控

- **WHEN** 生成完成
- **THEN** 系统记录验证失败的页面数量
- **AND** 系统记录验证问题类型分布
- **AND** 系统提供质量报告供后续优化
