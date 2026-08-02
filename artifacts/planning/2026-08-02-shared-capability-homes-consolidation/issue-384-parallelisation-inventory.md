# Issue #384: Parallelisation inventory: find where workflows run independent work sequentially, and plan the migration

Captured verbatim on 2026-08-02 when the issue was consolidated into the shared-capability-homes epic.

---

## Summary

Several of our production workflows run their work strictly one step after another, even where the steps do not depend on each other — independent validations, independent analysis passes, sibling research and check runs inside a single activity. Every session pays the full sequential wall-clock cost for work that could have run at the same time in separate shells or agents. Running independent pieces at once is what we call **parallel fan-out**.

This issue is the survey and the plan: identify the workflows (and the concrete activity and technique sites inside them) where independent work runs sequentially and would benefit from fan-out, then plan the migration. The clearest exemplar is **`work-package`**, which performs many tasks one after another that *could* run concurrently wherever there is no true data or control dependence.

This issue is **identify and plan** only. Implementing the changes to the workflow definitions is follow-on work, after the inventory and plan are agreed.

## What happens today

Where steps are independent — no ordering constraint beyond "both must finish before a later join" — sequential execution inflates session wall-clock time and under-uses the harness's ability to dispatch several shells or agents at once. That cost is paid in the open on every run, even where the work units are plainly parallel in intent.

## Relationship to existing work

Two issues divide this territory, and they should not be conflated:

- **#382** owns the supply side. It decides and documents the **reusable contracts** for parallel dispatch — process-unit fan-out versus agent scatter-gather and concurrent spawning — and the workflow-design canon preference. It makes *how* to parallelise legible and reusable.
- **This issue** owns the demand side: *which* workflows and sites should adopt those contracts (or existing formal patterns), in what order, and with what join and gather constraints.

#382 may land its contracts before any large `work-package` rewrite; this issue still needs its own inventory and sequencing plan.

## Goals

1. **Inventory** the workflow corpus for sequential sites that are candidates for parallelisation:
   - independent steps or technique operations inside one activity;
   - sibling activities with no dependence on each other before a later gate;
   - places where a recipe says "these can run in parallel" in free prose, which should instead bind a named contract.
2. **Classify** each candidate: ready (a contract already exists), blocked on #382 (or on another missing primitive), or not a candidate (true dependence, a human gate, coordination rather than dispatch, and so on) — with path citations for each.
3. **Prioritise** by expected wall-clock win and by risk, especially `work-package` and other high-traffic paths.
4. **Plan** the follow-on work packages and issues: per-workflow or batched migrations, acceptance checks, and any input/output envelope constraints that must stay stable for callers.

## Non-goals (this issue)

- Implementing parallelisation in workflow definitions. (A tiny spike is allowed if needed to validate the plan — the default is plan-only.)
- Server or runtime changes under `src/` or `schemas/`, unless the inventory proves a primitive is missing — in that case, spin up a separate issue.
- Reworking sites that already correctly bind the formal fan-out patterns.

## Suggested approach

1. Walk the high-traffic workflows first: `work-package`, then the peers used in day-to-day engineering runs.
2. For each candidate site, record:
   - the path (workflow / activity / technique / step);
   - why independence holds, or what residual dependence remains;
   - the intended unit kind — a process or shell in the same context, versus a dispatched agent or worker;
   - the contract it should bind once available (`unit-fan-out`, `scatter-gather`, `spawn-concurrent`, the orchestration-patterns repertoire, or another);
   - how results are gathered and combined, and what the sequential fallback is;
   - risk notes: checkpoint ordering, attestation gates, artifact envelope stability.
3. Produce a short migration plan: an ordered backlog of implementation issues, the dependencies on #382 (and any other blockers), and a "done when" for the inventory phase.

## Acceptance criteria

- [ ] A corpus inventory table (or equivalent artifact) with candidate / non-candidate / blocked classifications and citations.
- [ ] An explicit call-out of the **`work-package`** sites: which stages can fan out, which must stay serial, and why.
- [ ] A prioritised migration backlog — linked issues or a single sequenced plan — ready for implementation work packages.
- [ ] A clear dependency statement against #382 (and any other primitives).

## Notes and seeds

- Start from the known sequential pressure in **`work-package`**: its multi-stage validate / analyse / prepare chains look independent at the step level.
- Reuse any migration-candidate inventory produced during the #382 authoring run, so this issue does not re-discover the same free-prose sites from scratch. Extend it to **structural sequentialism** — the ordering encoded in YAML activity order and step lists — not only recipes that describe concurrency in prose.

