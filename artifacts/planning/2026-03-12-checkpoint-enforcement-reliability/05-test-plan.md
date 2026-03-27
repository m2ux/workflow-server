# Test Plan: Checkpoint Enforcement Reliability

**Issue:** [#51](https://github.com/m2ux/workflow-server/issues/51)  
**PR:** [#52](https://github.com/m2ux/workflow-server/pull/52)

---

## Overview

This test plan validates the checkpoint enforcement reliability enhancement, ensuring the server-side validation tool correctly identifies missing blocking checkpoints and required steps, while maintaining backward compatibility with existing workflow definitions.

Key changes to validate:
1. `getBlockingCheckpoints` — Helper that extracts required blocking checkpoints from an activity definition
2. `validate_activity_completion` — Server-side MCP tool that validates activity completion against checkpoint and step requirements

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR52-TC-01 | Verify `getBlockingCheckpoints` returns only checkpoints with `required: true` (default) and `blocking: true` (default) from an activity | Unit |
| PR52-TC-02 | Verify `getBlockingCheckpoints` excludes non-blocking checkpoints (`blocking: false`) | Unit |
| PR52-TC-03 | Verify `getBlockingCheckpoints` returns empty array for activity with no checkpoints | Unit |
| PR52-TC-04 | Verify `getBlockingCheckpoints` includes prerequisite metadata (`hasPrerequisite`, `prerequisite` string) for checkpoints that have them | Unit |
| PR52-TC-05 | Verify `validate_activity_completion` returns `valid: true` when all required blocking checkpoints are present in `checkpoints_responded` | Integration |
| PR52-TC-06 | Verify `validate_activity_completion` returns `valid: false` with `missing_checkpoints` list when required blocking checkpoints are absent from `checkpoints_responded` | Integration |
| PR52-TC-07 | Verify `validate_activity_completion` does not require non-blocking checkpoints in `checkpoints_responded` — returns valid even if they are absent | Integration |
| PR52-TC-08 | Verify `validate_activity_completion` returns `valid: true` for an activity with no defined checkpoints | Integration |
| PR52-TC-09 | Verify `validate_activity_completion` returns `valid: false` with `missing_steps` list when required steps are absent from `steps_completed` | Integration |
| PR52-TC-10 | Verify `validate_activity_completion` response includes `blocking_checkpoints_total` count and prerequisite metadata for each blocking checkpoint | Integration |
| PR52-TC-11 | Verify existing `get_workflow` tool continues to work without regressions after adding the validation tool | Integration |
| PR52-TC-12 | Verify existing `get_checkpoint` tool continues to work without regressions after adding the validation tool | Integration |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npx vitest run tests/mcp-server.test.ts

# Run tests matching a pattern
npx vitest run tests/mcp-server.test.ts -t "validate_activity_completion"

# Typecheck
npm run typecheck
```
