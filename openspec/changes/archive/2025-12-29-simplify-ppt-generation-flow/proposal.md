# Proposal: Simplify PPT Generation Flow

## Why
The current PPT generation process involves multiple steps and complex configurations, making it difficult to maintain and test. This proposal aims to optimize the overall flow to directly generate `htmlContent` based on the materials provided in the `test-ai-generation.ts` use case, improving both developer experience and system performance.

## What Changes
- Simplify backend PPT generation: Directly generate `htmlContent` based on slide materials.
- Optimize frontend flow: Update PPT preview and download logic to consume the simplified HTML content directly.
- **BREAKING**: Changes to internal PPT generation data structures and API response formats.

## Scope
- Modify `PptService` and `AiHtmlGeneratorService` to support a more direct generation path.
- Update internal data structures if necessary to hold the simplified material format.

## Impact
- Affected specs: `simplified-html-gen`, `frontend-flow`
- Affected code: `PptService`, `AiHtmlGeneratorService`, `AppDetail.tsx`, `JobProcess.tsx`
