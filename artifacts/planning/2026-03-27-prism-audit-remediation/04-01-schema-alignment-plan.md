# WP-01: Schema Alignment

**Package:** Schema Alignment
**Priority Group:** P0–P3
**Estimated Effort:** 2–3 hours agentic + 30 min review

---

## Scope

### In Scope

| Finding | Description | Severity |
|---------|-------------|----------|
| F-01 | Add `sessionTokenEncrypted` to JSON Schema `stateSaveFile` properties and `required` array | HIGH |
| F-02 | Align `triggers` type: change Zod from single object to array matching JSON Schema | MEDIUM |
| F-03 | Remove `stateVersion` maximum (1000) from JSON Schema, since `addHistoryEvent` uses it as an event counter | MEDIUM |
| F-10 | Make `currentActivity` optional in Zod with refinement for running states, matching JSON Schema `if/then` | LOW |
| F-11 | Resolve `stateVersion` semantic collision: rename or fix increment behavior so semantics match documentation | LOW |
| F-13 | Update stale comment in `workflow.schema.ts:54-55` that incorrectly says "Not in JSON Schema" | LOW |

### Out of Scope

- Automated schema generation (`zod-to-json-schema` pipeline) — separate future initiative
- Changes to loader behavior (WP-02)
- `ExecutionPatternSchema` wiring into `SkillSchema` (WP-02, since it requires test updates)

## Dependencies

- **None** — this package can start immediately
- **Downstream:** WP-02 depends on WP-01 completing first

## Tasks

1. **F-01**: Add `sessionTokenEncrypted: { "type": "boolean" }` to `state.schema.json` `stateSaveFile.properties` and add to `required` array
2. **F-02**: Change `activity.schema.ts` `triggers` from `WorkflowTriggerSchema.optional()` to `z.array(WorkflowTriggerSchema).optional()`
3. **F-03**: Remove `"maximum": 1000` from `state.schema.json` `stateVersion` definition
4. **F-10**: Change `state.schema.ts` `currentActivity` from `z.string()` to `z.string().optional()` and add a `.refine()` that requires it when status is running/paused/suspended
5. **F-11**: Update `state.schema.json` description of `stateVersion` from "State schema version for migration support" to "Monotonically increasing state sequence number" or rename the field
6. **F-13**: Update comment at `workflow.schema.ts:54-55` to accurately describe the relationship between Zod and JSON Schema for `activities`
7. Run `npm run typecheck` and `npm test` — fix any type errors or test failures from the changes

## Success Criteria

- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm test` passes with all tests green
- [ ] JSON Schema `stateSaveFile` includes `sessionTokenEncrypted` in properties and required
- [ ] Zod `triggers` field accepts arrays (matching JSON Schema)
- [ ] `stateVersion` has no maximum in JSON Schema
- [ ] `currentActivity` is optional in Zod (with conditional requirement via refine)
- [ ] No stale comments about JSON Schema content

## Risk

- **F-10 refinement complexity**: Zod refinements for conditional required fields can be verbose. If the refinement proves unwieldy, an alternative is to keep `currentActivity` as `z.string()` and update the JSON Schema to match (remove the `if/then`).
