## 1. 数据结构定义
- [x] 1.1 定义 `Slider` 接口（包含 `htmlContent`, `url`, `slideNumber`）
- [x] 1.2 更新 `pages.step.ts` 输出 Schema，移除 `pptUrl`，添加 `sliders` 数组

## 2. PPT 服务层改造
- [x] 2.1 修改 `ppt.service.ts`，支持返回独立的 HTML 页面数组（而非合并后的单个 HTML）
- [x] 2.2 实现逐页上传到 Bunny Storage 的逻辑
- [x] 2.3 为每页生成独立的公开 URL

## 3. PAGES Step 输出调整
- [x] 3.1 在 AI 生成分支中，遍历 `aiResult.htmlPages`，为每页上传并构建 `Slider` 对象
- [ ] 3.2 在传统模板分支中，同样支持逐页上传（如果适用）
- [x] 3.3 移除 `pptUploadResult.pptUrl` 字段，改为返回 `sliders` 数组

## 4. PDF 生成逻辑重构
- [x] 4.1 修改 `pdf.service.ts`，接受 `sliders` 数组作为输入
- [x] 4.2 实现逐页截图逻辑（使用 Puppeteer 或类似工具）
- [x] 4.3 实现多页 PDF 拼接逻辑
- [x] 4.4 确保 PDF 生成结果与原有格式兼容

## 5. 测试与验证
- [ ] 5.1 编写单元测试：验证 `sliders` 数组生成正确
- [ ] 5.2 编写集成测试：验证逐页上传和 URL 生成
- [ ] 5.3 编写 E2E 测试：验证完整的 PAGES → PDF 流程
- [ ] 5.4 手动测试：确认前端可以正确访问每页 URL

## 6. 文档更新
- [ ] 6.1 更新 API 文档，说明新的 `sliders` 字段结构
- [ ] 6.2 添加迁移指南，说明如何从 `pptUrl` 迁移到 `sliders`
- [ ] 6.3 更新相关代码注释
