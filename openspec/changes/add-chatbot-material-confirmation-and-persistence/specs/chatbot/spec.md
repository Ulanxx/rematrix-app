## ADDED Requirements
### Requirement: Chat Message Persistence
The system SHALL persist all ChatBot messages per job and restore them on page load.

#### Scenario: Restore chat history on page load
- **WHEN** user opens the job detail page
- **THEN** the system SHALL load and display previous chat messages for that job

#### Scenario: Save incoming and outgoing messages
- **WHEN** a message is sent via ChatBot SSE
- **THEN** the system SHALL store the message with role, content, and metadata

### Requirement: Material Confirmation via ChatBot
The system SHALL allow users to approve or reject pending material stages directly from the ChatBot interface.

#### Scenario: Prompt for approval when waiting
- **WHEN** a job status is WAITING_APPROVAL and the user opens ChatBot
- **THEN** the system SHALL send an approval_request event with stage and artifact summary

#### Scenario: User approves via ChatBot
- **WHEN** the user clicks "确认" in the approval request card
- **THEN** the system SHALL call the approval endpoint and update the job status

#### Scenario: User rejects via ChatBot
- **WHEN** the user clicks "拒绝" in the approval request card
- **THEN** the system SHALL call the rejection endpoint and keep the job in WAITING_APPROVAL

## MODIFIED Requirements
### Requirement: ChatBot SSE Events
The ChatBot SSE endpoint SHALL support additional event types for persistence and approval requests.

#### Scenario: SSE includes approval_request
- **WHEN** the job is waiting for approval
- **THEN** the SSE stream SHALL emit an approval_request event with stage and artifact summary

#### Scenario: SSE messages include unique IDs
- **WHEN** any message event is emitted
- **THEN** the event payload SHALL contain a unique message ID for persistence
