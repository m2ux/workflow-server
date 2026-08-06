# Capture: issue #417 — Activity body: the one part of a delivery a resumed worker always receives again

Body verbatim as of 6 August 2026 (filed 3 August 2026; subsumed into #404 as W10 and closed on 6 August 2026). It joins this epic because it extends the delivered-content ledger — the same mechanism W7 and W9 extend — and because the activity body is the floor the collapse figures W2 reports cannot go below.

---

## Summary

When a resumed worker asks for its activity again, almost everything in the response can arrive as a short marker instead of the bytes: each bundled technique, the inherited rules block, each shared block of a composed technique, each eagerly-bundled resource. One part cannot. The activity definition itself — the body the response ends with — has no key in the delivery ledger, so it is appended in full on every call, to a worker that is still holding the previous copy.

Measured over eight activities of the main workflow, a resumed delivery totals 184,684 characters, of which **70,957 — 38.4% — is the activity body**. The collapse achieved on the rest is 65.4%.

## What happens today

The ledger namespaces every kind of content a delivery carries, keyed either by id or by content hash, and a payload whose hash matches what that context already received is replaced by a short unchanged marker. The activity body is the only part of the response assembled outside that scheme: it is concatenated onto the response text unconditionally, so no lookup happens and no marker is possible.

The share it accounts for varies with how much else the activity carries. Where an activity binds many techniques and resources, the body is a fifth of what a resume receives. Where it binds few, the body is nearly all of it:

| Activity | Resumed delivery | Body | Body share |
|---|---:|---:|---:|
| submit-for-review | 16,686 | 15,784 | 95% |
| start-work-package | 25,518 | 21,707 | 85% |
| validate | 4,206 | 3,304 | 79% |
| design-philosophy | 19,025 | 6,255 | 33% |
| plan-prepare | 25,425 | 4,788 | 19% |
| post-impl-review | 43,003 | 7,335 | 17% |

## Why it is worth fixing, and why it is not urgent

Thirteen of the main workflow's fifteen activities carry a gate, and a worker that pauses at several of them re-requests its activity at each one. The body is paid every time.

It also caps what batching can save. The batched-dispatch work depends on content collapsing across the activities one worker holds, and the body is the floor that collapse cannot go below — so the mechanism's benefit is bounded by whatever fraction of each payload is definition text.

Against that: nothing is broken today, the cost is bounded and measured, and every other part of the payload already collapses. This is an optimisation with a known ceiling, not a defect.

## The constraint any fix has to respect

A worker is required to confirm that the activity id the server returned matches the one it was dispatched for, and to stop without executing a step if they disagree. That check reads the body. So the body cannot collapse to a single marker the way a technique does — the identity has to survive while the rest of the definition collapses.

That points at content-keying the body's parts rather than the whole: the identity fields stay, and the step list, outcome, and synthesised artifact contract become separately keyed. It is the same treatment a composed technique already gets, where the invariant note and the item list are keyed apart so a shared preamble collapses even when the rest differs.

## Scope of change

One new ledger namespace and the delivery-time substitution that reads it, in the activity delivery path. No schema change, no definition change. The existing escape hatches already cover a context that has lost content, since a forced full delivery bypasses the ledger entirely.

## Acceptance criteria

- [ ] A resumed worker's re-request returns the activity's identity in full and the remainder as markers where the bytes are unchanged.
- [ ] The dispatched-activity confirmation still has an id to check on every delivery path, including a fully collapsed one.
- [ ] A forced full delivery is unaffected.
- [ ] The reference walk records a higher collapse figure than the 65.4% it records today, with the body share falling.

## Non-goals

- The eager bundle's budget behaviour. A resumed delivery can be larger than its collapse suggests because markers cost nothing against the budget, so freed headroom is spent sending resource bodies the first delivery could not afford. That is the budget working, not re-delivery, and it is why one activity above shows a 17% body share alongside a large resume figure.
- Re-warming a resumed worker's context, which is a consequence of gates waiting on a person.

## Investigation detail

The figures come from a measurement pass over the work-package activities on the branch for [#408](https://github.com/m2ux/workflow-server/issues/408), whose walk test records the 65.4–66.6% collapse the table above decomposes.

