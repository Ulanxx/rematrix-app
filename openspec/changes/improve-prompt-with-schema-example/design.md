## Context
当前系统在prompt中仅使用"请严格输出 JSON，结构必须符合本 stage 的 schema"这样的抽象描述，导致AI模型难以准确理解期望的输出格式，生成成功率较低。用户反馈需要提供具体的JSON示例来提高AI生成的准确率。

## Goals / Non-Goals
- Goals: 
  - 提高AI生成JSON格式的准确率
  - 保持现有的schema验证机制
  - 为每个工作流阶段提供具体的输出示例
- Non-Goals:
  - 改变schema验证逻辑
  - 修改AI模型或API调用方式
  - 改变工作流的整体结构

## Decisions
- Decision: 在prompt中包含具体的JSON示例而不是抽象的schema描述
- Reasoning: AI模型更容易理解和模仿具体的示例，而不是抽象的schema定义
- Alternatives considered:
  1. 继续使用抽象schema描述（成功率低）
  2. 在prompt中包含完整的schema定义（过于冗长）
  3. 提供简化的示例（当前选择，平衡了准确性和简洁性）

## Schema示例生成策略
- 为每个Zod schema生成符合类型约束的示例数据
- 示例数据应该包含典型的业务场景
- 保持示例的简洁性和可读性
- 确保示例符合所有验证规则

## 实现方案
1. 创建通用的schema示例生成工具
2. 为每个步骤定义示例模板
3. 在prompt构建时自动包含示例
4. 保持原有的schema验证机制

## Risks / Trade-offs
- Risk: 示例可能限制AI的创造性输出
- Mitigation: 提供多样化的示例，鼓励AI在遵循格式的基础上创新
- Trade-off: prompt长度增加，但准确性提升

## Migration Plan
1. 实现schema示例生成功能
2. 逐步更新各个步骤的prompt模板
3. 测试验证新策略的效果
4. 保留原有策略作为备选方案

## Open Questions
- 如何为复杂的schema生成合适的示例？
- 是否需要为不同的AI模型调整示例策略？
- 如何处理schema变更时的示例同步问题？
