# WP-05: Loader Error Handling and Validation

## Scope

**In scope:**
- QC-005: Corrupt skill TOON silent null return
- QC-006: Raw decoded object used when validation fails
- QC-009: Catch-all converts ALL errors to ActivityNotFoundError
- QC-010: `listWorkflows` full-load performance issue
- QC-011: Invalid activity objects embedded into workflow
- QC-022: Parse error logged at wrong severity
- QC-023: Empty `catch {}` in `listWorkflows`
- QC-024: `readResourceRaw` empty catch
- QC-025: `conditionToString` missing Array.isArray guard
- QC-026: `parseFrontmatter` returns `''` for missing values
- QC-028: `index` activities filtering inconsistency
- QC-031: Intra-file error policy contradiction

**Out of scope:**
- Deterministic ordering (WP-06)
- Result type redesign (WP-08 addresses ValidationResult)

**Files:** `src/loaders/workflow-loader.ts`, `src/loaders/activity-loader.ts`, `src/loaders/skill-loader.ts`, `src/loaders/resource-loader.ts`, `src/loaders/rules-loader.ts`, `src/loaders/schema-loader.ts`

## Dependencies

None.

## Effort

12 findings across 6 files. Medium-large scope — error-handling changes propagate through call chains.

## Success Criteria

- No empty `catch {}` blocks in any loader file
- Validation failures are logged at `logWarn`/`logError` and returned as typed results
- `listWorkflows` decodes only workflow.toon for manifest fields (performance fix)
- Invalid activities are not embedded into workflow objects
- `npm run typecheck` and `npm test` pass
