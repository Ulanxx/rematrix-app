# frontend-flow Specification

## Purpose
TBD - created by archiving change simplify-ppt-generation-flow. Update Purpose after archive.
## Requirements
### Requirement: Direct HTML Preview for PPT
The frontend SHALL support direct preview of PPT content provided as raw HTML strings.

#### Scenario: Previewing simplified PPT artifact
- **Given** a job with a PPT artifact containing `htmlContent`.
- **When** the user clicks "Preview" in `AppDetail` or `JobProcess`.
- **Then** the system SHALL render the HTML content in an iframe or dedicated preview component.

### Requirement: Simplified Download for PPT
The frontend SHALL provide a way to download the simplified PPT as a standalone HTML file.

#### Scenario: Downloading PPT HTML
- **Given** a generated PPT HTML string.
- **When** the user clicks "Download".
- **Then** the system SHALL trigger a file download of an `.html` file containing the full PPT content.

