# Code Review — PR #93

**Date:** 2026-04-01  
**Reviewer:** Worker agent  
**Scope:** `src/tools/resource-tools.ts`, `tests/mcp-server.test.ts`

---

## Summary

Clean implementation of three coordinated features: agent-id meta-skill loading, cross-workflow resource prefix resolution, and per-skill resource nesting. 200 lines added, 38 removed across 2 files. No critical or high-severity findings.

---

## Findings

### F1 — Silent drop of unresolvable cross-workflow resources (LOW)

**Block:** #2 (`loadSkillResources`, lines 35-41)  
**Description:** When `readResourceStructured` fails for a cross-workflow reference (e.g., `meta/99`), the resource is silently excluded from `_resources` with no logging at this level. `readResourceRaw` only logs on I/O errors (catch block), not on "no file matches index" — that path returns `err(ResourceNotFoundError)` without logging.  
**Impact:** Misconfigured TOON resource references produce no diagnostic output. Debugging requires checking which resources a skill declares vs. which appear in `_resources`.  
**Recommendation:** Consider adding a `logWarn` in `loadSkillResources` when `result.success` is false, logging the failed reference and target workflow. This maintains the best-effort aggregation pattern while adding visibility.

### F2 — `parseResourceRef` accepts multi-segment paths without validation (INFO)

**Block:** #1 (`parseResourceRef`, lines 20-26)  
**Description:** `parseResourceRef` splits on the first `/` only. A reference like `a/b/c` produces `{ workflowId: "a", index: "b/c" }`. The `index: "b/c"` would then be passed to `readResourceStructured` as a resource index, which would fail to match any file (resource indices are numeric).  
**Impact:** No practical impact — TOON files only use `workflow/NN` format and bare numeric indices. Malformed references silently fail (see F1).  
**Recommendation:** No action needed. The natural behavior is safe — invalid indices fail to match, and the resource is excluded.

### F3 — `bundleSkillWithResources` uses destructuring spread on `unknown` (INFO)

**Block:** #3 (`bundleSkillWithResources`, lines 51-58)  
**Description:** The function casts `skillValue` to `Record<string, unknown>` and destructures with `{ resources: _stripped, ...rest }`. If `skillValue` has a prototype chain, non-enumerable properties would be lost. However, skill values come from `decodeToon` which produces plain objects.  
**Impact:** None in practice — TOON-decoded objects are plain. The type cast is consistent with the pattern used elsewhere in the file (e.g., `loadSkillResources` line 30).  
**Recommendation:** No action needed.

### F4 — `isNewAgent` detection uses strict inequality (INFO)

**Block:** #5 (`get_skills` handler, line 126)  
**Description:** `const isNewAgent = agent_id !== undefined && agent_id !== token.aid;` — this correctly handles: (a) omitted `agent_id` → false (backward compat), (b) first call with `agent_id` when `aid` is `''` → true, (c) same `agent_id` → false, (d) different `agent_id` → true.  
**Impact:** Positive — the logic cleanly covers all four cases.  
**Recommendation:** No action needed. Clean logic.

---

## Positive Observations

1. **Backward compatibility preserved:** Omitting `agent_id` produces identical behavior to pre-PR code. The else branch (line 143-147) is unchanged.
2. **Consistent use of Set for deduplication:** The `new Set([...universalIds, ...activitySkills])` pattern in the `isNewAgent` branch mirrors the workflow-scope branch.
3. **Clean separation of concerns:** `parseResourceRef`, `loadSkillResources`, and `bundleSkillWithResources` are independent, testable units.
4. **Minimal token surface change:** Only `aid` update via existing `advanceToken` mechanism — no new token fields or schema changes.

---

## Verdict

**All findings acceptable.** One low-severity finding (F1: silent resource drop) is a pre-existing pattern (best-effort aggregation). Three informational findings require no action. No code fixes recommended.
