## ADDED Requirements
### Requirement: Workflow Command Storage
The system SHALL store all workflow commands executed for audit and rollback purposes.

#### Scenario: Store command execution
- **WHEN** a workflow command is executed
- **THEN** the system SHALL create a WorkflowCommand record with command, params, and result

#### Scenario: Retrieve command history
- **WHEN** the user requests command history
- **THEN** the system SHALL return all WorkflowCommand records for that job

### Requirement: Job Stage Control via Commands
The system SHALL allow direct job stage manipulation through workflow commands.

#### Scenario: Jump to specific stage
- **WHEN** user executes "/jump-to OUTLINE" command
- **THEN** the system SHALL update the job's currentStage to OUTLINE

#### Scenario: Pause job execution
- **WHEN** user executes "/pause" command
- **THEN** the system SHALL set job status to PAUSED and stop execution

#### Scenario: Resume job execution
- **WHEN** user executes "/resume" command
- **THEN** the system SHALL set job status to RUNNING and continue execution

## MODIFIED Requirements
### Requirement: Job Status Management
The job status management SHALL support additional states for workflow control.

#### Scenario: Support PAUSED status
- **WHEN** a job is paused via command
- **THEN** the system SHALL update job status to PAUSED and stop temporal workflows

#### Scenario: Support RUNNING status
- **WHEN** a job is resumed via command
- **THEN** the system SHALL update job status to RUNNING and restart temporal workflows
