# Fidelity-safe token-usage reductions - July 2026

> Planning · Created 2026-07-16 · **Status:** Implementing on feature worktrees — not committed/PRd yet.

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## Executive summary

Technique bundling already delivers most step content (~74% bundled). Remaining cost on solo multi-activity walks is (1) full ops/rules redelivery when `contextMode` is unset despite a populated `deliveredContent` ledger, and (2) repeated full `get_resource` payloads (resources are outside the ledger today).

v1 is a **coordinated pair**: corpus Opt1 (adopt `context_mode: "persistent"` + stable `agent_id` on solo walks via meta bootstrap) + server Opt2 (resource reference delivery mirroring techniques), plus a narrow Opt3 (`#section` refs on hot pulls). Opt4 (split `activity-worker-prompt`) is deferred.

Ship gate uses **delivery proxies** (payload chars + history/ledger counts). Agent-relayed Metric A is optional — ADR-0006 / #233 may not be on the bench server.

## Locked decisions (2026-07-16)

| # | Decision |
|---|---|
| D1 | Coordinated Opt1 (corpus) + Opt2 (server) pair; two PRs, explicit dependency order |
| D2 | Metric A (relayed tokens) **not required** to ship; B+C gate |
| D3 | Opt1 guidance **meta bootstrap only** — no client-workflow solo notes |
| D4 | Resource ledger keys = `resource:<exact resource_id including #section>` |
| D5 | Plan persisted under this folder; implement only when asked |

### Why not client solo notes (D3)

Bootstrap / `discover` already defines `context_mode` and is the mandatory session entry. Agents that start sessions correctly already see solo vs fresh-worker rules. Extra notes in `workflow-design` / `work-package` would duplicate that contract, drift, and tempt dispatch topologies toward persistent. v1 strengthens meta bootstrap only; revisit only if measured adoption stays near zero after merge.

## Progress

| # | Item | Description | Status |
|---|------|-------------|--------|
| 06 | [Work package plan](06-work-package-plan.md) | Scope, change surface, worktrees, rollout, success metrics | ✅ Complete |
| 06 | [Test plan](06-test-plan.md) | Unit/e2e/corpus guards | ✅ Complete |
| 20 | [Token benchmark](20-token-benchmark.md) | Before/after results on work-package / skip-optional | ✅ Results recorded |
| — | Implementation | Server Opt2 + corpus Opt1/Opt3 on feature worktrees | 🟡 In progress (uncommitted) |
| — | Harness | [`scripts/run-token-benchmark.ts`](../../../../scripts/run-token-benchmark.ts) (`npm run bench:token`) | ✅ In server tree (PR) |

## Links

| Resource | Link |
|----------|------|
| Analysis canvas | `~/.cursor/projects/home-mike1-projects-main-workflow-server/canvases/token-usage-optimisations.canvas.tsx` |
| Prior art (usage tracking) | [token-use-tracking comprehension](../../comprehension/token-use-tracking.md), ADR-0006, issue #232 / PR #233 |
| Deferred: slim bootstrap | [#237](https://github.com/m2ux/workflow-server/issues/237) — [deferred-items](deferred-items.md) |
| Render technique | `workflows/work-package/techniques/finalize-documentation/render-token-usage.md` |
| Reference delivery (server) | `src/utils/delivery.ts`, `tests/reference-delivery.test.ts`, `docs/api-reference.md` |
