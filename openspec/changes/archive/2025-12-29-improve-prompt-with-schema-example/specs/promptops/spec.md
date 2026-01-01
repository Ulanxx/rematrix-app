## ADDED Requirements
### Requirement: Schema Example Generation
The system SHALL generate concrete JSON examples for each workflow stage's output schema to improve AI generation accuracy.

#### Scenario: Generate example for PLAN stage
- **WHEN** the system processes the PLAN stage
- **THEN** it SHALL generate a JSON example showing expected plan structure with sections, objectives, and key points

#### Scenario: Generate example for OUTLINE stage
- **WHEN** the system processes the OUTLINE stage
- **THEN** it SHALL generate a JSON example showing hierarchical outline structure with main topics and subtopics

#### Scenario: Generate example for STORYBOARD stage
- **WHEN** the system processes the STORYBOARD stage
- **THEN** it SHALL generate a JSON example showing slide-by-slide storyboard with visual and content elements

#### Scenario: Generate example for PAGES stage
- **WHEN** the system processes the PAGES stage
- **THEN** it SHALL generate a JSON example showing page structure with slide content, design elements, and PDF metadata

## MODIFIED Requirements
### Requirement: Prompt Construction
The system SHALL construct prompts using concrete JSON examples instead of abstract schema descriptions to improve AI model comprehension.

#### Scenario: Build prompt with example
- **WHEN** building a prompt for any workflow stage
- **THEN** the system SHALL include a JSON example in the prompt instead of just saying "follow the schema"
- **AND** the example SHALL demonstrate the expected structure and data types
- **AND** the prompt SHALL instruct the AI to "参考以下示例格式" (refer to the following example format)

#### Scenario: Maintain validation
- **WHEN** using JSON examples in prompts
- **THEN** the system SHALL maintain the existing schema validation mechanism
- **AND** generated outputs SHALL still be validated against the original schema
- **AND** validation SHALL fail if the output doesn't match schema requirements

### Requirement: Prompt Template Update
The system SHALL update default prompt templates to use example-based guidance.

#### Scenario: Update promptops templates
- **WHEN** generating default prompts for any stage
- **THEN** the template SHALL include "请参考以下示例格式生成JSON" instead of "请严格输出 JSON，结构必须符合本 stage 的 schema"
- **AND** the template SHALL append the generated JSON example to the prompt
- **AND** the example SHALL be formatted as a code block for clarity
