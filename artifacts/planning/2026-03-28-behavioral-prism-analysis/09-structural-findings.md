# Structural Analysis — PR #83

**PR:** [#83](https://github.com/m2ux/workflow-server/pull/83) — fix: resolve behavioral prism findings  
**Date:** 2026-03-29  
**Lens:** L12 (single-pass, moderate complexity)

---

## Module Dependency Changes

No new modules introduced. No new dependencies added. The PR adds one new import (`logWarn` in `trace.ts`) and one new import (`safeValidateSkill` in `skill-loader.ts`). Both are within existing module boundaries.

**New schemas defined (not new modules):**
- `RulesSchema` + `RulesSectionSchema` in `rules-loader.ts` — Defined inline in the loader rather than in a dedicated schema file. This is inconsistent with the pattern used by workflow, activity, skill, condition, and state schemas (all have dedicated `*.schema.ts` files).

### Structural Finding SF-01: RulesSchema placement

`RulesSchema` is defined in `src/loaders/rules-loader.ts` (lines 7-22) rather than in a dedicated `src/schema/rules.schema.ts` file. Every other content type's schema lives in `src/schema/`:

| Content Type | Schema Location |
|-------------|----------------|
| Workflow | `src/schema/workflow.schema.ts` |
| Activity | `src/schema/activity.schema.ts` |
| Skill | `src/schema/skill.schema.ts` |
| Condition | `src/schema/condition.schema.ts` |
| State | `src/schema/state.schema.ts` |
| **Rules** | **`src/loaders/rules-loader.ts` (inline)** |

**Recommendation:** Extract `RulesSchema` and `RulesSectionSchema` to `src/schema/rules.schema.ts` for consistency. Export `validateRules` and `safeValidateRules` functions following the pattern of other schema files. This also enables the RC-01 structural fix (decodeToon with schema) to import the schema cleanly.

---

## Cross-Cutting Pattern Consistency

### Catch Block Pattern

All 13 modified catch blocks follow a uniform template:
```typescript
} catch (error) {
  logWarn('Context message', {
    contextField,
    error: error instanceof Error ? error.message : String(error)
  });
  return fallback;
}
```

This is consistent and maintainable. The `error instanceof Error ? error.message : String(error)` pattern handles both Error objects and non-Error throws.

### Validation Pattern

Two different validation approaches are used in the PR:

1. **Inline schema + safeParse** (rules-loader): Schema defined locally, `safeParse()` called directly
2. **Imported safeValidate function** (skill-loader): Uses `safeValidateSkill()` from schema module

When RC-01 is implemented (schema parameter in `decodeToon`), both patterns collapse into the single `decodeToon(content, Schema)` call.

---

## API Surface Changes

No public API changes. All modifications are internal:
- `advanceToken` gains an optional third parameter (backward-compatible)
- `validateStatePath` gains an optional second parameter (backward-compatible)
- `RulesNotFoundError` constructor gains an optional message (backward-compatible)

---

## Summary

| Finding | Severity | Type |
|---------|----------|------|
| SF-01: RulesSchema placement inconsistency | Low | Structural — recommend extraction to dedicated schema file |

No architectural concerns. The PR is a set of targeted, independent fixes that don't alter module boundaries or dependency structure.
