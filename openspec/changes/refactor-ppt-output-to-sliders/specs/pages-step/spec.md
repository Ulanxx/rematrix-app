## ADDED Requirements

### Requirement: 独立幻灯片数组输出
PAGES 阶段 SHALL 返回 `sliders` 数组，每个元素包含单页的完整 HTML 内容和云存储 URL。

#### Scenario: AI 生成模式返回多页 sliders
- **GIVEN** PAGES 阶段使用 AI 生成模式
- **AND** 生成了 10 页幻灯片
- **WHEN** 执行完成
- **THEN** 返回包含 10 个元素的 `sliders` 数组
- **AND** 每个元素包含 `htmlContent`、`url`、`slideNumber` 字段
- **AND** 每个 `url` 指向独立上传的 HTML 文件

#### Scenario: 传统模板模式返回 sliders
- **GIVEN** PAGES 阶段使用传统模板模式
- **AND** 生成了 5 页幻灯片
- **WHEN** 执行完成
- **THEN** 返回包含 5 个元素的 `sliders` 数组
- **AND** 每个元素的 `htmlContent` 为独立页面的完整 HTML

### Requirement: 基于 sliders 的 PDF 生成
PDF 生成 SHALL 基于 `sliders` 数组中每页的 `htmlContent` 进行逐页截图，然后拼接成最终 PDF。

#### Scenario: 从 sliders 生成多页 PDF
- **GIVEN** `sliders` 数组包含 8 个元素
- **WHEN** 调用 PDF 生成服务
- **THEN** 对每个 `slider.htmlContent` 进行截图
- **AND** 将 8 张截图按顺序拼接成单个 PDF 文件
- **AND** 返回 PDF 的云存储 URL

#### Scenario: 单页 slider 生成 PDF
- **GIVEN** `sliders` 数组包含 1 个元素
- **WHEN** 调用 PDF 生成服务
- **THEN** 对该 `slider.htmlContent` 进行截图
- **AND** 生成单页 PDF 文件

## REMOVED Requirements

### Requirement: 单一合并 PPT URL
**Reason**: 单一 `pptUrl` 导致浏览器渲染问题和 PDF 生成不灵活  
**Migration**: 使用 `sliders` 数组中的 `url` 字段访问各页内容；如需合并展示，前端自行拼接或使用第一页 URL
