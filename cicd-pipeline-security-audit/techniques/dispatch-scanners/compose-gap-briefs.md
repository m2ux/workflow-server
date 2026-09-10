---
metadata:
  version: 3.0.0
---

## Capability

Targeted re-dispatch briefs, one for each coverage gap the verification report names, and an empty set where it names none.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array — one brief per gap requiring re-dispatch. Empty when `{verification_report}` finds zero gaps.

## Protocol

### 1. Compose Gap Briefs

- For each gap in `{verification_report.gaps}`, compose a narrowed scanner prompt for the responsible scanner (unscanned files or skipped patterns only), carrying: (1) the workflow-server bootstrap — `start_session(session_token, agent_id)` to inherit the dispatched session, then the activity steps followed in order; (2) the responsible scanner's entry from `{scanner_assignments}` narrowed to the gap's files and patterns, with `{planning_folder_path}`; (3) the requirement to write the [scanner output file](../../resources/sub-agent-output-schema.md#file-naming-convention) conforming to the [output schema](../../resources/sub-agent-output-schema.md#schema).
- Emit `{worker_briefs}` with stable `id` values (scanner designator plus gap discriminator when the same scanner appears more than once).
- When the verification report finds zero gaps, emit an empty `{worker_briefs}` array — the following dispatch step no-ops.
- Do not dispatch from this operation.
