# Requirements Elicitation: Use TOON Format for Workflows

**Date:** 2026-01-20  
**Status:** ✅ Confirmed  
**Issue:** [GitHub #4](https://github.com/m2ux/workflow-server/issues/4)  
**PR:** [#5](https://github.com/m2ux/workflow-server/pull/5)

---

## Problem Statement

The current JSON workflow files are verbose, increasing LLM token costs when workflows are loaded into context and making manual reading/editing difficult for developers and maintainers.

## Goal

Convert all workflow-related JSON files to TOON format to reduce token usage (target: 30%+ reduction) and improve human readability while maintaining full functionality of existing MCP tools.

---

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| LLM/Agent consumers | Reduced token count when loading workflows | As an LLM, I want compact workflow definitions so that I use fewer tokens per request |
| Developers/maintainers | Easier to read and edit workflow definitions | As a developer, I want human-readable workflow files so that I can quickly understand and modify them |
| MCP server users | Identical functionality via existing tools | As an MCP client, I want the same tool interface so that my integrations continue working |

### Secondary Stakeholders

- External workflow authors - May need to learn TOON format
- CI/CD pipelines - May need updates if they validate JSON files

---

## Context

### Integration Points

- `@toon-format/toon` npm package - TypeScript encoder/decoder
- MCP server tools - Must continue to return same data structures
- Workflow loaders (`src/loaders/`) - Must be updated to parse TOON
- JSON schemas (`schemas/`) - May need TOON equivalents or removal

### Dependencies

- `@toon-format/toon` - [GitHub](https://github.com/toon-format/toon) | [npm](https://www.npmjs.com/package/@toon-format/toon)

### Constraints

- **Technical:** Must integrate TOON parser into TypeScript codebase
- **Compatibility:** All existing MCP tools must return identical data structures
- **Testing:** All existing tests must continue to pass

---

## Scope

### ✅ In Scope

1. Convert `workflow-data/workflows/*.json` → `.toon`
2. Convert `prompts/intents/*.json` → `.toon`
3. Convert `prompts/skills/*.json` → `.toon`
4. Convert `schemas/*.json` → `.toon` (if applicable to TOON format)
5. Update all loaders in `src/loaders/` to parse TOON instead of JSON
6. Add `@toon-format/toon` as a dependency
7. Update any file path references from `.json` to `.toon`
8. Ensure all MCP tools continue to work identically

### ❌ Out of Scope

1. Changing the workflow schema/data structure itself
2. Adding new workflow features or capabilities
3. Changing the MCP tool API interface or responses
4. Migration tooling for external users

### ⏳ Deferred

1. Documentation updates for external workflow authors
2. TOON validation tooling (if needed)

---

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | TOON files use at least 30% fewer tokens than JSON equivalents | Token count comparison before/after |
| SC-2 | All existing MCP tools continue to work identically | Run existing test suite |
| SC-3 | Workflow files are easier to read/edit manually | Subjective review of converted files |
| SC-4 | All existing tests continue to pass | `npm test` passes |
| SC-5 | Build succeeds without errors | `npm run build` passes |

---

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem | What specific problem are we solving? | Both token efficiency (LLM cost) and human readability |
| Problem | Have you explored TOON format features? | Skipped |
| Scope | Which files should be converted? | All workflow-related JSON files |
| Success | Are the proposed success criteria correct? | Yes, confirmed |

### Clarifications Made

- **TOON parser:** Exists as `@toon-format/toon` npm package
- **File extension:** Use `.toon` following TOON convention

### Open Questions Resolved

- ✅ TypeScript parser available: `@toon-format/toon`
- ✅ File extension: `.toon`

---

## Confirmation

**Confirmed by:** User  
**Date:** 2026-01-20  
**Notes:** Ready to proceed to Implementation Analysis
