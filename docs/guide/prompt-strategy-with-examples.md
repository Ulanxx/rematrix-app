# Prompt策略：使用Schema示例提高AI生成准确率

## 概述

本系统采用了一种创新的prompt策略，通过在prompt中包含具体的JSON示例而不是抽象的schema描述，来提高AI模型生成JSON格式的准确率。

## 问题背景

传统的prompt策略通常使用"请严格输出JSON，结构必须符合本stage的schema"这样的抽象描述。这种方法存在以下问题：

- AI模型难以准确理解期望的输出格式
- 抽象的schema描述缺乏具体的示例参考
- 生成成功率较低，特别是在复杂的schema结构中

## 解决方案

### 核心思想

在prompt中提供具体的JSON示例，让AI模型能够：
1. 直观地理解期望的输出格式
2. 参考示例的结构和数据类型
3. 在遵循格式的基础上进行内容生成

### 实现架构

```
Schema示例生成器
    ↓
Step执行器 (prompt构建)
    ↓
Prompt模板 (包含示例)
    ↓
AI模型 (参考示例生成)
    ↓
Schema验证 (确保格式正确)
```

## 技术实现

### 1. Schema示例生成器

位置：`src/modules/workflow-steps/utils/schema-example-generator.ts`

功能：
- 为每个工作流阶段生成符合schema的示例数据
- 支持Zod schema的各种类型（对象、数组、字符串、数字等）
- 自动处理约束条件（最小值、最大值等）

```typescript
// 示例：为PLAN阶段生成示例
export function generateExampleForStage(stage: JobStage): any {
  switch (stage) {
    case JobStage.PLAN:
      return {
        estimatedPages: 8,
        estimatedDurationSec: 120,
        style: '现代简约风格',
        questions: ['需要添加更多实例吗？', '是否包含互动环节？']
      };
    // ... 其他阶段
  }
}
```

### 2. Prompt构建逻辑

位置：`src/modules/workflow-steps/step-executor.service.ts`

在`buildPromptWithContext`方法中添加schema示例：

```typescript
// 添加schema示例到prompt末尾
const example = generateFormattedExample(stage);
prompt += `\n\n# 输出格式示例\n请参考以下示例格式生成JSON输出：\n\`\`\`json\n${example}\n\`\`\``;
```

### 3. Prompt模板更新

位置：`src/modules/promptops/promptops.service.ts`

将原有的"严格输出JSON"改为"参考示例格式"：

```typescript
output: '请参考以下示例格式生成JSON输出，结构必须符合本 stage 的 schema（由系统注入）。'
```

## 各阶段示例

### PLAN阶段
```json
{
  "estimatedPages": 8,
  "estimatedDurationSec": 120,
  "style": "现代简约风格",
  "questions": ["需要添加更多实例吗？", "是否包含互动环节？"]
}
```

### OUTLINE阶段
```json
{
  "title": "示例课程大纲",
  "sections": [
    {
      "title": "第一部分：基础知识",
      "bullets": ["概念介绍", "基本原理", "应用场景"]
    }
  ]
}
```

### STORYBOARD阶段
```json
{
  "storyboard": [
    {
      "slideNumber": 1,
      "title": "课程介绍",
      "content": "欢迎来到本课程",
      "visualNotes": "展示课程标题和讲师信息",
      "narrationHint": "友好地介绍课程内容"
    }
  ]
}
```

### PAGES阶段
```json
{
  "theme": {
    "primary": "#3B82F6",
    "background": "#FFFFFF",
    "text": "#1F2937"
  },
  "slides": [
    {
      "title": "课程介绍",
      "bullets": ["欢迎来到本课程", "课程目标", "学习路径"],
      "design": "简洁现代风格"
    }
  ],
  "pdfUrl": "https://example.com/course.pdf",
  "pdfGenerated": false
}
```

## 优势

1. **提高准确率**：具体的示例比抽象描述更容易被AI模型理解
2. **保持验证**：原有的schema验证机制保持不变，确保输出格式正确
3. **易于维护**：示例生成器自动处理schema变更
4. **向后兼容**：不影响现有的工作流和配置

## 测试验证

### 单元测试
```bash
npm test -- src/modules/workflow-steps/utils/__tests__/schema-example-generator.spec.ts
```

### 集成测试
```bash
# 创建测试job
curl -X POST http://localhost:3000/jobs \
  -H "Content-Type: application/json" \
  -d '{"content": "测试内容", "style": "现代简约风格", "language": "zh-CN"}'

# 验证prompt配置
curl -X GET http://localhost:3000/admin/promptops/validate-all
```

## 配置说明

新的prompt策略会自动应用到所有工作流阶段，无需额外配置。如果需要自定义示例，可以修改`generateExampleForStage`函数中的示例数据。

## 注意事项

1. 示例数据应该符合实际的业务场景
2. 保持示例的简洁性和可读性
3. 定期更新示例以反映业务需求的变化
4. 监控AI生成准确率的改善情况

## 未来改进

1. 支持动态示例生成（基于输入内容）
2. 为不同AI模型提供定制化示例
3. 添加示例质量评估机制
4. 支持示例的A/B测试
