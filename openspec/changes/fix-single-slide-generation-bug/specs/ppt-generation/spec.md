## MODIFIED Requirements
### Requirement: Generate HTML content directly from slide materials
The system SHALL provide a way to generate HTML content for a set of slides using provided context and theme configurations. The system MUST ensure that all input slides are present in the final output, even when dealing with large numbers of slides that might exceed single-turn AI output limits.

#### Scenario: Successful HTML generation for all input slides
- **Given** a set of 10 `StoryboardSlide` objects.
- **When** the direct generation method is called.
- **Then** the resulting HTML string MUST contain 10 distinct `ppt-page-wrapper` containers, each corresponding to an input slide.

#### Scenario: Handling large slide sets via chunking
- **Given** a large set of slides (e.g., > 5 slides).
- **When** the system detects potential content truncation or is configured for stability.
- **Then** it SHALL split the generation into smaller chunks and merge them into a single coherent HTML document.
