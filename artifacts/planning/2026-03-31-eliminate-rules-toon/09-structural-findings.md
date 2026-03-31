# Structural Analysis — #90 Eliminate rules.toon

**Date:** 2026-03-31  
**Lens:** L12 (Single-pass structural analysis)

---

## Conservation Law

**Invariant:** All agent behavioral guidance accessible before was must remain accessible after.

| Before | After | Preserved? |
|--------|-------|------------|
| 39 rules in `rules.toon` returned by `start_session` | 39 rules split into `session-protocol` (12) and `agent-conduct` (27), accessible via `get_skills` | ✅ Yes (orchestration-relevant rules) |
| 3 IDE-specific sections (task-management, error-recovery, context-management) | Intentionally dropped — not workflow-server domain | ✅ By design |
| `start_session` returns `{ rules, workflow, session_token }` | Returns `{ workflow, session_token }` | ✅ Intentional removal |
| `help` tool returns inline JSON bootstrap guide | Returns externalized markdown from `meta/resources/09` | ✅ Content preserved, format changed |

**Conclusion:** No unintended information loss. The 12 rules dropped were IDE-specific guidance explicitly scoped out of the workflow server.

---

## Meta-Law

**Structural consistency:** All behavioral guidance follows the same delivery path.

| Before | After |
|--------|-------|
| 2 delivery mechanisms (rules-loader + skill-loader) | 1 delivery mechanism (skill-loader only) |
| `start_session` couples session creation with rules loading | `start_session` is pure session creation |
| `help` tool has hardcoded bootstrap JSON | `help` tool loads from versioned resource |

The change reduces architectural complexity by eliminating a parallel code path.

---

## Classified Bug Table

| # | Classification | Description | Severity | Location |
|---|---------------|-------------|----------|----------|
| 1 | Missing EOF newline | `src/errors.ts` and `src/loaders/index.ts` missing trailing newline | Cosmetic | Both files |
| 2 | Hardcoded resource index | `readResourceRaw(config.workflowDir, 'meta', '09')` uses magic string | Low | `workflow-tools.ts:31` |

No functional bugs identified.
