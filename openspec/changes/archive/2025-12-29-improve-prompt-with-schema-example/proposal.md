# Change: Improve Prompt Strategy with Schema Examples

## Why
当前系统在prompt中只是简单地告诉AI"请严格输出JSON，结构必须符合本stage的schema"，但没有提供具体的示例，导致AI难以准确理解期望的输出格式，成功率较低。用户希望改为在prompt中提供schema的具体示例来提高AI生成准确率。

## What Changes
- 修改prompt构建逻辑，为每个stage的schema生成具体的JSON示例
- 在prompt中包含schema示例而不是仅描述schema
- 保持schema验证机制不变，确保输出格式正确性
- 更新promptops服务中的默认prompt模板

## Impact
- Affected specs: promptops
- Affected code: 
  - src/modules/workflow-steps/step-executor.service.ts (prompt构建逻辑)
  - src/modules/promptops/promptops.service.ts (默认prompt模板)
  - src/modules/workflow-steps/steps/*.step.ts (各步骤定义)
