# Test Suite Review — Token Use Tracking (#232)

## Coverage Map (diff-aware)

| Changed symbol / surface | Test callers | Gap? |
|--------------------------|--------------|------|
| `estimateCost`, `deriveTotalTokens`, `mergeActivityUsage`, `sumUsageTree`, `recordActivityUsage` | `tests/usage.test.ts` | Covered (PR233-TC-05..08) |
| `SessionFile.usage` schema, `usage_recorded` event | `tests/session-schema.test.ts` | Covered (PR233-TC-01..03) |
| `TOP_LEVEL_KEY_PRIORITY` + `usage` | `tests/session-store.test.ts` | Covered (PR233-TC-04) |
| `loadConfig` price table + version | `tests/config.test.ts` | Covered (PR233-TC-09) |
| `next_activity` usage param E2E | `tests/mcp-server.test.ts` | Written (PR233-TC-10..12, TC-15); requires `workflows` worktree at test runtime |
| Child usage in parent `workflowTotal` at completion | `tests/usage.test.ts` (`sumUsageTree` only) | **PR233-TC-14 integration gap** — unit tree walk covered; no `dispatch_child` + terminal + `finalizeUsageTree` integration test |
| Generated schema sync | `tests/generated-schemas.test.ts` (repo) | Assumed by plan TC-16; schemas modified in diff |
| Completion artifact `NN-token-usage.md` | — | PR233-TC-17 corpus-side; out of server test scope |

## Test Run Baseline

| Suite | Result | Notes |
|-------|--------|-------|
| `tests/usage.test.ts` | ✅ 9/9 pass | Pure helper coverage |
| `tests/config.test.ts` | ✅ 14/14 pass (incl. PR233-TC-09) | |
| `tests/session-schema.test.ts` | ✅ 30/30 pass (incl. PR233-TC-01..03) | |
| `tests/session-store.test.ts` | ✅ 30/30 pass (incl. PR233-TC-04) | |
| `tests/mcp-server.test.ts` PR233 filter | ❌ 4/4 fail in isolated run | `Workflow not found: work-package` — feature worktree lacks `workflows` git worktree; not a usage-logic failure |

**Recommendation:** Run full `npm test` from a properly configured worktree (`git worktree add ./workflows workflows`) before validation merge.

## Findings

### Nit

| ID | Severity | File | Finding | Recommendation |
|----|----------|------|---------|----------------|
| TR-1 | Nit | `tests/mcp-server.test.ts` | PR233 integration tests depend on workflow corpus availability; fail opaquely when `workflows/` missing. | Document in test plan Running Tests section; CI should ensure worktree. |
| TR-2 | Nit | `tests/usage.test.ts` | All `estimateCost` examples use `claude-sonnet-5` — mirrors Anthropic defaults, not harness-neutral fixtures. | Add one test with a synthetic model id `{ "custom-model": { input: 1, output: 2 } }` to prove table agnosticism. |

### Informational

| ID | Severity | File | Finding | Recommendation |
|----|----------|------|---------|----------------|
| TR-3 | Informational | — | PR233-TC-14 (dispatch child → parent completion roll-up) not implemented as integration test; TC-08 unit test partially satisfies SC-5. | Add integration test before merge or accept TC-08 + manual verification. |
| TR-4 | Informational | — | PR233-TC-13 (`workflowTotal` stamp with `priceTableVersion` on roll-up) not explicitly asserted in integration tests; per-activity stamp covered by TC-10. | Optional assertion on `inspect_session` `view: usage` after multi-activity path. |

## Summary

Test quality is solid for pure helpers and schema layers. Integration tests are well-specified but environment-dependent. No Critical/High/Medium test defects. Two Nits on fixture neutrality (aligns with stakeholder harness-agnostic concern). TC-14 integration gap is documented; unit coverage for `sumUsageTree` mitigates risk.
