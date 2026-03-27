---
target: tests/ (10 files, ~2,648 LOC)
analysis_date: 2026-03-27
lens: L12 structural (meta-conservation law)
analysis_focus: Quality and consistency audit
files_analyzed:
  - tests/rules-loader.test.ts (78 LOC)
  - tests/trace.test.ts (203 LOC)
  - tests/workflow-loader.test.ts (209 LOC)
  - tests/session.test.ts (186 LOC)
  - tests/schema-validation.test.ts (332 LOC)
  - tests/mcp-server.test.ts (919 LOC)
  - tests/schema-loader.test.ts (62 LOC)
  - tests/skill-loader.test.ts (189 LOC)
  - tests/state-persistence.test.ts (298 LOC)
  - tests/activity-loader.test.ts (172 LOC)
---

# L12 Structural Analysis: tests/

## Claim

**The test suite's deepest structural problem is diagnostic opacity: test failures cannot distinguish between code regressions and data evolution because tests bind code-behavior assertions to mutable workflow data values without an intermediate contract that isolates what is being tested.**

Evidence: 8 of 10 test files depend on `WORKFLOW_DIR` pointing to actual workflow files on disk. The only truly self-contained unit tests are `session.test.ts` and `trace.test.ts`. Tests hardcode expected values drawn from workflow data (`version: '3.4.0'`, `activities.length === 14`, `title: 'Work Package Implementation Workflow'`) that are properties of the *data*, not of the *loader logic* being tested. When these values change through normal workflow evolution, tests fail with the same signal as a genuine code regression — the test suite cannot tell the developer which kind of failure occurred.

## Dialectic

### Expert 1 — Defender

The coupling to filesystem state is the central problem. When workflow data changes (new activities added, versions bumped), tests break not because code is broken but because hardcoded expectations are stale. The test suite cannot distinguish "loader broke" from "workflow data evolved." This makes the tests fragile maintenance targets rather than safety nets. Concrete proof: `workflow-loader.test.ts:47` asserts `activities.length === 14` — this is a change-detector, not a regression test.

### Expert 2 — Attacker

This coupling is intentional and correct for a workflow server. The loaders' job IS to read specific workflow files. Testing against real data is an integration test by design. The codebase already separates concerns: `schema-validation.test.ts` tests Zod schemas in isolation with constructed data; `session.test.ts` and `trace.test.ts` test pure logic with no filesystem dependency. The "problem" is actually well-managed test coverage discipline — integration tests SHOULD pin to real data. The alternative (synthetic fixtures) creates a parallel maintenance burden and can diverge from reality.

### Expert 3 — Assumption Prober

Both take for granted that the "unit vs integration" axis is the right diagnostic lens. The real question is: when a test fails, does the failure message tell you *what to fix*? In the current structure, a failure in `rules-loader.test.ts` (which reads real `rules.toon`) tells you EITHER the loader code broke OR the data file changed — but the test output doesn't say which. The missing concept is not unit-vs-integration but **diagnostic specificity** — the ability of a single test failure to identify the root cause without additional investigation.

### Claim Transformation

The gap between original claim and transformed claim: the initial framing was *coupling-to-filesystem*. The transformed claim is *diagnostic opacity*. Even if all tests used in-memory fixtures, the tests would still lack diagnostic power if they assert on data values rather than behavioral contracts. The filesystem dependency is a symptom; the diagnostic opacity is structural.

## Concealment Mechanism

**Name: Assertion Specificity Theater**

The tests appear thorough because they check specific values — exact version strings, exact counts, exact titles. This specificity creates confidence but conceals the real problem: the tests verify that the code *reads certain data*, not that it *handles data correctly in general*. When the data changes, the test "catches" a non-bug. The developer must then manually verify whether the test should be updated or the code fixed — but nothing in the test structure assists this determination.

The mechanism operates by making tests look precise (exact values) while actually making them brittle. Every specific assertion simultaneously serves as a regression test AND a change detector for workflow data. Nothing in the test code distinguishes which role a given assertion plays.

### Concealment Applied

| File | Line | Assertion | What It Actually Tests |
|------|------|-----------|----------------------|
| `workflow-loader.test.ts` | 36 | `expect(workPackage?.version).toBe('3.4.0')` | Tests data content, not parsing logic |
| `workflow-loader.test.ts` | 47 | `expect(result.value.activities.length).toBe(14)` | Tests activity count, not array loading |
| `skill-loader.test.ts` | 58 | `expect(result.value.version).toBe('3.0.0')` | Tests data content, not version parsing |
| `mcp-server.test.ts` | 171 | `expect(workflow.version).toBe('3.4.0')` | Duplicates same data dependency |
| `schema-loader.test.ts` | 16 | `expect(ids.length).toBe(5)` | Tests schema count, not listing logic |
| `mcp-server.test.ts` | 55 | `expect(guide.available_workflows.length).toBeGreaterThanOrEqual(2)` | Slightly better (≥), still data-coupled |
| `activity-loader.test.ts` | 113 | `expect(result.value.activities.length).toBeGreaterThanOrEqual(14)` | Uses ≥, but still pins to data |

## First Improvement (Concealment-Deepening)

**Proposal:** Replace all hardcoded data expectations with snapshot testing.

```typescript
// Before (current — workflow-loader.test.ts:41-49):
const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
expect(result.success).toBe(true);
if (result.success) {
  expect(result.value.id).toBe('work-package');
  expect(result.value.activities.length).toBe(14);
  expect(result.value.initialActivity).toBe('start-work-package');
}

// After (improvement):
const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
expect(result.success).toBe(true);
if (result.success) {
  expect(result.value).toMatchSnapshot({
    id: expect.any(String),
    version: expect.stringMatching(/^\d+\.\d+\.\d+$/),
    activities: expect.arrayContaining([
      expect.objectContaining({ id: expect.any(String) }),
    ]),
  });
}
```

This passes code review: it removes hardcoded values, uses structural matchers, appears more maintainable. But it **deepens concealment** because:

1. Snapshot files become the new hidden data dependency — they silently encode the current state of workflow data in `.snap` files that are committed but rarely reviewed
2. `toMatchSnapshot` makes updating expectations trivial (`vitest --update`), which means test failures get *dismissed* rather than *investigated*
3. The distinction between "code behavior assertion" and "data shape assertion" becomes even more invisible — everything is a snapshot

### Three Properties Visible Only Through Strengthening

1. **The assertion intent problem**: No test includes metadata or comments declaring "this assertion tests loader behavior" vs. "this assertion verifies data content." The distinction exists only in the developer's mind. Both the current code and the snapshot improvement treat all assertions identically.

2. **The test data ownership problem**: The `workflows/` directory is shared between the running application and the test suite, but nobody owns the contract between them. There is no `test-fixtures/` directory with controlled, version-pinned data. Any change to `workflows/` has unbounded blast radius into the test suite.

3. **The update cascade problem**: When someone updates `workflows/work-package/workflow.toon`, they must also update tests in `workflow-loader.test.ts`, `mcp-server.test.ts`, and potentially `activity-loader.test.ts` — but nothing tells them which tests to update. The cascade is invisible until CI fails.

## Diagnostic on the First Improvement

The snapshot improvement conceals: **the fact that tests serve two incompatible purposes simultaneously — regression detection and behavioral specification**. Snapshots automate regression detection but make specification invisible. The expected behavior is encoded in a binary `.snap` file, not in readable assertions a developer can reason about.

The property of the original problem visible only because the improvement recreates it: **the test suite lacks a behavioral specification layer**. In the original code, at least the hardcoded values serve as rough documentation (even if coupled to data). In the snapshot version, even that rough specification vanishes into opaque files.

## Second Improvement

**Proposal:** Separate test layers with synthetic fixtures for unit tests and behavioral-only assertions for integration tests.

```typescript
// unit/workflow-loader.test.ts — synthetic fixtures, high precision
const FIXTURE_DIR = join(__dirname, '__fixtures__');
// Contains minimal workflow.toon with known, controlled values

it('should parse workflow with activities array', async () => {
  const result = await loadWorkflow(FIXTURE_DIR, 'test-workflow');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.activities.length).toBe(2); // controlled fixture
  }
});

// integration/workflow-loader.integration.test.ts — real data, structural assertions
it('should load real work-package workflow', async () => {
  const result = await loadWorkflow(WORKFLOW_DIR, 'work-package');
  expect(result.success).toBe(true);
  if (result.success) {
    expect(result.value.id).toBe('work-package');
    expect(result.value.activities.length).toBeGreaterThan(0);
    expect(result.value.initialActivity).toBeDefined();
  }
});
```

### Diagnostic on the Second Improvement

This improvement reveals: the test suite cannot be cleanly split because the loaders have **environment-dependent behavior** — they read TOON files, resolve paths, handle missing files — and the "unit" behavior (parsing, validation) is inseparable from the "integration" behavior (file I/O) at the current abstraction level.

The loaders expose functions like `loadWorkflow(dir: string, id: string)` that merge I/O + parsing + validation into a single call. There is no `parseWorkflow(data: unknown): Result<Workflow>` function that could be tested with synthetic data. The coupling is architectural, not test-structural. Splitting tests without splitting the loader code creates test fixtures that must replicate the TOON file format, directory structure, and naming conventions — effectively duplicating the I/O layer inside the test.

## Structural Invariant

**The property that persists through every improvement**: Tests that verify data-loading code must simultaneously know what the data looks like AND how the code processes it, because the code's correctness is defined relative to the data it processes.

You cannot test a loader without data. You cannot control test data without duplicating it. You cannot duplicate it without creating a maintenance burden. You cannot avoid the maintenance burden without coupling to production data. This cycle is irreducible.

**The invariant**: Data-coupled tests oscillate between brittleness (hardcoded expectations) and vacuity (structural-only assertions) — there is no stable middle ground within a single test layer.

## Inverted Invariant

**Design where the impossible property becomes trivially satisfiable**: Make loaders pure functions that accept pre-parsed data structures (not file paths) and test them with builder-pattern test data.

```typescript
// Loader API becomes:
export function parseWorkflow(data: unknown): Result<Workflow>
// Instead of:
export function loadWorkflow(dir: string, id: string): Result<Workflow>

// Tests become:
import { buildWorkflow } from '../test-utils/builders';

it('should validate workflow with activities', () => {
  const data = buildWorkflow({ activityCount: 3 });
  const result = parseWorkflow(data);
  expect(result.success).toBe(true);
  expect(result.value.activities).toHaveLength(3);
});
```

**New impossibility created**: You lose the ability to test that the file-reading, path-resolution, and TOON-parsing pipeline works correctly end-to-end. The integration seam moves from "tests vs production data" to "pure parsing vs I/O pipeline." The I/O pipeline becomes untested — or requires its own integration tests, recreating the original problem at a different layer.

## Conservation Law

### Test Precision × Data Independence = Constant

You cannot increase the precision of test assertions (how specifically they verify behavior) without increasing coupling to specific data values. You cannot increase data independence (tests that work regardless of data content) without decreasing assertion specificity.

**Predictions:**

| Operating Point | Precision | Independence | Example in Suite |
|----------------|-----------|--------------|-----------------|
| High precision, low independence | High | Low | `workflow-loader.test.ts:36` — `toBe('3.4.0')` |
| Low precision, high independence | Low | High | `schema-loader.test.ts:25` — `toBeDefined()` |
| Moderate both | Medium | Medium | `mcp-server.test.ts:55` — `toBeGreaterThanOrEqual(2)` |
| Impossible | High | High | Would require contract-based testing with synthetic data AND real-data validation |

The law predicts that no single test can be simultaneously highly specific about expected values AND immune to data changes — unless the test controls its own data (which introduces a maintenance burden that is the "cost" side of the conservation equation).

## Meta-Analysis of the Conservation Law

### What the Law Conceals

The conservation law frames the problem as a continuous trade-off, suggesting the solution is to find the "right balance point" on the precision-independence spectrum. This framing conceals that the trade-off itself is an artifact of the loader architecture.

Loaders that expose separate `read(path) → rawData` and `parse(rawData) → Result<T>` interfaces would make the conservation law trivially solvable for the parsing layer: synthetic data gives both high precision AND full independence. The law would still apply to the I/O layer — but the I/O layer needs only low-precision assertions ("file exists, reads without error, returns valid TOON"), which is the easy end of the trade-off.

### Structural Invariant of the Law

Even if the loader is decomposed into I/O + parsing layers, each layer independently obeys the conservation law. Decomposition doesn't eliminate the trade-off — it localizes it to layers where one side of the trade-off is naturally acceptable.

### Inverted Invariant of the Law

Design a system where decomposition changes the trade-off itself: **contract testing**. A contract defines the interface between layers. Each layer is tested against the contract. The contract is the single source of truth. Neither code nor tests own the expected values — the contract does. The contract can evolve independently, and both sides verify against it.

New impossibility: the contract becomes a third artifact that must be maintained alongside code and data. If the contract diverges from either, the system produces false confidence. The meta-trade-off is: **single-source-of-truth simplicity × verification completeness = constant**.

## Meta-Law

**The test suite's diagnostic power is inversely proportional to the number of distinct concerns verified per assertion — and the current loader architecture makes it impossible to test exactly one concern per assertion because each loader function merges I/O, parsing, and validation into a single call.**

This is not a generalization of the conservation law (precision × independence). It is what the conservation law conceals about this specific codebase: the conservation law suggests the problem is *where to position on a trade-off curve*. The meta-law reveals that the trade-off curve itself is unnecessarily constrained by the loader API design. Loaders with separated concerns would shift the curve, making high-precision-high-independence tests possible for the parsing concern.

### Concrete Testable Consequence

Add a new activity to the `work-package` workflow. The meta-law predicts:

1. `workflow-loader.test.ts:47` (`activities.length === 14`) will fail
2. At least one test in `mcp-server.test.ts` that depends on activity count or workflow structure will need updating
3. `activity-loader.test.ts:113` (`activities.length >= 14`) will continue to pass (it uses `>=`), demonstrating that tests at the "low precision" end of the conservation law survive data changes
4. The developer will need to investigate each failure to determine if it represents a real bug or a data evolution — the test output will not distinguish the two

This cascade is structural until the loaders expose a parsing-only interface that tests can exercise with controlled data.

## Bug Table

| # | Location | What Breaks | Severity | Classification |
|---|----------|-------------|----------|---------------|
| 1 | `workflow-loader.test.ts:36` | `toBe('3.4.0')` fails when workflow version bumps | Medium | **Structural** — conservation law predicts this is inherent to data-coupled precision |
| 2 | `workflow-loader.test.ts:47` | `toBe(14)` fails when activities added/removed | Medium | **Structural** — same mechanism as #1 |
| 3 | `schema-loader.test.ts:16` | `toBe(5)` fails when a new schema type is added | Medium | **Fixable** — replace with `toBeGreaterThanOrEqual(5)` or test specific IDs |
| 4 | `mcp-server.test.ts:10,769` | Shared `sessionToken` / `traceSessionToken` mutated across tests; if execution order changes or a test fails mid-mutation, subsequent tests receive stale tokens and cascade-fail | High | **Structural** — sequential token mutation is inherent to testing stateful protocols |
| 5 | `mcp-server.test.ts:35-36` | `JSON.parse((result.content[0] as { type: 'text'; text: string }).text)` — repeated ~30 times; if `content[0]` is not of type `text`, the `as` cast silently produces wrong types; parsing fails with unhelpful error | Medium | **Fixable** — extract a helper `parseToolResponse(result)` with proper type checking |
| 6 | `trace.test.ts:166-168` | Tampered token test appends `x` to base64 payload; this may trigger a base64 decode error rather than HMAC verification failure, meaning the test passes for the wrong reason | Low | **Fixable** — construct a valid base64 payload with modified content instead |
| 7 | `rules-loader.test.ts:10,21,30,41,51` | Calls `readRules(WORKFLOW_DIR)` 5 times independently; each reads from disk; no `beforeAll` caching; performance cost and timing window for data changes between calls | Low | **Fixable** — cache result in `beforeAll` |
| 8 | `state-persistence.test.ts:187` | `encodeToon(saveFile as unknown as Record<string, unknown>)` — double cast through `unknown` bypasses type checking; if `saveFile` shape diverges from what `encodeToon` expects, errors are masked | Medium | **Fixable** — fix `encodeToon` signature to accept the actual type, or use a proper type assertion |
| 9 | `mcp-server.test.ts:853-863` | In IT-8 test, original `tok` is reused after `get_skills` call without capturing the updated token from `_meta`; the `get_skills` response token is discarded; subsequent `next_activity` uses a token that is "behind" the server's sequence counter | Medium | **Fixable** — capture and use updated token from `get_skills` `_meta` response |
| 10 | `state-persistence.test.ts:261` | `const { writeFile: wf } = await import('node:fs/promises');` — dynamic import inside test body while `readFile` is imported at top level; inconsistent and fragile | Low | **Fixable** — move to top-level import |
| 11 | Inconsistent path resolution across files | `rules-loader.test.ts:5`, `skill-loader.test.ts:5`, `schema-loader.test.ts:5` use `join(process.cwd(), ...)` while `workflow-loader.test.ts:12`, `mcp-server.test.ts:14` use `resolve(import.meta.dirname, ...)`. If tests run from a different CWD, the `process.cwd()` tests fail while the `import.meta.dirname` tests pass | Medium | **Fixable** — standardize on `import.meta.dirname` for all path resolution |
| 12 | `schema-validation.test.ts` (entire file) | Tests Zod schemas in isolation but no test verifies that loaders actually apply these schemas to validate loaded data; a schema could be defined but never called | Medium | **Structural** — conservation law predicts that schema tests and loader tests are decoupled by design; bridging them requires integration tests (which exist in `mcp-server.test.ts` but don't test schema rejection paths) |
| 13 | `mcp-server.test.ts:143-158` | "Old tool names removed" tests call removed tools with empty/minimal arguments; tests verify `isError === true` but don't verify the error message; a generic "unknown tool" error and a "tool removed" error look identical to the test | Low | **Fixable** — assert on error message content |
| 14 | `skill-loader.test.ts`, `activity-loader.test.ts` | No tests for malformed TOON data (missing required fields, wrong types); tests cover file-not-found but not parse-failure; if the TOON parser silently swallows field errors, these tests won't catch it | High | **Fixable** — add tests with malformed fixtures that exercise parse-error paths |
| 15 | `mcp-server.test.ts:740-917` | Trace lifecycle `describe` block has sequential test dependencies; `traceSessionToken` is mutated in each `it` block; a single test failure cascades into all subsequent test failures, making root cause diagnosis extremely difficult | High | **Structural** — sequential token mutation is inherent to testing the stateful trace protocol; isolating each test would require a fresh session per test (high setup cost) |
| 16 | No test file | No tests for concurrent session isolation at the integration level; `trace.test.ts:48-56` tests `TraceStore` session isolation at the unit level but `mcp-server.test.ts` never creates two simultaneous sessions and verifies they don't interfere | Medium | **Fixable** — add a concurrent session isolation integration test |
| 17 | `mcp-server.test.ts:171` | `expect(workflow.version).toBe('3.4.0')` duplicates the same data dependency as `workflow-loader.test.ts:36`; when the version bumps, two files must be updated, doubling the maintenance cost for a single data change | Low | **Structural** — conservation law predicts data-value assertions propagate across test files that load the same data |
| 18 | `session.test.ts:59` | Tampered token test constructs a JSON payload with `{ wf: 'hacked', act: '', skill: '', cond: '', v: '1.0.0', seq: 0, ts: 0, sid: 'fake', aid: '' }` — this hardcodes the token field names; if the token schema adds/removes fields, this test becomes silently incorrect (passes because HMAC fails, not because schema validation catches the mismatch) | Low | **Fixable** — derive tampered payload from a real decoded token with one field modified |

## Pattern Summary

### Test Quality Patterns

| Pattern | Files Exhibiting | Assessment |
|---------|-----------------|------------|
| Result-type narrowing (`if (result.success)`) | 7 of 10 files | **Consistent** — all loader tests properly narrow discriminated unions before asserting |
| Error path testing (file-not-found, invalid input) | 9 of 10 files | **Good** — most files test at least one error path; `schema-validation.test.ts` tests multiple rejection cases |
| Test IDs in descriptions (UT-1, IT-6, etc.) | `trace.test.ts`, `session.test.ts`, `mcp-server.test.ts` | **Inconsistent** — only 3 of 10 files use test IDs; suggests a traceability practice adopted partway through development |
| `beforeAll` for expensive setup | `workflow-loader.test.ts`, `mcp-server.test.ts` | **Inconsistent** — some files repeat expensive I/O per test (`rules-loader.test.ts` reads 5 times) while others cache |
| Path resolution strategy | All 10 files | **Inconsistent** — split between `process.cwd()` and `import.meta.dirname` approaches |
| Assertion style | All 10 files | **Consistent** — exclusively uses vitest `expect()` matchers; no raw assertions or custom matchers |

### Coverage Distribution

| Test Category | Files | LOC | % of Suite |
|---------------|-------|-----|-----------|
| Integration (MCP server) | 1 | 919 | 35% |
| Loader unit tests | 5 | 710 | 27% |
| Schema validation | 2 | 394 | 15% |
| Crypto/session | 2 | 389 | 15% |
| State persistence | 1 | 298 | 11% |

The integration test (`mcp-server.test.ts`) is disproportionately large, containing 35% of all test code. This single file tests the entire MCP tool surface area including session lifecycle, validation, tracing, and tool-level behavior. It is simultaneously the most valuable test (exercises the real server) and the most fragile (sequential state dependencies, data coupling, shared mutable tokens).
