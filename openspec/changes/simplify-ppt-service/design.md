## Context
当前PPT服务包含大量复杂的功能，包括设计模板系统、布局生成、动画效果、上传功能等。但实际使用中，核心需求只是通过AI生成HTML幻灯片。参考AI HTML生成器的简洁设计，需要大幅简化PPT服务的结构。

## Goals / Non-Goals
- Goals: 
  - 简化PPT服务，只保留核心的AI生成功能
  - 移除不必要的设计模板和布局系统
  - 保持API兼容性，确保generatePptWithAi方法继续工作
- Non-Goals:
  - 保留复杂的设计模板系统
  - 维护多种布局生成逻辑
  - 保留上传和云存储功能

## Decisions
- Decision: 移除ModernDesignTemplate系统，专注AI生成
  - 理由: 设计模板增加了大量复杂性，而AI可以动态生成样式
- Decision: 保留generatePptWithAi作为主要接口
  - 理由: 这是核心功能，其他模块依赖此接口
- Decision: 移除上传相关功能
  - 理由: 上传应该是独立的服务，不与PPT生成耦合
- Decision: 简化类型定义
  - 理由: 减少类型复杂性，只保留必要的接口

## Risks / Trade-offs
- Risk: 破坏现有调用方代码
  - 缓解: 保持generatePptWithAi接口不变，只移除辅助方法
- Trade-off: 失去一些预设的设计模板
  - 收益: 大幅简化代码结构，提高维护性

## Migration Plan
1. 分析现有代码，识别核心方法
2. 逐步移除不需要的功能
3. 确保核心方法正常工作
4. 更新类型导出
5. 测试验证

## Open Questions
- 是否需要保留缓存服务？
- 是否有其他模块依赖被移除的方法？
