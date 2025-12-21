## ADDED Requirements

### Requirement: Modular Step Definition System
The system SHALL provide a modular architecture for defining workflow steps, where each step encapsulates its type, prompt configuration, model selection, input schemas, and output schemas.

#### Scenario: Define a new workflow step
- **WHEN** a developer creates a new step definition
- **THEN** the step SHALL include stage identifier, type (AI_GENERATION/PROCESSING/MERGE), model configuration, input/output schemas, and execution requirements
- **AND** the system SHALL validate the step definition for completeness

#### Scenario: Register workflow steps
- **WHEN** the application starts
- **THEN** all step definitions SHALL be automatically registered in a central StepRegistry
- **AND** the registry SHALL provide lookup by stage and validation of step dependencies

### Requirement: Unified Step Execution Engine
The system SHALL provide a unified execution engine that can execute any registered step using its configuration and handle input preparation, model invocation, output validation, and artifact creation.

#### Scenario: Execute AI generation step
- **WHEN** executing an AI_GENERATION step
- **THEN** the engine SHALL retrieve the active prompt configuration, prepare input from dependent artifacts, invoke the configured AI model, validate output against the step's schema, and save the result as an artifact

#### Scenario: Execute processing step
- **WHEN** executing a PROCESSING step
- **THEN** the engine SHALL prepare input artifacts, run the processing logic, validate output, and save results without invoking AI models

### Requirement: Type-Safe Configuration Management
The system SHALL provide type-safe configuration management for all steps, ensuring that prompt configurations, model settings, and schemas are properly validated at runtime.

#### Scenario: Validate step configuration
- **WHEN** a step configuration is loaded or updated
- **THEN** the system SHALL validate that all required fields are present, model names are supported, schemas are valid Zod types, and prompt templates contain correct placeholders

#### Scenario: Handle configuration errors
- **WHEN** configuration validation fails
- **THEN** the system SHALL provide detailed error messages indicating which fields are invalid and suggest corrections

### Requirement: Backward Compatibility Layer
The system SHALL maintain backward compatibility with existing PromptStageConfig database schema and current workflow execution during the migration period.

#### Scenario: Migrate existing configurations
- **WHEN** the system starts with existing PromptStageConfig entries
- **THEN** the StepRegistry SHALL map these configurations to the new step definitions without data loss
- **AND** existing workflows SHALL continue to function without modification

#### Scenario: Gradual migration
- **WHEN** steps are gradually migrated to the new architecture
- **THEN** both old and new execution paths SHALL be supported
- **AND** the system SHALL track which steps use which execution mode

### Requirement: Step Dependency Management
The system SHALL provide automatic dependency resolution and validation for workflow steps, ensuring that input sources are available and correctly ordered.

#### Scenario: Validate step dependencies
- **WHEN** a step is registered or executed
- **THEN** the system SHALL verify that all input source stages exist and are executed before the current step
- **AND** circular dependencies SHALL be detected and rejected

#### Scenario: Prepare step inputs
- **WHEN** executing a step
- **THEN** the system SHALL automatically fetch the latest artifacts from all input source stages
- **AND** validate them against the step's input schema
