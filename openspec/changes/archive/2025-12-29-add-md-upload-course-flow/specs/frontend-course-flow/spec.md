# Frontend Course Flow（上传 md → 制作过程 → 三段确认）规格

## ADDED Requirements

### Requirement: 上传 Markdown 文件创建任务
前端应用 SHALL 提供上传 `.md` 文件的入口，并以文件内容创建 Job。

#### Scenario: 选择 md 文件并预览
- **WHEN** 用户在前端选择 `.md` 文件
- **THEN** 前端 SHALL 读取文件内容并在页面上提供预览

#### Scenario: 提交创建 Job
- **WHEN** 用户点击“开始生成/创建任务”
- **THEN** 前端 SHALL 调用 `POST /jobs` 创建任务
- **AND** 创建成功后 SHALL 展示 `jobId` 并进入制作过程页

### Requirement: 制作过程页展示阶段进度
前端应用 SHALL 提供“制作过程”页面展示 Job 阶段与状态。

#### Scenario: 轮询展示进度
- **WHEN** 用户进入制作过程页
- **THEN** 前端 SHALL 周期性轮询 `GET /jobs/:id` 与 `GET /jobs/:id/artifacts`
- **AND** 页面 SHALL 展示当前阶段与已生成的产物列表

### Requirement: 三段确认交互
前端应用 SHALL 在 PLAN/NARRATION/PAGES 阶段提供确认与拒绝入口。

#### Scenario: Approve
- **WHEN** 当前状态为 WAITING_APPROVAL 且当前阶段为 PLAN/NARRATION/PAGES
- **THEN** 前端 SHALL 展示“确认”按钮并调用 `POST /jobs/:id/approve`

#### Scenario: Reject
- **WHEN** 用户输入修改意见并点击“拒绝/退回”
- **THEN** 前端 SHALL 调用 `POST /jobs/:id/reject` 并携带 `reason`
