# Decision integrity — consolidation record

This folder is the investigation-detail home for the decision-integrity epic, which consolidates two issues about the machinery that turns a human judgement into a recorded decision: checkpoints that are supposed to pause for the user, the effects an approval is supposed to apply, and the variable bindings the surrounding steps depend on.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior session records |
|---|---|---|---|
| W1 — the checkpoint presentation and timer contract | #317 | [issue-317-soft-checkpoints.md](./issue-317-soft-checkpoints.md) | [2026-07-27-review-mode-friction-continuation](../2026-07-27-review-mode-friction-continuation/) — the worked example run, per-worker envelopes disclosing each skipped gate |
| W2 — gates that record decisions; W3 — binding sweep; W4 — requirements-refinement disposition | #320 | [issue-320-requirements-refinement-follow-ups.md](./issue-320-requirements-refinement-follow-ups.md) | [2026-07-27-requirements-refinement-design-fixes](../2026-07-27-requirements-refinement-design-fixes/) — close-out, follow-up register, assumptions log, removals inventory |

Each capture is the issue body verbatim at consolidation time, so the gate tables, the follow-up register, and the per-defect directions stay reachable after the issue closes.

## Why these two consolidate

- They are the two halves of one observed failure: in a single design session, the gates that could have converted held judgements into decisions either never presented (the soft-checkpoint contract conflict and the unenforced timer — the general mechanism defect), or presented and recorded nothing (an approval with empty effects — the per-gate authoring defect). A clean audit still closed with three questions open and twelve approved removals unapplied.
- The binding defects ride along because they are the same session's evidence and several share fix sites with the gate work (the same activity files, the same steps).
- Fixing either issue alone leaves the other half of the failure live: enforced presentation with effect-less options still decides nothing; per-gate effects behind gates that never fire still reach nobody.

## Key numbers carried into the epic

- Four soft mid-flow gates resolved themselves in one run without ever being shown, two of them self-attestations of the resolving worker's own writing; every declared timer contributed zero delay.
- Only 1 of 4 nominally interactive gates fired; the one that fired recorded an approval with no variable effects.
- Twelve inventoried removals remain unapplied; three judgements are held as assumptions with no gate able to resolve them; nine of thirteen follow-up register items are open.
