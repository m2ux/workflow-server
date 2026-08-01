# Impact Analysis — Server when-merge tail: dismissal parity, rule fragment refs, citation-grain guard

**Workflow:** `workflow-server` engine
**Mode:** Update
**Date:** 2026-08-01
**Change source:** [change brief](01-change-brief.md)
**Baseline:** `feat/when-merge-rule-fragments-ap134-guard` @ `3c11961f` at `.worktrees/pr2-server` (placeholder commit only — tree equals `main@753727a1`)

---

## Summary

Additive engine-semantics change plus one new guard registration: dismissal acceptance widens, activity-rule slots gain a reference form the resolver already implements for workflow rules, and the check-all suite grows one hard-zero check. No `workflows/` definition file changes, so definition topology is untouched; schema-description edits are string-only rewording.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `src/tools/workflow-tools.ts` | `condition_not_met` dismissal path extends to checkpoints gated by `when` |
| `src/schema/activity.schema.ts` | Checkpoint-gating and rule-slot descriptions: LEGACY marking names its removal target; activity-file rules declared ref-capable |
| `src/loaders/workflow-loader.ts` | Materialize activity-rule fragment refs at load |
| `src/loaders/fragment-resolver.ts` | Resolve the workflow-rule reference form for activity-file rule slots |
| `scripts/check-fragments.ts` | Treat activity rules as ref-capable slots |
| `scripts/check-citation-grain.ts` | New hard-zero AP-134 guard, seeded with the one documented economical exception |
| `scripts/check-all.ts` | Register the citation-grain guard in the suite |
| `tests/` (dismissal, loader, guard) | Dismissal cases for both gate forms; loader coverage for activity-rule refs; guard fixture coverage |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `src/schema/workflow.schema.ts` | If the shared rule-reference grammar or its description wording is declared there |
| `schemas/*.json` | Regenerated whenever schema descriptions change (`generate-schemas`) |
| `scripts/fixtures/` | Fixture corpus for the new guard |
| `docs/` / `site/` schema pages | Only where description text is mirrored |

### Unaffected

All 16 `workflows/` definition directories (no definition file changes), transports, middleware, resource tools, logging/trace, and every guard script other than `check-fragments.ts` and `check-all.ts`.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity added, removed, reordered or renamed anywhere; no definition topology change |
| Technique and resource references | Pass — no definition reference edits; note `check-fragments` and the new citation-grain guard become stricter over the corpus, so suite green depends on corpus state (change brief, open judgement 2) |
| Variables, checkpoint effects, step gates | Pass — dismissal parity only widens acceptance (`when`-gated checkpoints become dismissible); no existing gate, effect or variable loses validity |

---

## 3. Removals inventory

Omitted — nothing is removed. The change is additive; schema-description updates reword text without deleting fields, sections or files.

---

## Change constraints

Co-change sets that must move together, and names already taken:

- **A — Dismissal parity:** `src/tools/workflow-tools.ts` + `src/schema/activity.schema.ts` descriptions + regenerated `schemas/` + dismissal tests.
- **B — Activity-rule refs:** `src/loaders/workflow-loader.ts` + `src/loaders/fragment-resolver.ts` + schema description + `scripts/check-fragments.ts` + loader tests.
- **C — Citation-grain guard:** `scripts/check-citation-grain.ts` + `scripts/check-all.ts` registration + fixtures + the seeded exception.
- **Identifier collisions:** no existing `scripts/check-*citation*` script; the check-all registration key and the guard's AP-134 message label are new names to keep distinct from `check-resource-anchors`.
- **Sequencing:** PR 3 (`workflow/338-when-migration`) is gated on this PR; hard-zero guard activation interacts with PR #372's merge order (judgement 2 in the [change brief](01-change-brief.md)).

---

## Decision ask

Confirm the impact scope. Nothing is removed, so no removal approval is required.
