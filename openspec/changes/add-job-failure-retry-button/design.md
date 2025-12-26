## Context
当前 Rematrix 系统中的 Job Process 页面在任务失败时缺乏重试机制。用户只能通过重新启动整个工作流来处理失败的任务，这降低了用户体验。系统已有完整的工作流引擎、WebSocket 实时通信和状态管理机制，需要在此基础上添加失败重试功能。

## Goals / Non-Goals
- **Goals**:
  - 为 FAILED 状态的任务提供一键重试功能
  - 支持重试失败阶段或整个任务
  - 提供实时的重试状态反馈
  - 保持与现有工作流引擎的兼容性
- **Non-Goals**:
  - 不修改现有的失败处理逻辑
  - 不改变 Job 状态转换的基本流程
  - 不添加复杂的重试策略配置

## Decisions
- **Decision**: 采用工作流指令模式实现重试功能
  - **Why**: 复用现有的工作流引擎架构，保持代码一致性
  - **Alternatives considered**: 
    - 直接调用 Temporal API - 会破坏架构抽象
    - 创建独立的重试服务 - 增加系统复杂度

- **Decision**: 在 Job Process 页面添加条件渲染的重试按钮
  - **Why**: 符合现有 UI 模式，用户体验直观
  - **Alternatives considered**:
    - 创建独立的错误处理页面 - 增加用户操作复杂度
    - 在操作面板中添加重试选项 - 空间有限，不够突出

- **Decision**: 扩展现有的工作流指令系统，添加 `retry` 指令
  - **Why**: 与现有的 `run`、`pause`、`resume` 指令保持一致
  - **Alternatives considered**:
    - 创建专门的重试 API - 功能重复，破坏统一性

## Risks / Trade-offs
- **Risk**: 重试可能导致无限循环失败
  - **Mitigation**: 添加重试次数限制和用户确认提示
- **Risk**: 重试过程中的状态同步复杂度
  - **Mitigation**: 复用现有的 WebSocket 状态更新机制
- **Trade-off**: 简单实现 vs. 复杂重试策略
  - **Decision**: 选择简单实现，后续可扩展

## Migration Plan
1. **Phase 1**: 实现基础重试功能
   - 添加 `retry` 工作流指令
   - 实现后端重试 API
   - 添加前端重试按钮

2. **Phase 2**: 增强用户体验
   - 添加重试状态指示
   - 实现重试历史记录
   - 添加重试确认对话框

3. **Phase 3**: 高级功能（可选）
   - 支持特定阶段重试
   - 添加重试策略配置
   - 实现智能重试建议

## Open Questions
- 是否需要限制重试次数？建议限制为 3 次
- 重试时是否需要清除之前的错误信息？建议保留作为历史记录
- 是否需要支持重试特定阶段？初期支持整个任务重试，后续扩展
