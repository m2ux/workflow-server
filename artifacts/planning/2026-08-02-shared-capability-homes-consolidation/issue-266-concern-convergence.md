# Issue #266: Concern convergence: lift the analyse-challenge pattern from work-package into meta

Captured verbatim on 2026-08-02 when the issue was consolidated into the shared-capability-homes epic.

---

## Summary

The `work-package` workflow recently gained a reusable loop for working through open concerns before asking the user about them: analyse the material, have independent perspectives challenge the findings, combine what survives, and repeat until the concerns converge — leaving only the residue that genuinely needs a human answer ([PR #262](https://github.com/m2ux/workflow-server/pull/262)). Nothing in that shell is specific to work packages: it is already fully parameterized. This issue lifts it into `meta` — the shared workflow that hosts domain-agnostic patterns — under its own name, **concern convergence**, so any workflow can use it.

The pattern becomes a sibling of the existing worker `orchestration-patterns` catalog, not a row inside it: that catalog is about fanning units of work out to workers, while this is about converging a set of open concerns. `work-package` then retargets its call sites to the meta group and keeps only what is genuinely its own — the interview and batch checkpoints for asking the user about residual concerns, and its domain-specific analyse operations.

## Why move it

- The group is already parameterized: callers supply the analyse operation, the list of challenge perspectives, the flags that signal convergence and residue, the collection residual concerns land in, and the kind of concern being processed (`analyse`, `challenge_perspectives`, `convergence_flag`, `residue_flag`, `residue_collection`, `concern_kind`).
- Today's only call sites are in work-package (open assumptions and codebase comprehension), but other workflows will want the same shape: converge everything the agent can resolve itself before the residual asks reach the user.
- Meta already owns the fan-out primitives (`scatter-gather`, `orchestration-patterns`); the challenge fan-out can stay on scatter-gather, or later bind meta's dispatch/gather — either way without meta owning the residual-question user experience.

## Proposed shape

1. A new technique group under meta (name still open — `meta/techniques/critique-converge/` and `analyse-challenge/` are both candidates) carrying the same input/output contract as today's work-package group: the loop driver (`run-loop`), the `challenge` and `combine` operations, and the group's contract document (TECHNIQUE).
2. Optionally, a borrowable pattern activity under `meta/activities/patterns/` — but only if borrowing a whole activity proves cleaner than binding steps individually; otherwise the technique-group bind is enough.
3. Retarget `work-package`'s activity call sites to the meta operations, leaving the work-package-specific values — the `has_open_assumptions` flag, the perspective lists, the `analyse:` paths — as inputs supplied at each call site.
4. Document the pattern in the meta README and patterns catalog map as concern convergence, clearly distinguished from worker orchestration.

## Non-goals

- Do **not** fold this into the worker pipelines under `meta/activities/patterns` (orchestrator-workers, supervisor, plan-and-execute, and so on) — those do a different job: work-unit fan-out, not concern convergence.
- Do **not** move the residual interview/batch checkpoints, the `assumption-interview` fragments, or the domain operations (`review-assumptions::*`, `codebase-comprehension::deep-dive`) into meta.
- Do **not** block or expand PR #262 for the sake of this migration.

## Acceptance criteria

- [ ] Meta hosts the parameterized loop shell; work-package no longer owns a forked copy of the protocol.
- [ ] The work-package call sites behave equivalently: same flags, same residue gating, and the residual-question user experience still owned by work-package.
- [ ] The catalog and README make the split of the repertoire clear: worker fan-out on one side, concern convergence on the other.
- [ ] Schema, reference, and binding-fidelity checks stay clean, and no resource file narrates which steps bind what — resource-level bind-topology narration is a catalogued anti-pattern (AP-46 / AP-92).

## References

- Today's group lives at `work-package/techniques/analyse-challenge/` (the PR #262 branch).
- Prior design note: the shell is reusable while the concern semantics stay with work-package; the challenge half may later use meta dispatch/gather for fan-out only.

