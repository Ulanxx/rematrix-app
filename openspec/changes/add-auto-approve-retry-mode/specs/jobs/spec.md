## ADDED Requirements
### Requirement: Job自动模式字段
Job模型 SHALL 包含autoMode布尔字段，用于标识Job是否启用了自动审批和重试模式。

#### Scenario: 创建自动模式Job
- **WHEN** 系统创建Job时传递autoMode=true参数
- **THEN** 数据库中的Job记录 SHALL 设置autoMode为true
- **AND** 返回的Job对象包含autoMode字段

#### Scenario: 创建手动模式Job
- **WHEN** 系统创建Job时未传递autoMode参数或传递false
- **THEN** 数据库中的Job记录 SHALL 设置autoMode为false
- **AND** 返回的Job对象包含autoMode字段

### Requirement: 自动审批逻辑
工作流引擎 SHALL 为autoMode=true的Job自动执行审批操作，跳过人工审批等待。

#### Scenario: 自动审批PLAN阶段
- **WHEN** 自动模式Job的PLAN阶段完成并需要审批
- **THEN** 系统 SHALL 自动批准该阶段
- **AND** 继续执行下一个阶段
- **AND** 不进入WAITING_APPROVAL状态

#### Scenario: 自动审批PAGES阶段
- **WHEN** 自动模式Job的PAGES阶段完成并需要审批
- **THEN** 系统 SHALL 自动批准该阶段
- **AND** 继续执行下一个阶段
- **AND** 不进入WAITING_APPROVAL状态

### Requirement: 自动重试逻辑
当自动模式Job的某个阶段失败时，系统 SHALL 自动重试该阶段，直到成功或达到最大重试次数。

#### Scenario: 自动重试失败阶段
- **WHEN** 自动模式Job的某个阶段执行失败
- **AND** 重试次数小于最大重试次数（3次）
- **THEN** 系统 SHALL 自动重新执行该阶段
- **AND** 增加重试计数器

#### Scenario: 达到最大重试次数
- **WHEN** 自动模式Job的某个阶段执行失败
- **AND** 重试次数等于最大重试次数（3次）
- **THEN** 系统 SHALL 将Job状态设置为FAILED
- **AND** 停止自动重试

### Requirement: 自动模式API支持
Jobs API SHALL 支持autoMode参数，允许前端传递自动模式设置。

#### Scenario: 创建Job时传递autoMode
- **WHEN** 前端调用POST /jobs接口并传递autoMode参数
- **THEN** 系统 SHALL 验证autoMode参数为布尔值
- **AND** 将参数存储到Job记录中
- **AND** 返回包含autoMode字段的Job对象

#### Scenario: 获取Job详情包含autoMode
- **WHEN** 前端调用GET /jobs/{id}接口
- **THEN** 返回的Job对象 SHALL 包含autoMode字段
- **AND** 字段值反映Job的实际自动模式状态
