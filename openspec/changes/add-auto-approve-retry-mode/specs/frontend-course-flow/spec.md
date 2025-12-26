## ADDED Requirements
### Requirement: 自动模式开关
课程创建页面 SHALL 提供自动模式开关，允许用户选择是否启用自动审批和重试功能。

#### Scenario: 用户启用自动模式创建课程
- **WHEN** 用户在课程创建页面开启"自动模式"开关
- **AND** 填写必要的课程内容
- **AND** 点击"创建并开始执行"按钮
- **THEN** 系统 SHALL 创建带有autoMode=true的Job
- **AND** 跳转到任务处理页面

#### Scenario: 用户保持手动模式创建课程
- **WHEN** 用户在课程创建页面保持"自动模式"开关关闭状态
- **AND** 填写必要的课程内容
- **AND** 点击"创建并开始执行"按钮
- **THEN** 系统 SHALL 创建带有autoMode=false的Job
- **AND** 跳转到任务处理页面

### Requirement: 自动模式状态显示
任务处理页面 SHALL 显示当前Job的自动模式状态，让用户了解是否启用了自动模式。

#### Scenario: 查看自动模式Job状态
- **WHEN** 用户访问自动模式Job的处理页面
- **THEN** 页面 SHALL 显示"自动模式"标识
- **AND** 显示自动模式相关的状态信息

#### Scenario: 查看手动模式Job状态
- **WHEN** 用户访问手动模式Job的处理页面
- **THEN** 页面 SHALL 显示标准的手动审批界面
- **AND** 不显示自动模式标识

### Requirement: 自动模式UI组件
系统 SHALL 提供清晰的自动模式UI组件，包括开关、状态指示器和相关说明。

#### Scenario: 自动模式开关交互
- **WHEN** 用户点击自动模式开关
- **THEN** 开关状态 SHALL 立即更新
- **AND** 显示相关的提示信息

#### Scenario: 自动模式状态指示器
- **WHEN** Job处于自动模式
- **THEN** 状态指示器 SHALL 显示"自动模式"标签
- **AND** 使用不同的视觉样式区分于手动模式
