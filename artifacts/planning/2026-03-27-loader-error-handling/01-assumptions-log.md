# Assumptions Log — Loader Error Handling and Validation

**Work Package:** WP-05  
**Date:** 2026-03-27

---

| ID | Assumption | Category | Resolution | Status |
|----|-----------|----------|------------|--------|
| A1 | Callers of `loadSkill`/`tryLoadSkill` already handle `null` returns gracefully | Code-resolvable | Verified: `readSkill` checks null and continues searching other directories. Callers of `readSkill` use `Result` type. | Confirmed |
| A2 | Changing `logInfo` to `logWarn` for parse errors has no side effects on log monitoring | Low-risk | Log level changes are safe; no alerting tied to `logInfo`. Both write to stderr as JSON. | Accepted |
| A3 | Returning `undefined` instead of `''` for missing frontmatter fields won't break callers | Code-resolvable | Verified: `readResourceStructured` uses `parseFrontmatter` and passes values into `StructuredResource`. Callers (`loadSkillResources`) serialize to JSON. `undefined` becomes absent field, `''` was empty. No caller checks `=== ''`. | Confirmed |
| A4 | `listWorkflows` callers only need manifest-level fields (id, title, version, description) | Code-resolvable | Verified: `help` tool uses `.map(w => ({ id: w.id, title: w.title, version: w.version }))`. `list_workflows` serializes entire entries. `health_check` uses `.length`. All callers need only `WorkflowManifestEntry` fields. | Confirmed |
| A5 | Making `index` activity filtering consistent won't break existing workflow navigation | Code-resolvable | Verified: no code calls `readActivity(dir, 'index')` directly. The `readActivityIndex` function calls `listActivities` which already filters index. Test confirms index is excluded from listing. | Confirmed |
