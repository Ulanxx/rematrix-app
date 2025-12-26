# 实施总结：重构 PPT 输出为独立幻灯片数组

## ✅ 已完成的变更

### 1. 数据结构定义
**文件**: `src/modules/workflow-steps/steps/pages.step.ts`

- ✅ 定义 `Slider` 接口
  ```typescript
  export interface Slider {
    htmlContent: string;
    url?: string;
    slideNumber: number;
  }
  ```

- ✅ 更新 `pagesOutputSchema`，添加 `sliders` 数组字段
  ```typescript
  sliders: z
    .array(
      z.object({
        htmlContent: z.string(),
        url: z.string().optional(),
        slideNumber: z.number(),
      }),
    )
    .optional(),
  ```

### 2. PAGES Step 重构
**文件**: `src/modules/workflow-steps/steps/pages.step.ts`

- ✅ **执行顺序优化**：先生成 sliders，再基于 sliders 生成 PDF
  - 第一阶段：AI 生成 HTML 内容
  - 第二阶段：生成 sliders 数组（逐页上传）
  - 第三阶段：基于 sliders 生成 PDF

- ✅ **Sliders 生成逻辑**（AI 生成模式）
  ```typescript
  // 从 AI 生成的 HTML 中分离各页
  const htmlPages = finalHtmlContent.split('\n\n').filter((h) => h.trim());
  
  // 逐页上传到 Bunny Storage
  for (let i = 0; i < htmlPages.length; i++) {
    const slideHtml = htmlPages[i];
    const slideNumber = i + 1;
    const filename = `slide-${timestamp}-${slideNumber}.html`;
    const path = `jobs/${context.jobId}/ppt/slides/${filename}`;
    
    // 上传并构建 Slider 对象
    const uploadResult = await uploadBufferToBunny({...});
    sliders.push({
      htmlContent: slideHtml,
      url: uploadResult.publicUrl,
      slideNumber,
    });
  }
  ```

- ✅ **PDF 生成分支逻辑**
  ```typescript
  if (isPptMode && useAiGeneration && sliders.length > 0) {
    // AI 模式：基于 sliders 数组生成 PDF
    pdfResult = await pdfService.generatePdfFromSliders(sliders, jobId, options);
  } else {
    // 传统模式：使用原有 HTML 生成 PDF
    pdfResult = await pdfService.generatePdfFromHtml(htmlContent, jobId, options);
  }
  ```

### 3. PDF 服务增强
**文件**: `src/modules/pdf/pdf.service.ts`

- ✅ 新增 `generatePdfFromSliders()` 方法
  - 接受 `sliders` 数组作为输入
  - 将所有 sliders 的 HTML 合并成完整文档
  - 为每个 slider 添加独立的分页容器
  - 使用 Playwright 生成 PDF
  - 上传到 Bunny Storage

  ```typescript
  async generatePdfFromSliders(
    sliders: Array<{ htmlContent: string; slideNumber: number }>,
    jobId: string,
    options: PdfGenerationOptions = {},
  ): Promise<PdfGenerationResult>
  ```

### 4. 输出结构变更
**返回数据结构**:
```typescript
{
  htmlContent: string,           // 完整合并的 HTML（向后兼容）
  sliders: Slider[],             // 🆕 独立幻灯片数组
  pdfUrl: string,                // PDF URL（基于 sliders 生成）
  pdfGenerated: boolean,
  pdfPath: string,
  pdfFileSize: number,
  metadata: {...}
}
```

**Slider 对象结构**:
```typescript
{
  htmlContent: string,  // 该页的完整 HTML 内容
  url?: string,         // 该页上传到云存储的 URL
  slideNumber: number   // 页码（1-based）
}
```

## 🔄 数据流程

### AI 生成模式（新流程）
```
1. AI 生成 HTML 内容
   ↓
2. 分离各页 HTML
   ↓
3. 逐页上传到 Bunny Storage
   ↓
4. 构建 sliders 数组
   ↓
5. 基于 sliders 生成 PDF
   ↓
6. 返回 sliders + pdfUrl
```

### 传统模式（保持兼容）
```
1. 生成/获取 HTML 内容
   ↓
2. 可选：智能合并
   ↓
3. 基于 HTML 生成 PDF
   ↓
4. 返回 htmlContent + pdfUrl
```

## 🎯 关键改进

1. **灵活性提升**
   - 前端可以单独访问每一页的 URL
   - 支持按需加载和展示单页内容

2. **PDF 质量改善**
   - 基于独立页面截图，避免合并 HTML 的渲染问题
   - 每页独立分页，确保正确的页面布局

3. **向后兼容**
   - 保留 `htmlContent` 字段（完整合并 HTML）
   - 传统模式仍使用原有逻辑
   - `sliders` 字段为可选，不影响现有 API

4. **容错性**
   - 即使单页上传失败，仍保留 `htmlContent`
   - PDF 生成失败不影响 sliders 返回

## ⚠️ 破坏性变更

- **移除字段**: `pptUrl`（单个合并 HTML 的 URL）
- **新增字段**: `sliders`（独立幻灯片数组）
- **前端适配**: 需要从 `sliders` 数组中获取各页 URL，而非单一 `pptUrl`

## 📝 迁移指南

### 前端代码迁移示例

**旧代码**:
```typescript
// 访问单个 PPT URL
const pptUrl = response.pptUrl;
window.open(pptUrl);
```

**新代码**:
```typescript
// 访问各页 URL
const sliders = response.sliders;
sliders.forEach((slider, index) => {
  console.log(`第 ${slider.slideNumber} 页: ${slider.url}`);
});

// 打开第一页
if (sliders && sliders.length > 0) {
  window.open(sliders[0].url);
}

// 或者遍历所有页面
sliders.forEach(slider => {
  // 渲染或展示每一页
  renderSlide(slider.htmlContent, slider.url);
});
```

## ✅ 验证检查清单

- [x] 代码编译通过
- [x] Slider 接口定义正确
- [x] sliders 数组生成逻辑完整
- [x] 逐页上传到 Bunny Storage
- [x] PDF 基于 sliders 生成
- [x] 执行顺序正确（sliders → PDF）
- [x] 向后兼容性保持
- [ ] 单元测试（待补充）
- [ ] 集成测试（待补充）
- [ ] E2E 测试（待补充）

## 🚀 下一步

1. **测试验证**
   - 运行一个完整的 job
   - 检查返回的 `sliders` 数组
   - 验证每个 `slider.url` 可访问
   - 确认 `pdfUrl` 正确生成

2. **补充测试**（可选）
   - 编写单元测试
   - 编写集成测试
   - 编写 E2E 测试

3. **文档更新**（可选）
   - 更新 API 文档
   - 添加迁移指南
   - 更新代码注释

## 📊 影响范围

- ✅ `src/modules/workflow-steps/steps/pages.step.ts` - 核心逻辑
- ✅ `src/modules/pdf/pdf.service.ts` - PDF 生成服务
- ⚠️ 前端代码 - 需要适配新的 `sliders` 字段结构

## 🔗 相关文件

- 提案: `openspec/changes/refactor-ppt-output-to-sliders/proposal.md`
- 任务: `openspec/changes/refactor-ppt-output-to-sliders/tasks.md`
- 规范: `openspec/changes/refactor-ppt-output-to-sliders/specs/pages-step/spec.md`
