## MODIFIED Requirements
### Requirement: PPT Generation Service
The PPT service SHALL provide a simplified interface for generating HTML slides using AI, focusing only on the core generatePptWithAi method.

#### Scenario: AI slide generation
- **WHEN** client calls generatePptWithAi with storyboard slides and context
- **THEN** service SHALL use AiHtmlGeneratorService to generate HTML content
- **AND** return HTML pages with generation statistics

## REMOVED Requirements
### Requirement: Design Template System
**Reason**: Design templates add unnecessary complexity when AI can dynamically generate styles
**Migration**: Use AI-generated styles instead of predefined templates

#### Scenario: Template-based design
- **REMOVED** ModernDesignTemplate system and related methods

### Requirement: Layout Generation System
**Reason**: Complex layout generation logic is not needed for AI-based slide generation
**Migration**: AI handles layout generation dynamically

#### Scenario: Dynamic layout creation
- **REMOVED** generatePptHtml, generateLayoutHtml and related layout methods

### Requirement: Cloud Upload Integration
**Reason**: Upload functionality should be separated from slide generation
**Migration**: Implement upload as a separate service if needed

#### Scenario: Cloud storage upload
- **REMOVED** uploadToCloud, retryUploadPpt and related upload methods

### Requirement: Animation and Effects System
**Reason**: Animation effects are handled by AI-generated CSS, not predefined templates
**Migration**: AI generates animations as part of HTML content

#### Scenario: Animation generation
- **REMOVED** generateModernAnimations and effects-related methods
