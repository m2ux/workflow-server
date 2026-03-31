# Code Review — #90 Eliminate rules.toon

**Reviewer:** Automated  
**Branch:** `refactor/90-eliminate-rules-toon`  
**Date:** 2026-03-31  

---

## Summary

Clean removal of the standalone rules-loading subsystem. Changes are deletion-heavy (-293/+19) and well-scoped to the stated objective. The remaining code compiles and passes all tests.

---

## Findings

### Severity: Low

| # | File | Finding | Recommendation |
|---|------|---------|----------------|
| 1 | `src/errors.ts` | Missing trailing newline after `ActivityNotFoundError` class closing brace. The diff shows `}` with `\ No newline at end of file`. | Add trailing newline. Cosmetic only. |
| 2 | `src/loaders/index.ts` | Same — missing trailing newline at EOF. | Add trailing newline. |
| 3 | `src/tools/workflow-tools.ts:31` | `readResourceRaw` is called with hardcoded index `'09'` for the help bootstrap resource. If the meta resource numbering changes, this silently breaks. | Acceptable for now — the resource index is stable and owned by the same workflow. A constant would improve readability but isn't required. |

### Severity: Informational

| # | File | Observation |
|---|------|-------------|
| 4 | `src/tools/workflow-tools.ts:37` | Graceful degradation: if the bootstrap resource can't be loaded, the help response omits it rather than erroring. This is correct behavior for a non-critical resource. |
| 5 | `src/tools/resource-tools.ts` | `start_session` handler is now 30 lines (down from ~45). Clear, single-responsibility: load workflow, create token, optionally trace, return response. |
| 6 | `tests/mcp-server.test.ts` | Help test now validates the externalized guide content by checking for `start_session` and `get_skills` strings. Good behavioral assertion rather than structural. |
| 7 | Deleted files | `rules-loader.ts` (62 lines), `rules.schema.ts` (24 lines), `rules-loader.test.ts` (158 lines) — all cleanly removed with no orphaned references. |

---

## Verdict

**All findings are low or informational.** No critical or high-severity issues. The implementation achieves the stated goal with minimal risk.

Recommended action: **all-acceptable** — proceed to validation.
