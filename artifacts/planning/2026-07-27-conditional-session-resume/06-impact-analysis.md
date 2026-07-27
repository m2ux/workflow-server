# Impact Analysis — Conditional Session Resume

**Workflow:** `meta` v5.8.0
**Mode:** Update
**Date:** 2026-07-27
**Change source:** [design specification](03-design-specification.md)
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Summary

A gating change confined to `discover-session` plus two new leaf files: one `workflow-engine` operation and one resource. No activity is added, removed, or renamed, so the lifecycle topology (`00`→`01`→`02`→`03`, `04` terminal) is untouched.

Scope against the 150 existing files in the `meta` tree: **8 are in scope** — 6 directly modified and 2 possibly touched at draft time — and **142 are unaffected**. Two further files are created. The directly-modified table below therefore lists 8 rows: the 6 existing files plus the 2 new ones. One additional possibly-touched file, `src/schema/activity.schema.ts`, sits outside the workflow tree and is excluded from these counts.

**removal_count:** 4

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `workflows/meta/activities/00-discover-session.yaml` | Hosts the new `detect-resume-intent` step, the `when:` gate on the search trio, the `record-match` derivation repair, and the replaced activity rule |
| `workflows/meta/workflow.yaml` | Declares `resume_intent_requested`; version bump |
| `workflows/meta/techniques/workflow-engine/detect-resume-intent.md` | New leaf — the operation the gate variable comes from |
| `workflows/meta/resources/resume-intent-lexicon.md` | New resource — continuation-phrase vocabulary cited by the detection Protocol |
| `workflows/meta/techniques/workflow-engine/scan-saved-sessions.md` | Candidate filter reads the client workflow id at its recorded nesting depth (G4) |
| `workflows/meta/resources/README.md` | Resource Index gains a row for `resume-intent-lexicon` (additive) |
| `workflows/meta/activities/README.md` | The `00. Discover Session` entry asserts scanning happens "even when the user said 'start'" — the same contradiction as the activity rule, in a second location not listed in the specification's delta table |
| `workflows/meta/README.md` | Flow-legend edge label; activity-table role text; header prose still reads v5.2.0 against a v5.8.0 definition |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `workflows/meta/techniques/workflow-engine/extract-identifying-context.md` | Only if the gate's placement changes its `user_request` contract; the specification keeps detection a separate operation, so no edit is expected |
| `workflows/meta/activities/01-initialize-session.yaml` | Reads `is_resuming` only, which the `resume-session` checkpoint still sets; edit expected only if the gate alters resume reachability |
| `src/schema/activity.schema.ts` | The `when` field's doc example is `"has_saved_state == true"` — the exact expression R2 removes; example stays syntactically valid, so this is cosmetic |

### Unaffected (summary)

142 of the 150 existing files: the technique leaves other than `scan-saved-sessions.md` and `extract-identifying-context.md`, 10 container `TECHNIQUE.md` files (`workflow-engine/TECHNIQUE.md` is rules-only and carries no operation index), all 5 `activities/patterns/` files, activities `02`–`04`, and 3 of 4 existing resources. Server code and tests are unaffected — `tests/workflow-loader.test.ts` and `tests/schema-validation.test.ts` reference `discover-session` and `resume-session` by id only, with no step-count or ordering assertions.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | Pass — no activity added, removed, or reordered; all 4 `transitions[].to` and `initialActivity: discover-session` resolve unchanged |
| Technique / resource references | Pass, conditional on creation — the 5 existing `workflow-engine::` bindings in `00-discover-session.yaml` all resolve; `workflow-engine::detect-resume-intent` and resource `resume-intent-lexicon` resolve by flat-file lookup once the two new files land, with no index registration required |
| Variables / `setVariable` / step conditions | Pass with two pre-existing gaps — `resume_intent_requested` is declared and read by 3 gates, so no orphan is introduced; but `matched_session` (which G4 makes `record-match` read) is an undeclared technique output, and `saved_planning_slug` remains written-never-read |

**Mechanism note (bounds what G4 can achieve).** `action: set` is agent-executed, not server-applied, and **the server evaluates no gates at all** — `when` and `condition` are both honoured by the executing agent (`src/schema/activity.schema.ts:74-75`); a checkpoint's `condition` only makes it dismissible via the orchestrator's `respond_checkpoint { condition_not_met }`. So `record-match` deriving `has_saved_state` from `{matched_session}` is *sufficient*: the `resume-session` condition is read by the same agent that executed the `set`, and `has_saved_state` is read nowhere outside this activity. Durability is not on this path. Across the activity boundary only `is_resuming` matters, and it is engine-applied by the checkpoint's `setVariable` effect — which is what `initialize-session` reads. The schema flags `set` for removal at the next workflow-schema major (#166 B7/B12); when that lands, an activity-local value like `has_saved_state` needs a replacement in-activity construct, not merely a durable one.

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `activities/00-discover-session.yaml` rule 1 (line 7) | "Match identifying context against saved sessions even when the user said 'start'" — the mandate that inverts the change request | The rule slot itself and the surface-via-`resume-session`-checkpoint clause, restated under the new intent precondition |
| 2 | `activities/00-discover-session.yaml` step `record-match` (line 47) | `when: has_saved_state == true` — the self-referential gate that can never fire from the `false` default | The step, both `set` actions, and the `saved_planning_slug` assignment; the gate is replaced by a derivation from `{matched_session}` |
| 3 | `techniques/workflow-engine/scan-saved-sessions.md` Protocol step 3 + Outputs description | The top-level-only `workflowId` equality filter, which can reach at most 10 of 51 session-bearing folders | Steps 1–2, the candidate entry shape, and the filter's role — only its matching depth changes |
| 4 | `activities/README.md` `00. Discover Session` (line 15) | "so saved progress can be surfaced — even when the user said 'start'" — the orientation restatement of removal 1 | The rest of the entry: catalog matching, identifying-context extraction, both checkpoints, and the transition pointer |

---

## Decision ask

Confirm impact scope and intentional removals — or revise / preserve.
