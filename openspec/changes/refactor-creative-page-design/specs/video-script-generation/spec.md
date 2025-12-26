# Video Script Generation Capability

## ADDED Requirements

### Requirement: 完整视频脚本生成

系统 SHALL 根据分镜脚本生成完整的视频脚本，包括全局脚本和每页的详细口播稿。

#### Scenario: 基于分镜生成完整脚本

- **WHEN** 用户完成 STORYBOARD 阶段
- **THEN** 系统生成包含完整视频脚本和每页口播稿的 SCRIPT artifact
- **AND** 每页口播稿应详细、连贯、适合语音播报
- **AND** 脚本应保持整体的叙事连贯性

#### Scenario: 脚本包含必要的元数据

- **WHEN** 生成 SCRIPT artifact
- **THEN** 每页脚本包含页码、口播稿、关键要点
- **AND** 每页脚本包含预估时长（秒）
- **AND** 每页脚本可选包含视觉建议

### Requirement: 口播稿质量标准

系统生成的口播稿 SHALL 满足以下质量标准：

- 语言流畅自然，适合口语表达
- 内容完整，充分展开分镜中的要点
- 长度适中，单页口播稿通常在 30-120 秒
- 逻辑清晰，前后连贯

#### Scenario: 口播稿适合语音播报

- **WHEN** 生成口播稿
- **THEN** 口播稿使用口语化表达，避免书面语
- **AND** 句子长度适中，便于断句
- **AND** 避免复杂的从句和长句

#### Scenario: 口播稿充分展开内容

- **WHEN** 基于分镜要点生成口播稿
- **THEN** 口播稿应详细解释每个要点
- **AND** 添加必要的过渡和连接
- **AND** 保持内容的深度和完整性

### Requirement: 脚本与分镜的对应关系

系统 SHALL 确保生成的脚本与分镜脚本保持一致的页面对应关系。

#### Scenario: 页面数量一致

- **WHEN** 生成 SCRIPT artifact
- **THEN** 脚本的页面数量与 STORYBOARD 的页面数量相同
- **AND** 每页的页码与分镜页码一一对应

#### Scenario: 内容主题一致

- **WHEN** 为每页生成口播稿
- **THEN** 口播稿的主题与该页分镜的视觉要点和旁白提示一致
- **AND** 不偏离分镜设定的内容范围

### Requirement: 脚本可用于后续阶段

生成的 SCRIPT artifact SHALL 可被 PAGES 和 TTS 阶段使用。

#### Scenario: PAGES 阶段使用脚本

- **WHEN** PAGES 阶段执行
- **THEN** 可以读取 SCRIPT artifact 获取每页的完整口播稿
- **AND** 基于口播稿理解内容进行页面设计

#### Scenario: TTS 阶段使用脚本

- **WHEN** TTS 阶段执行
- **THEN** 可以读取 SCRIPT artifact 获取每页的口播稿
- **AND** 将口播稿转换为语音音频

### Requirement: 脚本生成的可配置性

系统 SHALL 支持通过配置调整脚本生成的风格和详细程度。

#### Scenario: 配置口播稿风格

- **WHEN** 用户指定脚本风格（正式/轻松/专业等）
- **THEN** 生成的口播稿应符合指定风格
- **AND** 保持风格的一致性

#### Scenario: 配置详细程度

- **WHEN** 用户指定详细程度（简洁/标准/详细）
- **THEN** 生成的口播稿长度和深度应符合要求
- **AND** 预估时长应相应调整
