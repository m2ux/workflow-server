# Workflow Retrospective — #90 Eliminate rules.toon

**Date:** 2026-03-31

---

## What Went Well

- **Scope was well-defined from the start.** The user provided a clear 8-task breakdown with specific files and actions. This eliminated ambiguity and allowed skipping planning activities entirely.
- **Clean deletion pattern.** The change was primarily subtractive (-293 lines) with minimal additions. Subtractive changes carry lower risk since they reduce surface area rather than adding it.
- **Schema validation caught nothing because the design was right.** Both new skills validated against `SkillSchema.strict()` on first attempt — the existing skill patterns were well-understood and followed.
- **Tests passed throughout.** 252/252 at every checkpoint. No regressions introduced at any stage.

---

## What Could Improve

- **Planning activities were skipped.** While appropriate for this well-scoped task, the workflow doesn't have a formal "skip planning" path — it was handled by user instruction. A complexity-gated fast track could formalize this.
- **Submodule commit workflow adds friction.** Engineering artifacts and workflow data live in submodules requiring separate commit/push cycles. Three separate git contexts (parent, .engineering, workflows) made the commit process verbose.

---

## Lessons Learned

1. **Deletion refactors benefit from complete reference tracing.** Searching for all imports, exports, error codes, and test references before starting ensured nothing was orphaned.
2. **The diff review step caught a real issue.** The user identified during manual diff review that the help tool's hardcoded bootstrap guide should be externalized — this was a genuine improvement found through the review process, not just ceremony.
3. **Conservation law analysis is valuable for migration work.** Verifying that all 39 rules were accounted for (27 migrated to agent-conduct, 12 to session-protocol, 12 intentionally dropped) prevented silent information loss.
