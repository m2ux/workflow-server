# WP-02 Completion Summary

**Completed:** 2026-03-27
**PR:** [#69](https://github.com/m2ux/workflow-server/pull/69)
**Branch:** fix/wp02-json-schema-corrections

---

## Deliverables

### Schema Changes (commit `e4fb4b3`)

| Finding | Severity | File | Change |
|---------|----------|------|--------|
| QC-001 | Critical | workflow.schema.json | Added `activities` array property, added to `required` |
| QC-013 | High | condition.schema.json | Fixed recursive `$ref` for `and`/`or`/`not` conditions |
| QC-061 | Medium | activity.schema.json | `additionalProperties: true` → `false` |
| QC-062 | Medium | skill.schema.json | `additionalProperties: true` → `false` (root) |
| QC-065 | Medium | state.schema.json | `currentActivity` conditionally required via `if`/`then` |
| QC-066 | Medium | All 5 files | Added `$id` for explicit `$ref` resolution |
| QC-067 | Medium | activity.schema.json | `setVariable` value types constrained |
| QC-068 | Medium | condition.schema.json | Documented array/object type exclusion |
| QC-069 | Medium | workflow/activity/skill | Cross-referenced `rules` type differences |
| QC-122 | Low | activity.schema.json | `triggers` changed to array type |
| QC-123 | Low | skill.schema.json | 15 sub-definitions → `additionalProperties: false` |
| QC-124 | Low | workflow.schema.json | `mode.defaults` values typed |
| QC-125 | Low | state.schema.json | `stateVersion` bounded (max 1000) |
| QC-126 | Low | state.schema.json | State `variables` + related fields typed |
| QC-127 | Low | skill.schema.json | `rulesDefinition` description cross-references |

### Metrics

- **Files changed:** 5
- **Lines:** +76 −35
- **Tests:** 187/187 passing
- **Typecheck:** Clean

---

## Decisions Made

1. **A-001 (additionalProperties):** Stakeholder chose Option C — strict (`false`) for both activity and skill schemas. Rationale: "Workflow review should catch non-compliance."
2. **A-002 (condition value types):** Do NOT expand to array/object. Runtime uses `===` which cannot compare these by value.
3. **A-004 (rules type collision):** Keep both forms (string[] for workflow/activity, object for skill). Document the difference.
4. **QC-122 (triggers):** Changed to array type (aligns plural name with type).
5. **QC-065 (currentActivity):** Used `if`/`then` conditional rather than making fully optional.

---

## Follow-up Items

| Item | Target WP |
|------|-----------|
| Align Zod schemas for `triggers` (array), `additionalProperties` (strict) | WP-03 |
| Add negative test cases for JSON Schema validation (condition recursion, extra properties) | WP-09 |
| Verify existing TOON files conform to `additionalProperties: false` | WP-12 |

---

## Lessons Learned

1. The runtime Zod schemas and JSON Schema files had silently diverged — the Zod schema already had `activities` but the JSON Schema didn't. This divergence was only caught by the audit.
2. Investigating the runtime condition evaluator before expanding schema types (A-002) prevented a false-promise bug.
3. Stakeholder involvement on the `additionalProperties` question (A-001) was critical — the "extensibility vs strictness" trade-off has legitimate arguments on both sides and is ultimately a project philosophy choice.
