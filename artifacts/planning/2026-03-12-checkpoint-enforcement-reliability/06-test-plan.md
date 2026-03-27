# Test Plan: Checkpoint Enforcement Reliability

**Issue:** [#51](https://github.com/m2ux/workflow-server/issues/51)  
**PR:** [#52](https://github.com/m2ux/workflow-server/pull/52)

---

## Overview

This test plan validates the checkpoint enforcement reliability enhancement, ensuring the server-side validation tool correctly identifies missing blocking checkpoints and required steps, while maintaining backward compatibility with existing workflow definitions.

Key changes to validate:
1. `getBlockingCheckpoints` — Extracts required blocking checkpoints from an activity definition
2. `validate_activity_completion` — Server-side tool that validates activity completion against checkpoint and step requirements

---

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR52-TC-01 | Verify `getBlockingCheckpoints` returns only required blocking checkpoints from an activity | Unit |
| PR52-TC-02 | Verify `getBlockingCheckpoints` excludes non-blocking checkpoints (`blocking: false`) | Unit |
| PR52-TC-03 | Verify `getBlockingCheckpoints` returns empty array for activity with no checkpoints | Unit |
| PR52-TC-04 | Verify `getBlockingCheckpoints` includes prerequisite metadata for checkpoints that have them | Unit |
| PR52-TC-05 | Verify `validate_activity_completion` returns valid when all blocking checkpoints are responded to | Integration |
| PR52-TC-06 | Verify `validate_activity_completion` returns invalid with missing checkpoint list when required blocking checkpoints are absent from `checkpoints_responded` | Integration |
| PR52-TC-07 | Verify `validate_activity_completion` does not require non-blocking checkpoints in `checkpoints_responded` | Integration |
| PR52-TC-08 | Verify `validate_activity_completion` returns valid for activity with no defined checkpoints | Integration |
| PR52-TC-09 | Verify `validate_activity_completion` returns invalid with missing steps when required steps are absent from `steps_completed` | Integration |
| PR52-TC-10 | Verify `validate_activity_completion` includes `blocking_checkpoints_total` count and prerequisite metadata in response | Integration |
| PR52-TC-11 | Verify existing `get_workflow` tool continues to work without regressions | Integration |
| PR52-TC-12 | Verify existing `get_checkpoint` tool continues to work without regressions | Integration |

*Detailed steps, expected results, and source links will be added after implementation.*

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test suite
npx vitest run tests/mcp-server.test.ts

# Typecheck
npm run typecheck
```
