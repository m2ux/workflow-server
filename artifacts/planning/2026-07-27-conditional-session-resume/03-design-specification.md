# Design Specification — Conditional Session Resume

**Workflow:** `meta` v5.8.0
**Mode:** Update
**Date:** 2026-07-27
**Change categories:** Step-execution gating · variable addition · technique addition · activity-rule replacement
**Change request:** `discover-session` searches saved sessions only when the user's request states resume intent.
**Baseline:** [structural inventory](01-structural-inventory.md)

---

## Purpose

`discover-session` identifies the target workflow and hands `initialize-session` a resume decision. That outcome stays. This session changes *when* the saved-session search runs: explicit resume intent in the request becomes its precondition, so a plain start request reaches session initialization without walking every planning folder.

| Goal | Meaning |
|------|---------|
| G1 Gate the search on stated intent | `extract-context`, `scan-planning-folders`, and `match-session` run only when the request states resume intent |
| G2 Detect intent as a first-class value | A dedicated `workflow-engine` operation reads the request and emits the boolean those steps gate on |
| G3 Align the activity rule with the gate | The `discover-session` activity rule states the intent precondition; its current text mandates the opposite |
| G4 Make a gated search able to match | The candidate filter reads the client workflow id at the depth sessions record it, and a matched candidate sets `has_saved_state` |

Measured baseline for G4: 128 planning folders; 77 carry no `session.json` at all; of the 51 that do, 39 record top-level `workflowId: meta` with the client id nested under `triggeredWorkflows[]`. The current top-level filter can therefore reach at most 10. Independently, no step derives `has_saved_state` from `{matched_session}` — `record-match` gates on the variable it sets — so the `resume-session` checkpoint condition never holds today.

**Out of scope:**

- Server-side implementation of the scan — it stays an agent-executed technique.
- Caching, indexing, or pruning the planning-folder corpus, including the 77 folders with no `session.json`.
- Routing `saved_planning_slug` into `create-session` on resume (`initialize-session` passes `client_planning_slug`, which `derive-planning-slug` skips when resuming).
- Any change to client workflows (`work-package`, `workflow-design`).

Each is registered in [deferred items](05-deferred-items.md).

**Also see:** [assumptions log](04-assumptions-log.md) · [deferred items](05-deferred-items.md) · [impact analysis](06-impact-analysis.md)

---

## Activity list

No activities added, removed, or reordered. `discover-session` is the only activity whose body changes.

| Activity | Role in this change |
|----------|---------------------|
| `discover-session` | Hosts the new intent-detection step, the gate on the three search steps, and the replaced activity rule |
| `initialize-session` | Unchanged — continues to read `is_resuming` |

### Structural deltas

| Construct | File | Delta |
|-----------|------|-------|
| Step `detect-resume-intent` (`kind: technique`) | `activities/00-discover-session.yaml` | Added after `workflow-selection`, binding `workflow-engine::detect-resume-intent` |
| Steps `extract-context`, `scan-planning-folders`, `match-session` | `activities/00-discover-session.yaml` | Gain `when: resume_intent_requested == true` |
| Step `record-match` | `activities/00-discover-session.yaml` | Derives `has_saved_state` from `{matched_session}` instead of gating on the variable it sets (G4) |
| Technique `detect-resume-intent` | `techniques/workflow-engine/detect-resume-intent.md` | New — input `user_request`, output `resume_intent_requested`; Protocol cites the lexicon resource |
| Resource `resume-intent-lexicon` | `resources/resume-intent-lexicon.md` | New — the continuation-phrase vocabulary the detection step matches against |
| Resource index | `resources/README.md` | Lists the new resource |
| Technique `scan-saved-sessions` | `techniques/workflow-engine/scan-saved-sessions.md` | Candidate filter matches the client workflow id at the nesting depth sessions record it (G4) |
| Variable `resume_intent_requested` | `workflow.yaml` | New boolean, `defaultValue: false` |
| Flow legend | `README.md` | `discover-session` edge label carries the new variable |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| `resume-session` | Definition unchanged. It stays conditioned on `has_saved_state` alone, which only the gated search can set — no compound condition is introduced |
| `workflow-selection` | Unchanged |

No checkpoints are added or removed.

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| — | `discover-session` persists no planning artifacts; the artifact dimension is unchanged by this update |

---

## Rules

| Rule / principle | Application |
|------------------|-------------|
| `discover-session` activity rule 1 | Replaced. Current text mandates matching "even when the user said 'start'" — a direct conflict with G1. Target text states that the search runs on stated resume intent and that a start request initializes a session directly |
| Encode Constraints as Structure (#9) | The precondition is a step `when:` gate on a declared variable, not rule prose alone |
| Atomic Techniques; Compose at Activities (#26) | Intent detection is its own operation rather than a second output bolted onto `extract-identifying-context` |
| Convention Over Invention (#7) | `when: <var> == true` on `kind: technique` steps matches live `meta` usage per [format conventions](02-format-conventions.md) |
| Single Source of Truth (#14) | `has_saved_state` remains the one gate on `resume-session`; `resume_intent_requested` is not shadowed into it |
| Cite Resource Policy (#29) | The continuation-phrase lexicon is a resource the detection Protocol cites, not a word list embedded in Protocol prose |
| Document in Positive Present (#17) | Replacement rule text and the new variable description state the precondition affirmatively |
| Non-Destructive Updates (#10) | The removed activity-rule sentence is the one deliberate deletion; impact analysis records it |

---

## Confirmation ask

Approving settles the gate mechanism (a `when:`-gated trio behind a new `detect-resume-intent` operation), the replacement of `discover-session`'s conflicting activity rule, and whether G4's two correctness repairs stay inside this change.
