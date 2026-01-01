# Capability: Simplified HTML Generation

## ADDED Requirements

### Requirement: Generate HTML content directly from slide materials
The system SHALL provide a way to generate HTML content for a set of slides using provided context and theme configurations without mandatory intermediate complex processing.

#### Scenario: Successful HTML generation from test case materials
- **Given** a set of `StoryboardSlide` objects, a `context` object, and a `themeConfig`.
- **When** the direct generation method is called.
- **Then** the system should return a string containing the HTML content for the slides.
