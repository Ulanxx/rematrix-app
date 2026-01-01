# Design: Simplify PPT Generation Flow

## Architecture Overview
The goal is to bypass complex orchestrations when only direct HTML generation is needed.

### Data Flow
1. Input: `testSlides` (StoryboardSlide[]), `context`, `themeConfig`, and `masterConfig`.
2. Processing: A new method will take these inputs and directly prompt the AI to generate a single, cohesive HTML string or a set of strings representing the pages.
3. Output: `htmlContent` (string).

### Key Components
- **AiHtmlGeneratorService**: Will be enhanced with a `generateDirectHtml` method that consumes the simplified material format.
- **PptService**: Will provide a wrapper for this new capability.
- **Frontend (React)**: `AppDetail.tsx` and `JobProcess.tsx` will be updated to display the generated HTML content directly in a previewer, simplifying the path from generation to visualization.
