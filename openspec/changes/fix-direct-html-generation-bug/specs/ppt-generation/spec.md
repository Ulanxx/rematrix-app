## MODIFIED Requirements

### Requirement: Direct HTML Generation
The system SHALL generate complete multi-page PPT HTML documents when using the `generateDirectHtml` method.

#### Scenario: Generate complete HTML document with multiple slides
- **WHEN** `generateDirectHtml` is called with 6 slides
- **THEN** the AI SHALL generate a complete HTML document containing all 6 slides
- **AND** the `extractHtml` method SHALL correctly extract the full document
- **AND** the returned HTML MUST include `<!DOCTYPE html>`, `<head>`, `<style>`, and all slide `<div class="ppt-page-wrapper">` elements.

#### Scenario: Extract complete HTML from AI response
- **WHEN** AI returns a complete HTML document wrapped in code blocks
- **THEN** `extractHtml` SHALL prioritize extracting the full `<!DOCTYPE html>` document
- **AND** SHALL NOT truncate to only the first `<div>` tag.
