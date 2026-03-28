# WP-02: Validation Enforcement

**Package:** Validation Enforcement
**Priority Group:** P1–P2
**Estimated Effort:** 3–4 hours agentic + 45 min review

---

## Scope

### In Scope

| Finding | Description | Severity |
|---------|-------------|----------|
| F-05 | Add Zod validation in `tryLoadSkill()` — call `safeValidateSkill` after `decodeToon` | MEDIUM |
| F-06 | Fix `readActivityFromWorkflow()` validation fallthrough — return error on failure instead of serving raw data | MEDIUM |
| F-07 | Fix `readActivityIndex()` validation fallthrough — skip invalid activities instead of including them | MEDIUM |
| F-08 | Update tests that depend on validation bypass (e.g., `skill-loader.test.ts` accessing `execution_pattern`) | MEDIUM |
| F-09 | Wire orphaned `ExecutionPatternSchema` into `SkillSchema` so production TOON data validates correctly | MEDIUM |

### Out of Scope

- Schema field changes (handled in WP-01)
- Condition evaluation fix (WP-03)
- `_meta` response schema (WP-03)

## Dependencies

- **WP-01 must be complete** — skill schema must include `ExecutionPatternSchema` before `tryLoadSkill` enforces Zod validation, otherwise tests that access `execution_pattern` will fail with no fix path

## Tasks

1. **F-09**: Wire `ExecutionPatternSchema` into `SkillSchema` — add `execution_pattern: ExecutionPatternSchema.optional()` to the Zod skill schema definition
2. **F-05**: Add `safeValidateSkill(decoded)` call in `tryLoadSkill()` at `skill-loader.ts:77-78`. On failure, return `null` (matching the existing error pattern in `tryLoadSkill`)
3. **F-06**: Change `readActivityFromWorkflow()` at `activity-loader.ts:115-120` — on validation failure, return `err(new ActivityNotFoundError(...))` instead of `decoded`, matching `workflow-loader.ts:42-47`
4. **F-07**: Change `readActivityIndex()` at `activity-loader.ts:244-245` — on validation failure, log warning and `continue` (skip the invalid activity), matching `workflow-loader.ts:43-45`
5. **F-08**: Update `skill-loader.test.ts:83` and any other tests that access `execution_pattern` — either test via the now-schema-declared field or restructure assertions
6. Run `npm run typecheck` and `npm test` — fix cascading failures from newly enforced validation

## Execution Order

Tasks must be done in order: F-09 first (add field to schema), then F-05 (enable validation), then F-08 (fix tests), then F-06/F-07 (activity loader). This is the controlled cascade order from the prism synthesis.

## Success Criteria

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes
- [ ] `tryLoadSkill` calls `safeValidateSkill` and rejects invalid skills
- [ ] `readActivityFromWorkflow` returns error on validation failure (no fallthrough)
- [ ] `readActivityIndex` skips invalid activities (no fallthrough)
- [ ] No test accesses undeclared schema properties
- [ ] `SkillSchema` includes `execution_pattern` field

## Risk

- **Cascading test failures**: Enabling skill validation may reveal additional tests that depend on unvalidated properties. The task order (schema → validation → tests) minimizes surprise.
- **TOON file compatibility**: If production TOON skill files contain fields not in the schema, Zod's default `.strip()` behavior will silently remove them. This is correct behavior but may surface as missing data in tool responses if consumers expected those fields.
