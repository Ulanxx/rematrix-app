## Context
当前的视频生成流水线包含 9 个阶段（PLAN → OUTLINE → STORYBOARD → NARRATION → PAGES → TTS → RENDER → MERGE → DONE），每个阶段的配置分散在多个文件中：
- `promptops.service.ts`：包含默认的 prompt 和模型配置
- `video-generation.activities.ts`：包含具体的执行逻辑和 schema 定义
- `video-generation.workflow.ts`：定义阶段执行顺序
- 数据库 schema：定义阶段枚举和配置存储

这种分散的架构导致维护困难，添加新阶段需要修改多个文件。

## Goals / Non-Goals
- **Goals**:
  - 统一的 Step 定义接口，包含类型、Prompt 配置、模型、输入输出 schema
  - 模块化的 Step 配置，每个阶段独立封装
  - 简化 Step 执行逻辑，减少代码重复
  - 类型安全的配置验证
  - 向后兼容现有数据库 schema

- **Non-Goals**:
  - 修改数据库 schema（保持现有 PromptStageConfig 表结构）
  - 改变工作流执行顺序（保持现有 workflow 逻辑）
  - 修改 Temporal 集成方式

## Decisions

### 1. Step 定义接口设计
```typescript
interface StepDefinition {
  stage: JobStage;
  type: 'AI_GENERATION' | 'PROCESSING' | 'MERGE';
  config: {
    model: string;
    temperature?: number;
    prompt: string;
    tools?: Record<string, unknown>;
    schema?: z.ZodType<any>;
    meta?: Record<string, unknown>;
  };
  input: {
    sources: JobStage[];
    schema: z.ZodType<any>;
  };
  output: {
    type: ArtifactType;
    schema: z.ZodType<any>;
  };
  execution: {
    requiresApproval: boolean;
    retryPolicy?: RetryPolicy;
  };
}
```

### 2. Step 模块结构
```
src/modules/workflow-steps/
├── step-definition.interface.ts
├── step-registry.service.ts
├── steps/
│   ├── plan.step.ts
│   ├── outline.step.ts
│   ├── storyboard.step.ts
│   ├── narration.step.ts
│   ├── pages.step.ts
│   ├── tts.step.ts
│   ├── render.step.ts
│   ├── merge.step.ts
│   └── done.step.ts
└── step-executor.service.ts
```

### 3. 执行引擎抽象
创建通用的 `StepExecutor` 来处理所有阶段的执行逻辑，包括：
- 获取配置（从 PromptOps 服务）
- 准备输入数据
- 调用 AI 模型或处理逻辑
- 验证输出
- 保存 Artifact

### 4. 配置验证
使用 Zod 进行运行时配置验证，确保每个 Step 的配置完整性。

## Risks / Trade-offs
- **Risk**: 重构过程中可能影响现有功能
  - **Mitigation**: 保持向后兼容，分阶段迁移
- **Trade-off**: 增加了抽象层，可能带来轻微性能开销
  - **Justification**: 提高代码可维护性和扩展性，收益大于开销
- **Risk**: 新架构的学习成本
  - **Mitigation**: 提供清晰的文档和类型定义

## Migration Plan
1. **Phase 1**: 创建新的 Step 模块和接口定义
2. **Phase 2**: 实现各个 Step 的定义模块
3. **Phase 3**: 创建 StepExecutor 和 StepRegistry
4. **Phase 4**: 重构 video-generation.activities.ts 使用新架构
5. **Phase 5**: 更新 PromptOps 服务以支持新的验证
6. **Phase 6**: 测试和验证

每个阶段都保持现有功能不变，确保可以逐步回滚。

## Open Questions
- 是否需要支持动态 Step 注册（运行时添加新阶段）？
- 如何处理 Step 之间的依赖关系验证？
- 是否需要 Step 版本管理机制？
