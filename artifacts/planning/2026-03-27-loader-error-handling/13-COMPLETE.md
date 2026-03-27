# Completion Summary — Loader Error Handling and Validation

**Work Package:** WP-05  
**Date:** 2026-03-27  
**Status:** Complete

---

## Deliverables

| Deliverable | Description |
|-------------|-------------|
| PR [#72](https://github.com/m2ux/workflow-server/pull/72) | 5 files changed, 48 insertions, 30 deletions |
| Issue [#67](https://github.com/m2ux/workflow-server/issues/67) | Quality & Consistency Audit Remediation (WP-05 portion) |
| Branch | `fix/wp05-loader-error-handling` |

---

## Changes Delivered

| File | Findings | Change Summary |
|------|----------|---------------|
| `src/loaders/skill-loader.ts` | QC-005 | Log warning on corrupt TOON decode instead of silent null |
| `src/loaders/rules-loader.ts` | QC-022 | Parse error log level corrected to `logWarn` |
| `src/loaders/resource-loader.ts` | QC-024, QC-026, QC-031 | Logged catch in `readResourceRaw`; `undefined` for missing frontmatter; aligned error policy |
| `src/loaders/activity-loader.ts` | QC-006, QC-009, QC-028 | Validation failure warning; typed catch with context; consistent index filtering |
| `src/loaders/workflow-loader.ts` | QC-006, QC-010, QC-011, QC-023, QC-025 | Skip invalid activities; manifest-only listing; logged catch; Array.isArray guard |

---

## Validation

- **Typecheck:** Clean (exit 0)
- **Tests:** 187/187 passed (10 test files)
- **Lint:** No new errors introduced

---

## Decisions Made

1. **QC-006 (workflow-loader):** Skip invalid activities entirely rather than embed raw objects. Rationale: invalid activities would fail workflow-level validation anyway, and embedding them creates a false sense of successful loading.

2. **QC-006 (activity-loader):** Retained raw decoded object fallback with explicit warning log. Rationale: standalone activity reads (via `readActivity`) serve a different purpose than batch loading — rejecting here would break the `get_skill`/`get_skills` chain for activities with minor schema drift.

3. **QC-010:** Manifest-only reads via `decodeToon<RawWorkflow>` instead of full `loadWorkflow`. Validated that all `listWorkflows` callers need only `{ id, title, version, description }`.

4. **QC-026:** Changed `StructuredResource.id/version` from `string` to `string | undefined`. The `''` sentinel was ambiguous — callers could not distinguish "no frontmatter" from "empty value".

---

## Lessons Learned

1. **Error handling audits surface patterns, not isolated bugs.** All 12 findings shared a common root: catch blocks that swallowed context. A single "log all catches" policy applied consistently would have prevented most of these.

2. **Manifest-only reads are worth the extra code.** The `listWorkflows` optimization required ~15 lines of new code but eliminates loading all activities for every workflow during listing — a significant reduction in work for the common case.
