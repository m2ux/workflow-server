# TOON to Markdown Conversion - Start Here

## Quick Reference

| Field | Value |
|-------|-------|
| **Issue** | Skipped |
| **PR** | https://github.com/m2ux/workflow-server/pull/new/refactor/toon-to-markdown-resources |
| **Branch** | refactor/toon-to-markdown-resources |
| **Status** | ✅ Complete |
| **Type** | Refactor |

## Documents

| Document | Purpose | Status |
|----------|---------|--------|
| [START-HERE.md](START-HERE.md) | Entry point | ◐ In Progress |
| 00-requirements-elicitation.md | Elicited requirements | ⊘ Skipped |
| [01-implementation-analysis.md](01-implementation-analysis.md) | Current state analysis | ✅ Complete |
| [03-work-package-plan.md](03-work-package-plan.md) | Implementation plan | ✅ Complete |

## Executive Summary

Convert the work-package workflow resources from TOON format back to markdown format. The resources began as markdown guides, were converted to TOON during a migration, but markdown is preferred for better readability and maintainability. This requires reconciling original guide content with any new information added in the TOON format, then updating the loader infrastructure to continue supporting both formats (already supported).

## Problem Statement

The work-package resources folder contains 19 TOON files that were originally markdown guides. The TOON format, while structured, is less readable for human consumption and harder to maintain. The original markdown guides in the agent-resources repository provide a baseline, but new content may have been added during the TOON migration that needs to be preserved.

## Scope

### In Scope

1. **Resource files** - Convert 19 TOON files in `workflows/work-package/resources/` to markdown
2. **Content reconciliation** - Compare TOON content with original markdown guides, preserve additions
3. **Loader verification** - Verify `resource-loader.ts` handles markdown format correctly (already supported)
4. **File mapping** - Maintain same index numbering scheme (00-start-here.md, 02-readme.md, etc.)

### Out of Scope

- TOON files in `meta/` workflow (skills, activities)
- TOON files in `work-packages/` workflow
- TOON parser/decoder changes
- Template files (already markdown)

## Files to Convert

| Index | TOON File | Original Markdown Guide | Status |
|-------|-----------|-------------------------|--------|
| 00 | start-here.toon | start-here.guide.md | ⬚ Pending |
| 02 | readme.toon | readme.guide.md | ⬚ Pending |
| 03 | github-issue-creation.toon | github-issue-creation.guide.md | ⬚ Pending |
| 04 | jira-issue-creation.toon | jira-issue-creation.guide.md | ⬚ Pending |
| 05 | requirements-elicitation.toon | requirements-elicitation.guide.md | ⬚ Pending |
| 06 | implementation-analysis.toon | implementation-analysis.guide.md | ⬚ Pending |
| 07 | knowledge-base-research.toon | knowledge-base-research.guide.md | ⬚ Pending |
| 08 | design-framework.toon | design-framework.guide.md | ⬚ Pending |
| 09 | plan.toon | plan.guide.md | ⬚ Pending |
| 10 | test-plan.toon | test-plan.guide.md | ⬚ Pending |
| 11 | pr-description.toon | pr-description.guide.md | ⬚ Pending |
| 12 | assumptions-review.toon | assumptions-review.guide.md | ⬚ Pending |
| 13 | task-completion-review.toon | task-completion-review.guide.md | ⬚ Pending |
| 14 | architecture-review.toon | architecture-review.guide.md | ⬚ Pending |
| 15 | strategic-review.toon | strategic-review.guide.md | ⬚ Pending |
| 16 | complete.toon | complete.guide.md | ⬚ Pending |
| 17 | workflow-retrospective.toon | workflow-retrospective.guide.md | ⬚ Pending |
| 18 | resume-here.toon | resume-work.md | ⬚ Pending |
| 19 | end-here.toon | (new in TOON) | ⬚ Pending |

## Success Criteria

- [x] All 19 TOON files converted to markdown format
- [x] Content from TOON files preserved in markdown versions
- [x] New content not in original guides is retained
- [x] Loader tests pass with markdown files (85 tests passing)
- [x] `list_workflow_resources` returns correct format indicators (format: "markdown")

## Next Steps

1. Requirements Elicitation - Confirm conversion strategy (restore from original vs. convert TOON directly)
2. Implementation Analysis - Detailed comparison of TOON vs original markdown content
3. Work Package Plan - Task breakdown for conversion
