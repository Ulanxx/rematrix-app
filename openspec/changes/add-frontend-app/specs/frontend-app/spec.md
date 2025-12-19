## ADDED Requirements

### Requirement: Frontend App Scaffold
系统 SHALL 在仓库中提供一个可独立启动的前端应用工程（位于 `app/`），用于承载 Rematrix 的用户界面。

#### Scenario: 本地开发启动
- **WHEN** 开发者在仓库内进入前端工程并执行开发启动命令
- **THEN** 开发服务器 SHALL 成功启动
- **AND** 浏览器访问默认地址时 SHALL 渲染应用壳页面

#### Scenario: 生产构建
- **WHEN** 开发者执行生产构建命令
- **THEN** 前端工程 SHALL 生成可部署的静态产物

### Requirement: Frontend Styling
前端应用 MUST 集成 Tailwind CSS 并在默认页面中可见其样式生效。

#### Scenario: Tailwind 生效验证
- **WHEN** 访问应用默认页面
- **THEN** 页面上至少一个元素 SHALL 呈现由 Tailwind 类名带来的可见样式变化

### Requirement: Frontend API Client
前端应用 SHALL 提供一个统一的 API 访问层，用于与后端服务交互，并支持通过环境变量配置 API base URL。

#### Scenario: API baseURL 可配置
- **WHEN** 开发者配置 `VITE_API_BASE_URL`
- **THEN** 前端的 API 访问层 SHALL 使用该 base URL 作为请求前缀

### Requirement: Frontend Authentication
前端应用 SHALL 支持通过 JWT Bearer token 调用需要鉴权的后端接口。

#### Scenario: JWT 请求头注入
- **WHEN** 用户已在前端将 JWT token 存储在 `localStorage`
- **THEN** 前端对后端发起请求时 SHALL 在请求头中携带 `Authorization: Bearer <token>`

### Requirement: UI Component System
前端应用 SHALL 使用 `shadcn/ui` 作为基础组件方案，以提供一致的 UI 基础能力。

#### Scenario: shadcn 组件可用
- **WHEN** 开发者启动前端应用
- **THEN** 应用页面 SHALL 使用至少一个 `shadcn/ui` 组件进行渲染

### Requirement: Artifact Preview And Confirmation
前端应用 SHALL 提供产物（artifact）的预览能力，并提供用户确认动作的入口。

#### Scenario: 产物列表展示
- **WHEN** 用户进入某个 job 的产物页面
- **THEN** 前端 SHALL 展示该 job 的 artifact 列表
- **AND** artifact SHALL 按 stage 提供可识别的信息（例如 stage/type/version）

#### Scenario: 产物预览
- **WHEN** 用户选择一个 artifact
- **THEN** 前端 SHALL 展示该 artifact 的最小预览内容（例如 JSON 内容或 blobUrl 预览入口）

#### Scenario: 产物确认入口
- **WHEN** 用户在预览页面点击“确认/提交确认”
- **THEN** 前端 SHALL 发起对应的确认请求（或在后端接口未就绪时保留可替换的调用点）
