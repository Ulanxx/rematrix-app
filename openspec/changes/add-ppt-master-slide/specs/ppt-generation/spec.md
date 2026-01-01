## ADDED Requirements

### Requirement: PPT Master Slide Support
The system SHALL support a "Master Slide" (母版) concept to ensure visual consistency across all generated slides.

#### Scenario: Consistent Header and Footer
- **WHEN** multiple slides are generated for a presentation
- **THEN** each page MUST contain a consistent header with the course title and a footer with standardized page numbers (e.g., "Page 01 / 02")
- **AND** the AI generated content MUST be placed within a designated content area that does not overlap with master elements

### Requirement: Master Slide Variables
The system SHALL support dynamic variable replacement within the Master Slide template.

#### Scenario: Dynamic Page Numbering
- **WHEN** the final HTML is being assembled
- **THEN** the system MUST replace `{{pageNumber}}` and `{{totalSlides}}` with actual values for each slide
- **AND** replace `{{courseTitle}}` with the title provided in the generation context
