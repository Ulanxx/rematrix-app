## Context
当前 PPT 生成功能使用统一的页面布局，所有幻灯片采用相同的视觉样式和结构。用户反馈需要更丰富的页面多样性、完整的演示结构以及 PDF 导出功能。这涉及多个模块的协同改进，需要引入新的技术依赖和架构调整。

## Goals / Non-Goals
- **Goals**:
  - 实现多种页面布局模板（标题页、内容页、图片页、对比页等）
  - 自动生成完整的演示结构（首页、目录、内容、总结、结尾）
  - 集成 Playwright 实现 HTML 到 PDF 的转换
  - 支持卡片布局、图文混排等丰富内容形式
- **Non-Goals**:
  - 重新设计整个 PPT 生成架构
  - 改变现有的数据结构和 API 接口
  - 支持复杂的交互式动画效果

## Decisions
- **Decision**: 采用模板化布局系统而非完全动态生成
  - **Rationale**: 模板化系统更易维护，能保证设计一致性，同时提供足够的灵活性
  - **Alternatives considered**: 完全动态生成、基于 AI 的布局设计

- **Decision**: 使用 Playwright 进行 PDF 生成
  - **Rationale**: Playwright 提供精确的页面截图能力，支持复杂 CSS 和现代 Web 特性
  - **Alternatives considered**: Puppeteer、html-pdf、wkhtmltopdf

- **Decision**: 保持现有 API 兼容性
  - **Rationale**: 确保现有代码无需修改即可使用新功能
  - **Alternatives considered**: 破坏性 API 重构

## Risks / Trade-offs
- **Risk**: Playwright 依赖增加部署复杂度
  - **Mitigation**: 提供 Docker 镜像和详细安装文档
- **Risk**: 多种布局模板可能影响性能
  - **Mitigation**: 使用模板缓存和按需加载
- **Trade-off**: 功能丰富性 vs 实现复杂度
  - **Balance**: 优先实现核心布局，后续迭代增加更多模板

## Migration Plan
1. **Phase 1**: 扩展现有 PPT 服务，添加布局模板系统
2. **Phase 2**: 实现完整结构生成逻辑
3. **Phase 3**: 集成 Playwright PDF 生成功能
4. **Phase 4**: 优化性能和添加测试
5. **Rollback**: 保持原有功能作为降级选项

## Open Questions
- PDF 生成的性能优化策略（批量处理 vs 实时生成）
- 布局模板的扩展机制（是否支持用户自定义模板）
- 不同页面尺寸的适配策略
