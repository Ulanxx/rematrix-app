## ADDED Requirements
### Requirement: Workflow Command Engine
The system SHALL provide a workflow engine to parse and execute commands.

#### Scenario: Parse command from message
- **WHEN** ChatBot receives a message starting with "/"
- **THEN** the workflow engine SHALL extract and parse the command

#### Scenario: Execute workflow command
- **WHEN** a valid command is parsed
- **THEN** the workflow engine SHALL execute the command and return result

#### Scenario: Handle invalid commands
- **WHEN** an invalid command is received
- **THEN** the system SHALL return an error message with available commands

### Requirement: Command Set Definition
The system SHALL support a predefined set of workflow commands.

#### Scenario: Support basic control commands
- **WHEN** user sends "/run", "/pause", "/resume"
- **THEN** the system SHALL execute corresponding job control actions

#### Scenario: Support stage navigation commands
- **WHEN** user sends "/jump-to STAGE"
- **THEN** the system SHALL move job to specified stage

#### Scenario: Support modification commands
- **WHEN** user sends "/modify-stage PARAM VALUE"
- **THEN** the system SHALL update stage parameters

### Requirement: Natural Language Processing
The system SHALL convert natural language to workflow commands.

#### Scenario: Parse natural language intent
- **WHEN** user types "请开始执行"
- **THEN** the system SHALL map to "/run" command

#### Scenario: Extract parameters from natural language
- **WHEN** user types "跳转到大纲阶段"
- **THEN** the system SHALL extract stage "OUTLINE" and execute "/jump-to OUTLINE"

#### Scenario: Handle ambiguous natural language
- **WHEN** natural language is ambiguous
- **THEN** the system SHALL ask for clarification with options
