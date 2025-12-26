## ADDED Requirements

### Requirement: Job Failure Retry
The system SHALL provide a retry mechanism for failed jobs, allowing users to restart execution from the failed state.

#### Scenario: Retry failed job from Process page
- **WHEN** a job has status FAILED and user views the Job Process page
- **THEN** the system SHALL display a retry button
- **WHEN** user clicks the retry button
- **THEN** the system SHALL restart job execution from the current stage
- **AND** clear the previous error status
- **AND** update job status to RUNNING

#### Scenario: Retry job via workflow command
- **WHEN** user sends "/retry" command or natural language "重试任务"
- **THEN** the system SHALL validate the job is in FAILED status
- **AND** execute the retry workflow command
- **AND** return success response with updated job status

#### Scenario: Retry status updates via WebSocket
- **WHEN** a job retry is initiated
- **THEN** the system SHALL emit real-time status updates via WebSocket
- **AND** notify clients of status changes from FAILED to RUNNING
- **AND** provide progress updates during retry execution

#### Scenario: Retry failure handling
- **WHEN** a retry attempt fails
- **THEN** the system SHALL maintain FAILED status
- **AND** update error information with retry failure details
- **AND** allow subsequent retry attempts up to maximum limit

### Requirement: Retry Workflow Command
The workflow engine SHALL support a retry command to restart failed jobs.

#### Scenario: Execute retry command
- **WHEN** workflow engine receives retry command for a FAILED job
- **THEN** the system SHALL validate job existence and FAILED status
- **AND** reset job error status
- **AND** restart video generation workflow
- **AND** update job status to RUNNING

#### Scenario: Retry command validation
- **WHEN** retry command is received for non-FAILED job
- **THEN** the system SHALL reject the command with appropriate error message
- **AND** not modify job status or execution

### Requirement: Retry UI Controls
The Job Process page SHALL provide user interface controls for retrying failed jobs.

#### Scenario: Display retry button
- **WHEN** job status is FAILED
- **THEN** the system SHALL display a prominent retry button
- **AND** show the button only for failed jobs
- **AND** disable the button during retry execution

#### Scenario: Retry confirmation and feedback
- **WHEN** user clicks retry button
- **THEN** the system SHALL show loading state during retry initiation
- **AND** provide success/error feedback after retry attempt
- **AND** update UI to reflect new job status
