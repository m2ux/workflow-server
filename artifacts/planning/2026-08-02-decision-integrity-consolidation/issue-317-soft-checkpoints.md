# Issue #317: Soft checkpoints: gates meant to pause for the user resolve themselves, and the declared timer is never enforced

Captured verbatim on 2026-08-02 when the issue was consolidated into the decision-integrity epic.

---

## Summary

A checkpoint is a place where a workflow pauses so a human can decide something. Some checkpoints are **soft**: they carry a default answer (`defaultOption`) and a timer (`autoAdvanceMs`) that is supposed to mean "show the question; if nobody answers within this many milliseconds, take the default". In a single `workflow-design` run (meta session `EXHNTZ`, client session `QDDWIT`), **four soft mid-flow checkpoints resolved themselves without ever being presented to the user**, and in none of those cases was the timer actually honoured. Two separate defects combine here: a rule conflict that permits skipping presentation, and a structural gap that makes the timer unenforceable by the only agent allowed to apply it.

Gate 2 (`approve-to-commit`) behaved correctly and did reach the user — it carries neither `defaultOption` nor `autoAdvanceMs`, so it is structurally incapable of auto-advancing. The problem is confined to gates that *do* carry those fields.

## The gates that self-resolved

| Checkpoint | Activity | Resolved to | What a human would have been approving |
|---|---|---|---|
| `spec-confirmed` | `requirements-refinement` | `confirmed` | The design specification as drafted |
| `impact-and-preservation-confirmed` | `impact-analysis` | `confirmed` | **3 flagged removals** |
| `scope-and-structure-confirmed` | `scope-and-draft` | `confirmed` | The scope manifest and structure |
| `batch-review-attested` | `scope-and-draft` | `attested` | The drafted content itself |

Two of these are self-attestation: `scope-and-structure-confirmed` and `batch-review-attested` gated review of content the same worker had just written — the author approved its own work by default.

`impact-and-preservation-confirmed` is the sharpest case. It waved through 3 removals, while its own activity outcome clause reads:

> every flagged removal is one the user consciously approved

That clause was satisfied by a default, not by anyone's decision. The mitigation in this particular run was real — all 3 removals were relocations the approved specification already committed to, each with a recorded surviving home, and Gate 2 remained ahead — but the outcome clause as written was not actually met.

## Defect 1 — two rules conflict over whether presentation is skippable

The engine-side rule `present-before-any-resolution` (in `meta/techniques/workflow-engine/present-checkpoint-to-user.md`) is unambiguous:

> `present_checkpoint` returning data is not presentation. Every resolution path — `option_id`, `auto_advance`, or `condition_not_met` — MUST be preceded by an `AskQuestion` that displays the checkpoint's message and options. Never skip `AskQuestion` for a sleep + `auto_advance`, even when the default seems obvious. `auto_advance: true` is valid only after `AskQuestion` was shown and `autoAdvanceMs` elapsed without a response.

But `workflow-design`'s per-activity rule (`activity_rules[2]`) states the opposite for soft gates:

> When `{headless_mode}` is true (the default), soft mid-flow checkpoints (those with `defaultOption` and `autoAdvanceMs`) auto-resolve without AskQuestion. Gap-only Gate 1 (`design-intent-batch`), Gate 2 (`approve-to-commit`), and safety gaps (`preservation-check`, `review-disposition`) stay interactive.

Both are in force simultaneously. A worker following the activity rule violates the engine rule; a worker following the engine rule stalls a headless run. Workers currently resolve this in favour of the activity rule, so `present-before-any-resolution`'s "never skip `AskQuestion`" is effectively dead text for any gate not on that enumerated interactive list.

## Defect 2 — the timer is unenforceable by the agent that applies the default

The timer only has effect through the server call `respond_checkpoint { auto_advance: true }`. But the rule `checkpoint-discipline-workers-yield-only` bars workers from calling `respond_checkpoint` at all, and `checkpoint-discipline-meta-only-resolves` reserves resolution to the meta-orchestrator — the agent that supervises the run.

So when a worker "auto-advances" a soft gate under `activity_rules[2]`, it applies `defaultOption` **locally and instantly**. No time elapses, the server is never told, and `session.json#activeCheckpoint` is never even set for that gate. A declared `autoAdvanceMs: 30000` contributes nothing — it functions purely as a marker meaning "this gate is soft", not as a delay. Every one of the four gates above resolved in effectively zero milliseconds.

This means the field's stated semantics ("Ms before auto-selecting defaultOption") do not describe what happens on the worker path.

## Why this is worth addressing now

PR #274 adds `verify-auto-advance-capability` (in `present-checkpoint-to-user.md`) and `verify-auto-advance-on-resolve` (in `respond-checkpoint.md`) precisely to stop auto-advance being *asserted* rather than *verified*. Those additions check that `defaultOption` and `autoAdvanceMs` are actually present on the payload before auto-advance is claimed — a real improvement, and they worked as intended here.

But they verify field **presence**. Neither addresses the two defects above: that presentation can be skipped entirely for a gate that does carry both fields, and that the timer those fields declare is never enforced on the path that actually applies the default. The verification hardens the precondition while leaving the mechanism unenforced.

## Possible directions

Not prescriptive — the design call belongs to whoever owns the checkpoint contract:

1. **Reconcile the two rules explicitly.** Either carve headless soft gates out of `present-before-any-resolution` in that rule's own text, or drop `activity_rules[2]`'s licence to skip `AskQuestion`. The current state, where each rule silently contradicts the other, is the worst of both.
2. **Make the timer mean something, or stop declaring it.** If soft gates are genuinely meant to resolve instantly under headless, `autoAdvanceMs` is the wrong spelling for "soft" and a boolean (or the absence of `blocking: true`) would say it honestly. If the delay is meant to be real, the resolution has to route through the meta-orchestrator so `respond_checkpoint` can enforce it.
3. **Reconsider self-attestation specifically.** A gate whose purpose is reviewing content the resolving agent authored is not meaningfully satisfiable by that agent's own default, regardless of the timer. `batch-review-attested` and `scope-and-structure-confirmed` may belong on the interactive list for that reason alone.
4. **Audit outcome clauses that assert user consent.** Any activity outcome phrased as "the user consciously approved …" is falsified by a default resolution. Either the clause or the gate's softness needs to change.

## Reproduction

Run `workflow-design` in update mode with `headless_mode: true` (the default) and observe `spec-confirmed`, `impact-and-preservation-confirmed`, `scope-and-structure-confirmed` and `batch-review-attested`. Each resolves without an `AskQuestion` and without elapsed delay.

## Investigation detail

Session `QDDWIT` under planning folder `artifacts/planning/2026-07-27-review-mode-friction-continuation` is a full worked example; each worker envelope in that run discloses the gate, the permitting clause, and that the user was not reached.

