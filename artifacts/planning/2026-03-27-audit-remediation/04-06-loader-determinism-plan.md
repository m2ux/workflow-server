# WP-06: Loader Determinism and Deduplication

## Scope

**In scope:**
- QC-007: Cross-workflow activity search nondeterministic
- QC-008: Cross-workflow skill search nondeterministic
- QC-021: `parseActivityFilename` duplicated verbatim
- QC-029: Dual-format resource priority nondeterministic
- QC-030: Contradictory meta-workflow filtering
- QC-084: Sort re-parses filenames inside comparator
- QC-085: Regex inconsistency between resource and activity/skill parsing
- QC-086: Unreachable defensive code
- QC-087: Unused `DEFAULT_ACTIVITY_WORKFLOW` constant
- QC-088: `readActivityIndex` double readdir
- QC-089: `readSkillIndex` double readdir
- QC-090: `padStart(2, '0')` breaks for 3+ digit indices

**Out of scope:**
- Error handling changes (WP-05)

**Files:** `src/loaders/activity-loader.ts`, `src/loaders/skill-loader.ts`, `src/loaders/resource-loader.ts`, `src/loaders/workflow-loader.ts`, `src/loaders/schema-loader.ts`

## Dependencies

- **WP-05** (loader error handling) — must merge first so determinism fixes are verifiable

## Effort

12 findings across 5 files. Medium scope.

## Success Criteria

- Cross-workflow searches produce identical results regardless of filesystem readdir order
- `parseActivityFilename` exists in one location, imported by both consumers
- Dual-format resources have defined priority (TOON over MD or configurable)
- Dead code and unused constants removed
- Double readdir calls eliminated
- `npm test` passes
