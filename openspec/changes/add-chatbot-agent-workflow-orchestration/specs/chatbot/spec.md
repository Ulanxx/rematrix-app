## ADDED Requirements
### Requirement: Workflow Command Execution
The ChatBot SHALL parse and execute workflow commands to control job processes.

#### Scenario: Execute run command
- **WHEN** user sends "/run" in ChatBot
- **THEN** the system SHALL start or resume the job execution

#### Scenario: Execute pause command
- **WHEN** user sends "/pause" in ChatBot
- **THEN** the system SHALL pause the current job execution

#### Scenario: Execute jump-to command
- **WHEN** user sends "/jump-to OUTLINE" in ChatBot
- **THEN** the system SHALL move the job to the specified stage

### Requirement: Natural Language Command Parsing
The system SHALL convert natural language inputs into workflow commands.

#### Scenario: Parse natural language to command
- **WHEN** user types "请开始执行任务" in ChatBot
- **THEN** the system SHALL convert it to "/run" command and execute

#### Scenario: Handle ambiguous commands
- **WHEN** user input is ambiguous
- **THEN** the system SHALL ask for clarification before executing

## MODIFIED Requirements
### Requirement: ChatBot SSE Events
The ChatBot SSE endpoint SHALL support workflow command events and status updates.

#### Scenario: SSE includes command execution status
- **WHEN** a command is executed
- **THEN** the SSE stream SHALL emit a command_status event with execution result

#### Scenario: SSE includes workflow state updates
- **WHEN** job status changes due to command execution
- **THEN** the SSE stream SHALL emit updated job state information
