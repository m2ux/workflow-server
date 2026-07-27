# Design Assumptions Log

**Workflow:** `meta`
**Mode:** Update
**Created:** 2026-07-27
**Last Updated:** 2026-07-27

---

## Summary

| Category | Surfaced | Audit-resolved | Confirmed | Corrected | Deferred |
|----------|----------|----------------|-----------|-----------|----------|
| Activity Boundaries | 2 | 1 | 0 | 0 | 0 |
| Checkpoint Necessity | 1 | 1 | 0 | 0 | 0 |
| Technique Selection | 2 | 2 | 0 | 0 | 0 |
| Rule Scope | 1 | 1 | 0 | 0 | 0 |
| Variable State | 1 | 1 | 0 | 0 | 0 |
| Schema Construct Choice | 1 | 1 | 0 | 0 | 0 |
| **Total** | **8** | **7** | **0** | **0** | **0** |

Decisions are batched to Gate 2 (`approve-to-commit`); no mid-flow per-assumption dispositions were taken.

---

## Log

One row per assumption, updated in place across its lifecycle — surfaced, reconciled, and resolved.

| ID | Category | Risk | Resolvability | Assumption | Rationale | Outcome | Changes |
|----|----------|------|---------------|------------|-----------|---------|---------|
| A-1 | Technique Selection | M | audit | Intent detection is a new atomic operation `workflow-engine::detect-resume-intent`, not a second output on `extract-identifying-context` | That technique's capability is identifier extraction; bolting an unrelated boolean onto it widens one capability into two | ✅ Validated — design-principles #26 (atomic techniques) and #13 (contract vs procedure) settle it | None; spec unchanged |
| A-2 | Schema Construct Choice | M | audit | The gate is a `when:` expression string on the three `kind: technique` steps, not a structured `condition:` object | Format conventions record `when:` as the live form on non-checkpoint steps across `meta` and `work-package`; `condition:` is required only where the server dismisses a checkpoint | ✅ Validated — [format conventions](02-format-conventions.md) "Step gating — the two forms" and convention-conformance | None; spec unchanged |
| A-3 | Variable State | M | audit | The new state is one workflow-level boolean `resume_intent_requested` with `defaultValue: false` declared in `meta/workflow.yaml` | A step gate must read a declared variable; a false default keeps an intent-free request on the fast path | ✅ Validated — schema `variables[]` shape, one-line description, and design-principles #19 (affirmative predicate naming) | None; spec unchanged |
| A-4 | Rule Scope | L | audit | The conflicting rule stays activity-local rather than being promoted to `workflow.yaml` `rules.workflow` | The constraint governs one activity's step sequence only | ⚠️ Superseded in part — the scope call held, but the rule was deleted rather than replaced in place: the gates, checkpoint condition, and transition already carry the precondition, so replacement text restated them clause for clause ([verified findings § Resolution](08-verified-findings.md#resolution)) | Spec § Rules and G3 updated to describe removal |
| A-5 | Checkpoint Necessity | L | audit | No checkpoint is added, and `resume-session` keeps its single `has_saved_state` condition rather than a compound `and` with the intent flag | `has_saved_state` can only become true when the gated search ran, so intent is already implied by it | ✅ Validated — design-principles #14 (compare the one authoritative source, no derived shadow) | None; spec unchanged |
| A-6 | Activity Boundaries | L | audit | The change stays inside `discover-session`; no step moves to `initialize-session` and no activity is added or split | Intent detection is part of target-and-session discovery, which is what this activity already owns | ✅ Validated — structural inventory activity list; design-principles #22, #26 | None; spec unchanged |
| A-7 | Activity Boundaries | H | open | The two G4 correctness repairs — nested-`workflowId` candidate filter and deriving `has_saved_state` from `{matched_session}` — belong in this change rather than a separate one | Without them a resume request still matches nothing, so the gate delivers speed but leaves resume non-functional; with them the change is larger than the literal request | ⏸️ Open — batched to Gate 2 | Pending |
| A-8 | Technique Selection | M | audit | The resume-intent lexicon lives inline in the `detect-resume-intent` Protocol rather than in a `meta` resource | Short closed word list with a single consumer; `meta` carries only four resources today | 🔄 Partially Validated — design-principles #29 places vocabularies in a resource that Protocol cites; the operative *detection step* stays in Protocol | Spec updated: `resources/resume-intent-lexicon.md` added to the structural deltas, with `resources/README.md` listing it |

---

## Open Assumptions

**A-7 — G4 correctness repairs inside this change**
**Category:** Activity Boundaries · **Risk:** H
**Statement:** The nested-`workflowId` candidate filter fix and the `has_saved_state` derivation fix are delivered by this change rather than deferred.
**Why no audit settles it:** Both repairs are schema-valid and convention-conformant either way. What is unsettled is change scope against the literal request ("only look for a session when the user says resume"), which is a stakeholder call about how much correctness debt this change absorbs.
**Alternatives considered:** (a) gate only, file both repairs as follow-ups; (b) gate plus both repairs, as specified; (c) split the repairs into a second work package sequenced after this one.
**Evidence on record:** 128 planning folders; 77 without `session.json`; 39 of the 51 remaining record top-level `workflowId: meta`, leaving at most 10 reachable by the current filter. No step derives `has_saved_state` from `{matched_session}`, so `resume-session` never fires today.
