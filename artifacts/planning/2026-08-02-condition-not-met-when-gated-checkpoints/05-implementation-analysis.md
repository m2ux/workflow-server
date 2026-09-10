# Implementation Analysis — condition_not_met / activity-rule fragments / AP-134

> PR #373 · #338 / #358 · 2026-08-02 · Complete

## Implementation Review

### Existing Location

| Component | Path | Description |
|-----------|------|-------------|
| Dismissal mode | `src/tools/workflow-tools.ts` (`respond_checkpoint` ~1492–1498) | `condition_not_met` legal only when `checkpoint.condition` is truthy |
| Gate schema copy | `src/schema/activity.schema.ts` (`stepCommonFields` when/condition) | Documents that only `condition` enables dismissal |
| JSON schema mirrors | `schemas/activity.schema.json` (step `when`/`condition` describes) | Same exclusivity prose |
| MCP dismissal tests | `tests/mcp-server.test.ts` (~1433–1479) | Reject unconditional; accept structured-conditional; **no when-only case** |
| Rule entry union | `src/schema/workflow.schema.ts` (`RuleEntrySchema`) | string \| `{ ref }` for workflow partitions |
| Activity-file rules | `src/schema/activity.schema.ts` (`Activity.rules`) | `z.array(z.string())` only |
| Activity JSON rules | `schemas/activity.schema.json` (`rules.items.type: string`) | No `{ ref }` arm |
| Materialize rules | `src/loaders/fragment-resolver.ts` (`materializeRuleEntries`) | Splices refs → plain strings |
| Materialize activity | `src/loaders/fragment-resolver.ts` (`materializeActivityFragments`) | Checkpoint refs only — **not** activity `rules` |
| Raw checkpoint inject | `injectCheckpointFragmentBodies` / `scanCheckpointRefLines` | get_activity raw YAML path materializes checkpoint bodies |
| Workflow load | `src/loaders/workflow-loader.ts` | Materializes workflow rule partitions + activity checkpoint fragments |
| Fragments guard | `scripts/check-fragments.ts` | Resolves workflow partition refs; activity-file rules are string-only for duplicate index |
| Citation extract | `src/utils/resource-ref.ts` (`extractResourceIds`, `parseResourceRef`) | Returns bare and `#section` ids from projected technique text |
| Guard registry | `scripts/guards.ts` (`GUARDS`, 19 entries) | No citation-grain guard |
| Hard-zero exemplar | `scripts/check-self-provisioned-input.ts` | Collector + CLI + `GUARDS` + npm script pattern |
| Comprehension | [when-merge-condition-not-met.md](../../comprehension/when-merge-condition-not-met.md) | Full seam map for this PR |

Worktree: `.worktrees/2026-08-02-condition-not-met-when-gated-checkpoints` · branch `feat/when-merge-rule-fragments-ap134-guard` · HEAD `3c11961f` (opening chore only).

### Usage Patterns

**How it is used today:**

- **Dismissal:** Orchestrator calls `respond_checkpoint { condition_not_met: true }` after the agent judges a gate false. Server checks **presence** of structured `condition`, never evaluates expression truth. Success clears `activeCheckpoint`, records sentinel `__condition_not_met__`, sets `dismissed: true`, applies **no** option effects.
- **Gates in corpus:** 123 checkpoint-like steps surveyed in worktree workflows — **72** structured-`condition` only, **0** when-only, **0** both, **51** ungated. When-only checkpoints are absent precisely because dismissal depends on `condition`.
- **Activity-file rules:** **0** activity YAML files carry a top-level `rules:` array today. Shared worker rules live in workflow `rules.activity` / `universal` (already ref-capable). Activity-file refs are the residual authoring surface (W6 / F7 class).
- **Citations:** Mechanical bare+section co-citation across technique files is **0** on this worktree snapshot — hard-zero guard can land green; fixtures must prove the detector.

### Dependencies

**Depends On:**

- `getCheckpoint` definition lookup (base id for `base#instance`)
- Existing `RuleEntry` + `materializeRuleEntries` + fragments lookup / meta fallback
- `resolveWorkflowsRoot` / guard protocol for new check script
- `extractResourceIds` output shape for citation grouping

**Depended On By:**

- Corpus when-migration PR (`workflow/338-when-migration` / #338) — needs dismissible `when` checkpoints
- Authors writing activity-local shared rule text without pasting
- `check:all` / `check:delta` consumers once citation-grain is registered
- Schema describe text and agent guidance that currently warn “only condition dismisses”

### Architecture

**Existing patterns to extend (conventional, not inventive):**

1. **Presence-gated dismissal** — widen the boolean from `!!condition` to “any present gate” (`condition` **or** non-empty `when`). Do not add a server-side `when` evaluator on this path.
2. **RuleEntry materialize** — reuse `materializeRuleEntries` at activity load; mirror checkpoint’s dual path (typed activity object + raw YAML delivery) so workers never see raw `{ ref }` objects.
3. **Hard-zero guard** — new `scripts/check-*.ts` + `GUARDS` entry + optional npm script + unit/fixture emptiness test; AP-134 mechanical half only (bare + `#section` same base id in one technique file).

**Known technical debt (in-scope awareness):**

- Dual gate dialect on checkpoints until corpus migrates
- Activity-file rules absent from corpus today — schema/loader/guard land without a migration commit in this package unless a fixture activity is added under tests
- Full AP-134 prose detect (heading-name tell without co-citation) stays out of automation for this PR

## Effectiveness Evaluation

### What's Working Well

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Structured-condition dismiss | mcp-server test accept path; live tool branch | HIGH |
| Unconditional reject | mcp-server test; error string `no condition field` | HIGH |
| Workflow rule fragment pipeline | `RuleEntry` + load materialize + fragments guard | HIGH |
| Checkpoint fragment dual path | `materializeActivityFragments` + `injectCheckpointFragmentBodies` | HIGH |
| Citation id extraction | `extractResourceIds` preserves `#section` | HIGH |
| Guard registration discipline | `GUARDS` single list; #327 lesson | HIGH |

### What's Not Working

| Issue | Evidence | Impact |
|-------|----------|--------|
| when-only checkpoints cannot dismiss | `if (!checkpoint.condition)` only | HIGH — blocks when-merge |
| Schema/docs encode the bug | activity.schema when/condition describes | HIGH — authors keep writing `condition` for dismissibility |
| Activity-file rules string-only | Zod + JSON schema + fragments guard loop | MEDIUM — authoring duplication |
| No activity-rule materialize call site | `materializeActivityFragments` ignores `rules` | MEDIUM |
| No AP-134 guard | 19 guards; catalog only | MEDIUM — regression class open |
| Branch pre-implementation | single chore commit vs main | — — work remains |

### Workarounds in Place

- Checkpoint gates that need dismissibility stay on structured `condition` (72 sites)
- Shared rules prefer workflow `rules.activity` / `universal` over activity-file `rules`
- Citation grain enforced by manual review / prior cleanup (#370 class), not CI

## Baseline Metrics

| Metric | Current Value | Measurement Method | Date |
|--------|--------------|-------------------|------|
| Branch commits vs main | **1** opening chore | `git log origin/main..HEAD` | 2026-08-02 |
| when-only dismiss tests | **0** | mcp-server.test.ts | 2026-08-02 |
| condition_not_met predicate | `!!checkpoint.condition` | workflow-tools.ts:1493 | 2026-08-02 |
| Checkpoint survey (when / condition / both / ungated) | **0 / 72 / 0 / 51** (123 total) | YAML walk of worktree workflows | 2026-08-02 |
| Activity files with top-level `rules` | **0** | YAML walk | 2026-08-02 |
| Technique files with bare+section co-cite | **0** | extractResourceIds-style scan | 2026-08-02 |
| GUARDS count | **19** | scripts/guards.ts | 2026-08-02 |
| `check-citation-grain.ts` | **Absent** | filesystem | 2026-08-02 |
| GitNexus impact `materializeRuleEntries` | **LOW** (0 upstream callers indexed) | gitnexus impact | 2026-08-02 |
| GitNexus impact `ActivitySchema` | **LOW** | gitnexus impact | 2026-08-02 |

### Key Findings

1. **One boolean change** unlocks deliverable 1 — plus schema/test/doc copy; keep agent-side truth evaluation.
2. **Activity-rule refs are a three-layer parity** — schema (Zod + JSON), materialize (typed load + raw get_activity delivery), fragments guard — not schema alone.
3. **Citation guard can land hard-zero green** on current corpus; fixtures prove the detector; economical exceptions stay empty or minimal and documented in the script header.
4. **Corpus migration is out of scope** for this server PR — zero when-only checkpoints today is expected, not a missing deliverable.

## Gap Analysis

| ID | Gap | Severity | Target | Notes |
|----|-----|----------|--------|-------|
| G1 | `condition_not_met` ignores `when` | HIGH | Present-gate predicate | Error message must mention both forms |
| G2 | Schema describe exclusivity | HIGH | Positive-present parity prose | when + condition describes |
| G3 | No when-only MCP test | HIGH | mcp-server.test.ts | Fixture activity or inline def with `when` only |
| G4 | Activity.rules not RuleEntry | MEDIUM | activity.schema.ts + JSON | Import/reuse RuleEntrySchema |
| G5 | No activity-rule materialize | MEDIUM | materializeActivityFragments + raw path | Mirror checkpoint dual path |
| G6 | Fragments guard skips activity refs | MEDIUM | check-fragments.ts | resolveRuleFragment + usage tracking |
| G7 | No AP-134 guard | MEDIUM | check-citation-grain + GUARDS + package.json | Mechanical co-citation only |
| G8 | Docs/README schema examples | LOW | schemas/README if rules example exists | Positive present |

## Recommended Approach

**Three sequential commits (or three clear task commits) on PR #373:**

1. **Dismissal parity** — tool predicate + schema describes + when-only test (+ unconditional still rejects).
2. **Activity-rule fragment refs** — RuleEntry on Activity.rules; materialize on load and raw delivery; fragments guard; unit tests.
3. **AP-134 citation-grain guard** — script + registry + npm script + fixture/emptiness test.

No new runtime interpreter. No corpus YAML migration in this package. Measure success with tests + `npm run check:all` / targeted vitest.

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Raw get_activity still shows `{ ref }` after typed materialize only | HIGH | Always pair typed + raw inject (checkpoint precedent) |
| Citation guard false positives on overview bare cites | MEDIUM | Mechanical tell only; optional allowlist; AP-134 “Do not flag” prose stays human | 
| Error string change breaks tests | LOW | Update mcp-server assertions with new wording |
| JSON schema hand-edit drift from Zod | MEDIUM | Edit both; run validate-activities | 
