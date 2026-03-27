# WP-09: Test Infrastructure

## Scope

**In scope:**
- QC-016: Shared mutable `sessionToken` cascading failures
- QC-017: No tests for malformed TOON data
- QC-018: Trace lifecycle sequential test dependencies
- QC-070–QC-078: 9 Medium-severity test findings (data coupling, unsafe casts, stale tokens, path resolution)
- QC-128–QC-133: 6 Low-severity test findings

**Out of scope:**
- Source code fixes (those are in WP-05–08)
- New feature tests

**Files:** `tests/mcp-server.test.ts`, `tests/workflow-loader.test.ts`, `tests/skill-loader.test.ts`, `tests/activity-loader.test.ts`, `tests/schema-loader.test.ts`, `tests/schema-validation.test.ts`, `tests/state-persistence.test.ts`, `tests/session.test.ts`, `tests/trace.test.ts`, `tests/rules-loader.test.ts`

## Dependencies

- **WP-05** through **WP-08** — source modules should be fixed before updating their tests

## Effort

18 findings across 10 files. Medium-large scope.

## Success Criteria

- No shared mutable state between test cases (`sessionToken` scoped per test or `beforeEach`)
- Malformed TOON fixture tests exercise parse-error paths
- All path resolution uses `import.meta.dirname` (no `process.cwd()`)
- `parseToolResponse` helper extracted, replacing ~30 repetitions
- Test assertions use structural properties (not hardcoded version strings or counts)
- `npm test` passes
