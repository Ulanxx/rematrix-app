## Context
当前 PAGES 步骤只生成页面结构数据，但没有实际生成 PDF 文档。用户期望在 PAGES 步骤完成后能够获得可下载的 PDF 文件作为最终输出。工作流直接从 PAGES 跳转到 DONE，缺少 PDF 生成环节。

## Goals / Non-Goals
- **Goals**: 
  - 在 PAGES 步骤中实现 PDF 生成功能
  - 确保 PDF 生成成功后才标记工作流完成
  - 提供可下载的 PDF 文件链接
  - 保持现有页面结构数据生成功能不变
- **Non-Goals**: 
  - 重新设计整个工作流架构
  - 修改其他步骤的功能
  - 添加复杂的 PDF 编辑功能

## Decisions
- **Decision**: 使用 Puppeteer 生成 PDF
  - **Reason**: Puppeteer 是成熟的 HTML 到 PDF 转换库，支持复杂的样式和布局
  - **Alternatives considered**: 
    - jsPDF（功能有限，不支持复杂样式）
    - PDFKit（需要手动绘制，复杂度高）
    - 在线 PDF 服务（增加外部依赖）

- **Decision**: 在 PAGES 步骤内部集成 PDF 生成
  - **Reason**: 保持工作流简洁，PDF 是 PAGES 步骤的自然延伸
  - **Alternatives considered**: 
    - 创建单独的 PDF 步骤（增加工作流复杂度）
    - 在前端生成 PDF（服务器控制力不足）

## Risks / Trade-offs
- **Performance Risk**: PDF 生成可能消耗较多资源和时间
  - **Mitigation**: 设置合理超时时间，添加重试机制
- **Storage Risk**: PDF 文件需要存储空间
  - **Mitigation**: 使用对象存储服务，定期清理旧文件
- **Quality Risk**: 自动生成的 PDF 可能存在格式问题
  - **Mitigation**: 使用标准 HTML 模板，充分测试

## Migration Plan
1. **Phase 1**: 添加 PDF 生成依赖和基础服务
2. **Phase 2**: 修改 PAGES 步骤集成 PDF 生成
3. **Phase 3**: 更新工作流和错误处理
4. **Phase 4**: 测试和部署

## Open Questions
- PDF 文件存储位置和过期策略？
- PDF 生成失败时的重试次数？
- 是否需要提供 PDF 样式自定义选项？
