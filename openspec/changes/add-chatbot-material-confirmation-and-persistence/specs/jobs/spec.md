## ADDED Requirements
### Requirement: Approval via ChatBot API
The system SHALL expose an API to approve or reject a pending job stage, callable from the ChatBot UI.

#### Scenario: Approve a stage via API
- **WHEN** the user clicks "确认" in the ChatBot approval card
- **THEN** the system SHALL accept a POST /jobs/:id/approve request with stage and action=approve and update the Approval record

#### Scenario: Reject a stage via API
- **WHEN** the user clicks "拒绝" in the ChatBot approval card
- **THEN** the system SHALL accept a POST /jobs/:id/approve request with stage and action=reject and update the Approval record

### Requirement: Chat Message Storage
The system SHALL store all chat messages associated with a job for persistence and retrieval.

#### Scenario: Store user message
- **WHEN** a user sends a message via ChatBot
- **THEN** the system SHALL create a ChatMessage record with role=user and the message content

#### Scenario: Store assistant message
- **WHEN** the assistant streams a response via ChatBot SSE
- **THEN** the system SHALL create a ChatMessage record with role=assistant and the full response content

#### Scenario: Retrieve chat history
- **WHEN** the frontend requests GET /jobs/:id/messages
- **THEN** the system SHALL return all ChatMessage records for that job ordered by createdAt

## MODIFIED Requirements
### Requirement: ChatBot SSE Behavior
The ChatBot SSE endpoint SHALL integrate with persistence and approval workflows.

#### Scenario: Emit approval_request on first connect
- **WHEN** a client connects to /jobs/:id/chat/sse and the job status is WAITING_APPROVAL and no prior approval request exists in chat history
- **THEN** the system SHALL emit an approval_request event before any other messages

#### Scenario: Persist messages during SSE
- **WHEN** any message event is emitted via SSE
- **THEN** the system SHALL persist the message to ChatMessage before sending to the client
