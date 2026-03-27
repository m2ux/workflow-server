# Test Plan — WP-03: Zod Schema Alignment

## Automated Tests

### Pre-existing Tests (must pass)

- `tests/schema-validation.test.ts` — validates all schema parsing
- `tests/schema-loader.test.ts` — validates schema loading
- `tests/workflow-loader.test.ts` — validates workflow assembly
- `tests/activity-loader.test.ts` — validates activity loading
- `tests/skill-loader.test.ts` — validates skill loading
- `tests/session.test.ts` — validates session management
- `tests/state-persistence.test.ts` — validates state save/load
- `tests/mcp-server.test.ts` — validates MCP server
- `tests/trace.test.ts` — validates execution traces
- `tests/rules-loader.test.ts` — validates rules loading

### Verification Steps

1. **Typecheck**: `npm run typecheck` — must pass with zero errors
2. **Test suite**: `npm test` — all existing tests must pass
3. **Import chain**: Verify `common.ts` exports are correctly imported by all three schema files

## Manual Verification

### QC-012: CheckpointSchema new fields

- Parse a checkpoint with `defaultOption` and `autoAdvanceMs` — should succeed
- Parse a checkpoint without these fields — should succeed (optional)

### QC-040: ArtifactSchema action field

- Parse an artifact with `action: 'create'` — should succeed
- Parse an artifact with `action: 'update'` — should succeed
- Parse an artifact without action — should succeed (defaults to 'create')

### QC-042: Skill .passthrough() removal

- Parse a skill with unknown extra properties — properties should be stripped
- Existing skill TOON loading should continue to work

### QC-043: Loose equality

- `evaluateSimpleCondition({ type: 'simple', variable: 'x', operator: '==', value: 1 }, { x: '1' })` should return `true` (loose equality)

## Test Command

```bash
nice -n 19 npm run typecheck && nice -n 19 npm test
```
