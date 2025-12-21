# Prompt 配置统一修复文档

## 问题描述

之前项目中存在 Prompt 不一致的问题：
- **运行时显示**: "You are a helpful assistant. Generate a concise plan in JSON."
- **项目中的实际配置**: 包含详细的中文角色定义、上下文、指令等

## 根本原因

1. **重复配置源**: `video-generation.activities.ts` 中有硬编码的默认配置
2. **PromptOps 系统未被正确使用**: 运行时回退到简单配置
3. **缺乏自动初始化**: 新环境没有自动创建默认配置

## 修复方案

### 1. 统一 Prompt 源 ✅
- 移除 `video-generation.activities.ts` 中的硬编码配置
- 直接使用 `PromptopsService` 获取配置
- 自动调用 `bootstrap()` 初始化默认配置

### 2. 自动初始化服务 ✅
- 创建 `PromptopsInitService` 自动初始化所有阶段
- 应用启动时自动调用初始化
- 提供手动初始化 API 端点

### 3. 配置验证和错误处理 ✅
- 创建 `PromptopsValidationService` 验证配置质量
- 自动修复常见配置问题
- 提供配置质量评分

### 4. 管理端点扩展 ✅
- `/admin/promptops/initialize-all` - 手动初始化所有阶段
- `/admin/promptops/validate-all` - 验证所有配置
- `/admin/promptops/auto-fix-all` - 自动修复配置
- `/admin/promptops/quality-score/:stage` - 获取质量评分

## 使用方法

### 启动应用
```bash
npm run start:dev
```

应用启动时会自动：
1. 初始化所有 PromptOps 阶段配置
2. 验证配置有效性
3. 输出初始化结果到控制台

### 手动管理配置

#### 检查初始化状态
```bash
curl http://localhost:3000/admin/promptops/initialization-status
```

#### 手动初始化所有阶段
```bash
curl -X POST http://localhost:3000/admin/promptops/initialize-all
```

#### 验证所有配置
```bash
curl http://localhost:3000/admin/promptops/validate-all
```

#### 检查特定阶段配置
```bash
curl http://localhost:3000/admin/promptops/stages/PLAN/active
```

#### 获取配置质量评分
```bash
curl http://localhost:3000/admin/promptops/quality-score/PLAN
```

### 运行测试脚本
```bash
npx ts-node test-prompt-fix.ts
```

## 配置结构

### 默认 Prompt 配置
每个阶段现在使用统一的默认配置模板：

```typescript
// 示例：PLAN 阶段
{
  role: '你是一名资深视频策划与教学设计专家。',
  goal: '根据 <markdown> 生成一份可执行的 PLAN（计划），用于指导后续 OUTLINE/STORYBOARD/NARRATION/PAGES 的生成。',
  inputs: ['<markdown> 用户输入的 Markdown 原文'],
  output: '请严格输出 JSON，结构必须符合本 stage 的 schema（由系统注入，不要自行扩展字段）。'
}
```

### 配置验证规则
- **必要字段**: model, prompt 不能为空
- **温度范围**: 0-2 之间
- **Prompt 长度**: 建议 100-8000 字符
- **占位符格式**: 推荐使用 `<...>` 而非 `{{...}}`
- **必需占位符**: 每个阶段必须包含相应的输入占位符

## 故障排除

### 如果仍然看到简单 Prompt
1. 检查数据库连接是否正常
2. 手动调用初始化端点
3. 检查应用启动日志中的错误信息
4. 验证 PromptOps 表是否正确创建

### 常见错误
- **"no active config"**: 需要初始化配置
- **"bootstrap failed"**: 检查数据库权限
- **"validation failed"**: 检查配置格式

## API 端点列表

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/admin/promptops/stages` | 获取所有阶段列表 |
| GET | `/admin/promptops/stages/:stage/active` | 获取阶段活跃配置 |
| GET | `/admin/promptops/stages/:stage/configs` | 获取阶段所有配置 |
| POST | `/admin/promptops/stages/:stage/bootstrap` | 初始化单个阶段 |
| POST | `/admin/promptops/initialize-all` | 初始化所有阶段 |
| GET | `/admin/promptops/initialization-status` | 获取初始化状态 |
| GET | `/admin/promptops/validate-all` | 验证所有配置 |
| POST | `/admin/promptops/auto-fix-all` | 自动修复所有配置 |
| GET | `/admin/promptops/quality-score/:stage` | 获取质量评分 |

## 技术细节

### 文件修改列表
- `src/temporal/activities/video-generation.activities.ts` - 统一使用 PromptOps 服务
- `src/modules/promptops/promptops-init.service.ts` - 新增初始化服务
- `src/modules/promptops/promptops-validation.service.ts` - 新增验证服务
- `src/modules/promptops/promptops.module.ts` - 注册新服务
- `src/modules/promptops/promptops-admin.controller.ts` - 扩展管理端点
- `src/main.ts` - 添加启动时初始化

### 数据库表结构
- `prompt_stage_config` - 存储配置
- `prompt_stage_active` - 存储活跃配置引用

现在系统使用统一的 PromptOps 配置源，确保运行时和项目中的配置完全一致，并且支持动态配置管理。
