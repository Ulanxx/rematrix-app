## Context
在当前的课程创建流程中，用户需要手动审批每个阶段（PLAN、PAGES等），并在失败时手动重试。这对于批量处理或测试场景来说效率较低。用户希望能够选择自动模式，让整个流程无需人工干预自动完成。

## Goals / Non-Goals
- Goals: 
  - 提供自动模式开关，让用户选择是否自动审批和重试
  - 自动跳过所有需要人工审批的阶段
  - 失败时自动重试，直到成功或达到最大重试次数
  - 在UI中清晰显示当前Job的自动模式状态
- Non-Goals:
  - 不修改现有的手动审批流程
  - 不改变Job的基本数据结构（只添加autoMode字段）
  - 不影响现有的工作流步骤定义

## Decisions
- Decision: 在Job模型中添加`autoMode: Boolean`字段来标识自动模式
  - Rationale: 简单直接，便于查询和状态管理
  - Alternatives considered: 
    - 在config中添加autoMode - 增加了配置复杂度
    - 创建独立的AutoModeJob表 - 过度设计，增加查询复杂度

- Decision: 在工作流引擎中实现自动审批逻辑
  - Rationale: 工作流引擎已经负责审批流程，在此处添加自动逻辑最合适
  - Alternatives considered:
    - 在Temporal工作流中实现 - 增加了工作流复杂度
    - 创建独立的自动审批服务 - 增加了系统复杂度

- Decision: 最大重试次数设置为3次
  - Rationale: 平衡了自动重试的可靠性和资源消耗
  - Alternatives considered:
    - 无限重试 - 可能导致资源浪费
    - 可配置重试次数 - 增加了用户配置复杂度

## Risks / Trade-offs
- Risk: 自动模式可能导致资源消耗增加
  - Mitigation: 设置最大重试次数限制，添加监控和日志
- Risk: 自动审批可能产生质量不佳的内容
  - Mitigation: 用户可选择性开启，保留手动审批选项
- Trade-off: 自动模式vs质量控制
  - Decision: 提供选择权，让用户根据场景决定

## Migration Plan
1. 数据库迁移：添加autoMode字段，默认值为false
2. 后端API更新：支持autoMode参数传递和存储
3. 工作流引擎更新：添加自动审批和重试逻辑
4. 前端UI更新：添加开关组件和状态显示
5. 测试验证：确保新旧模式都正常工作
6. 文档更新：说明新的自动模式功能

## Open Questions
- 是否需要在Job列表中显示自动模式状态？
- 是否需要为自动模式Job添加特殊的标识或图标？
- 是否需要记录自动重试的次数和历史？
