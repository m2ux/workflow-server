# Test plan — fidelity-safe token-usage reductions

## Goals

1. Prove Opt2 resource reference delivery matches technique semantics (agent-keyed ledger, force-full escape, fresh default).
2. Prove Opt1/Opt3 corpus changes do not break refs or encourage persistent mode on fresh workers.
3. Support the headless benchmark in [20-token-benchmark.md](20-token-benchmark.md) without requiring Metric A.

## Server (Opt2)

### Unit / integration (`tests/reference-delivery.test.ts` or sibling)

| ID | Case | Expected |
|----|------|----------|
| R1 | Fresh session, two identical `get_resource` calls | Full body both times; ledger may still record hashes |
| R2 | Persistent session, same `agentId`, second identical `resource_id` | Unchanged marker `{ delivery: "unchanged", content_hash }`; `_meta.delivery` if used by techniques |
| R3 | Persistent + `full: true` on second call | Full body |
| R4 | Persistent, second call under different `agentId` | Full body (empty ledger for that agent) |
| R5 | Persistent, `foo#section` then bare `foo` | Both full on first fetch of each; independent keys |
| R6 | Persistent, collapse path | `resource_fetched` history event still appended |
| R7 | Content change (different hash) under same key | Full re-delivery |
| R8 | Invalid `#section` | Existing error behavior unchanged |

### Regression

- Existing reference-delivery cases for `get_activity` / `get_technique` / `get_workflow` ops bundle remain green.
- Do **not** alter `recordDeliveries` signature; only call it from `get_resource`.

### Commands

```bash
cd ~/projects/work/workflow-server/2026-07-16-token-resource-reference
npm run typecheck
npm test
# focused:
npx vitest run tests/reference-delivery.test.ts
```

## Corpus (Opt1 + Opt3)

| ID | Case | Expected |
|----|------|----------|
| C1 | Bootstrap still requires discover → start_session sequence | Unchanged protocol shape |
| C2 | Bootstrap states persistent **only** for solo topology; forbids on dispatched workers | Explicit; no ambiguity |
| C3 | Each edited `#section` resource ref resolves | `get_resource` returns section; no section-not-found on reference walk |
| C4 | Definition lint / binding fidelity on changed techniques | Green on workflows worktree |
| C5 | No new client-workflow solo notes | Diff limited to meta bootstrap + narrow hot refs |

### Commands

Run the repo’s usual corpus guards from the workflows worktree / main server pointing at that worktree (same as other corpus PRs — definition-lint / binding checks as applicable).

## Fidelity control walks

| ID | Walk | Assert |
|----|------|--------|
| F1 | Reference walk, persistent solo | No increase in technique-fidelity warnings vs baseline |
| F2 | Control: multi-activity with fresh/default (or simulated worker `agentId` churn) | No resource/technique unchanged markers attributed to a context that never received full content |

## Benchmark coupling

Headless before/after collection is specified in [20-token-benchmark.md](20-token-benchmark.md). Tests above prove correctness; the benchmark proves savings magnitude against ship gates in [06-work-package-plan.md](06-work-package-plan.md) §7.
