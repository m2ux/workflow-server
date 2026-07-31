# `workflow-authoring` — Build Specification

> Build · Created 2026-07-28 · **Status:** S1–S6 landed, in PRs [#339](https://github.com/m2ux/workflow-server/pull/339) (corpus) and [#340](https://github.com/m2ux/workflow-server/pull/340) (server). All fourteen guards green at every step; the graph is closed, all three modes are reachable, and the delivery detector is verified by negative control. Two unresumable sessions are exempted on paper, so **the S8 gate is a census of 2, not 0** — see [`drain-log.md`](../2026-07-28-workflow-design-slim-down/drain-log.md). S7 drain checks accumulate there; S8 also needs the workflows submodule bump. See [05-build-log.md](05-build-log.md).

Everything needed to author the `workflow-authoring` workflow from a cold start. Self-contained: you should not need to open the analysis folder to build, only to check provenance.

**Implements** [issue #321](https://github.com/m2ux/workflow-server/issues/321). **Analysis and provenance:** [`2026-07-28-workflow-design-slim-down`](../2026-07-28-workflow-design-slim-down/) — six corpus maps, three competing architectures, judge verdicts, the full plan, two adversarial passes.

## Start here

1. Read **[04-canon-and-platform-facts.md](04-canon-and-platform-facts.md)** first, not last. Fourteen platform facts change what YAML is even correct, and three of them contradict the implementation plan's own premises (below).
2. Read **[03-authoring-constraints.md](03-authoring-constraints.md)** §1 — eleven blocking constraints that must be right in the first authored file.
3. Author from **[01-target-architecture.md](01-target-architecture.md)**, following **[02-build-sequence.md](02-build-sequence.md)** step S1.

| Document | Size | What it is |
|---|---|---|
| [01-target-architecture.md](01-target-architecture.md) | 61 KB | The spec: `workflow.yaml` (42 variables), four activities with complete ordered step inventories and exact gates, the transition graph, six artifacts, mode coverage |
| [02-build-sequence.md](02-build-sequence.md) | 40 KB | S1–S8 with exact paths, rewires and copy-pasteable green-proof commands; registration mechanics; the 14-guard suite; drain-to-zero retirement |
| [03-authoring-constraints.md](03-authoring-constraints.md) | 54 KB | 66 constraints as Do/Not + reason + citation + scope, grouped by when they bite |
| [04-canon-and-platform-facts.md](04-canon-and-platform-facts.md) | 81 KB | 29 binding anti-pattern entries, ten principles with their tensions, 14 code-cited platform facts, schema shapes |
| [05-build-log.md](05-build-log.md) | — | Per-step record: what landed, guard results, which open decisions closed, every deviation with its reason |

## State of the world

`workflows` head is **`2feda8da`** — PR #328 merged 2026-07-28. Nothing from that branch is outstanding. (An earlier draft of this file recorded `b9b1056a`/PR #274; the build is based on `2feda8da`.)

**`workflow-design` must not be touched.** It carries **32 running sessions**, 21 of which would be stranded by any activity rename or deletion: `readActivityRaw` matches the filename-derived id with no fallback (`src/loaders/workflow-loader.ts:570`, error `:615`), and `validateActivityTransition` returns `null` on an empty valid set (`src/utils/validation.ts:45`) so `next_activity` succeeds *silently* — the failure surfaces only when `get_activity` throws. That is the entire reason this is a new workflow rather than a rewrite. The only sanctioned pre-retirement write to `workflow-design` is the S6 deprecation note, which touches no server-resolved definition file.

## The one thing that must be right first

**`transitionTo` is recorded, not engine-applied** (`src/schema/activity.schema.ts:50`). Selecting a back-edge option does **not** move the session — the worker continues linearly through the rest of the activity's steps. Author every back edge with an explicit guard on the remainder, or the activity runs its tail regardless. In `09` that means the commit gate is presented after the human asked to remediate, `COMPLETE.md` is written on a non-terminal pass, and the worktree the remediation round needs is deleted before it can author into it.

This generalises: **any option whose intent is "stop and go back" needs the steps after it gated**, not just the one known instance.

## Three premise corrections — read before trusting any delivery-cost claim

Established by reading the server this pass. The implementation plan's §3.4 and §6.3 assume otherwise.

1. **The eager-resource loop *does* draw down the cumulative budget.** Resource bodies share the same `spentChars` counter as techniques (`src/tools/workflow-tools.ts:835-843`). The in-code comment at `:754-756` claiming otherwise is stale.
2. **In `full` delivery mode no resource bodies are bundled at all.** The eager-resource block sits inside `if (referenceMode)` (`:808`); the `else` arm ships ids only (`:853-857`), and reference mode is invalid on fresh workers (`:589-591`). Since dispatched workers are always fresh, **a worker never receives eager resource bodies** — so the plan's "four criteria homes arrive in one `get_activity` with zero `get_resource` calls" does not hold. Per-section anchors are the primary cost lever, not a refinement.
3. **`set` is on a removal path and only relays at activity boundaries** (`src/schema/activity.schema.ts:26`). Its value reaches the session bag via `variables_changed` on `next_activity`, so a counter bumped by an intra-activity `set` is **stale** for any instance qualifier interpolated later in that same activity.

## Settled decisions you do not need to revisit

| Decision | Settled as |
|---|---|
| Workflow id | `workflow-authoring`, title `Workflow Authoring Workflow`, version `1.0.0` |
| Activity ids | **preserved** — `intake-and-context`, `scope-and-draft`, `quality-review`, `validate-and-commit`; sparse prefixes `01/06/08/09` |
| Registration | directory alone — `readdir` + `isDirectory()`; `workflow.yaml` never enumerates activities, which is what lets S1–S8 land one activity at a time |
| Variable count | **42** (31 retained + 11 added; the plan's 41 omitted `verified_findings`, read as an input deviation at `08:2`) |
| Techniques | 37 → 23. Author them **inside a group** in the new tree so the ~18 unavoidable copies are the last copies |
| Artifacts | 17 → 6 |
| Canon | **cited, not copied.** Author as `](../../workflow-design/resources/<id>.md#<anchor>)` — the loader projects it to the qualified id (`markdown-technique-loader.ts:228`) *and* the `.md#` form stays inside `check-resource-anchors` (`check-resource-anchors.ts:78`). Depth-dependent: `../../../` from a grouped technique |
| Retirement | drain-to-zero, with a committed census script recursing `triggeredWorkflows[i].state`, an append-only drain log, and a ≥90-day abandonment policy |

## The catalogue trap

`anti-patterns.md` has 13 `##` sections, and **AP-126/127/128/129 live inside `## Authoring Guidance (MR)`** rather than an anti-pattern family section. Any walk enumerating `## *Anti-Patterns` families drops them silently — including AP-128 and AP-129, the two entries this build most depends on. [04-canon-and-platform-facts.md](04-canon-and-platform-facts.md) §1 gives the 13-anchor list to walk instead of a family pattern.

## Open sub-decisions

All three named in [03-authoring-constraints.md](03-authoring-constraints.md)'s closing section are now **closed**: the canon is cited cross-workflow rather than duplicated, technique-Input-only values stay technique-local, and `survey-reference-workflows` binds at `08` — which freezes CA-3's eager-eligibility figure at a measured **6**. Evidence and reasoning: [05-build-log.md](05-build-log.md).

## What was deliberately accepted

Coexistence trades a sharp failure for a slow one. In-place rewriting had a zero-length duplication window and a hard-brick risk; this has zero brick risk and a **permanent duplication** risk. Nineteen sessions sit at `retrospective` and nobody is obliged to finish them, so the drain log and the abandonment policy are load-bearing, not bookkeeping — without them, two design workflows coexisting becomes the steady state.

And `workflow-design` keeps every defect this work exists to fix for the whole window, including two 30-second auto-advances that auto-select *proceed to commit* when `fail_count > 0`. In-place rewriting would have fixed those for in-flight sessions. This does not. That is the accepted price of not stranding 21 of them.
