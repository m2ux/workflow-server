# Delivery cost epic — what was delivered, and what waits on a sample

Recorded 6 August 2026. Companion to [implementation-plan.md](./implementation-plan.md), which holds
the sequencing decision and the baselines; this file records the result and the method for the two
reads that cannot be taken yet.

## Five pull requests

| PR | Base | Work items | State |
|---|---|---|---|
| [#439](https://github.com/m2ux/workflow-server/pull/439) | `workflows` | W4 (definitions), W5 | open |
| [#440](https://github.com/m2ux/workflow-server/pull/440) | `main` | W1, W2, W6, W4 (budget) | open |
| [#441](https://github.com/m2ux/workflow-server/pull/441) | #440 | W7, W9, W8 (server) | open |
| [#442](https://github.com/m2ux/workflow-server/pull/442) | #441 | W10 | open |
| [#443](https://github.com/m2ux/workflow-server/pull/443) | #439 | W3, W8 (corpus), the W2 extension | open |

Merge order is the table order. #440 carries the corpus pointer for #439, so #439 lands first; #443
describes behaviour #440 and #441 add, so it lands after them.

## Measured before and after

Every figure below is from the branch that produced it, on the same corpus.

| Figure | Before | After | Where |
|---|---:|---:|---|
| Bootstrap fixed content | 137,758 | 100,273 | #439 + #440, budget 110,000 |
| Resolve passes per delivery | one a step | one a request | #440 |
| Full delivery, three activities of the main workflow | 225,617 | 213,476 | #441 |
| Reference walk collapse over thirteen gates | 69.9% | 83.5% | #442 |
| Characters re-requested on that walk | 271,411 | 141,951 | #442 |
| Container-rule reach | — | 8.3% of 72 entries | #440, warn-only |
| Inherited-I/O reach | — | 1.4% of 215 items | #440, warn-only |

The epic body quotes 65.4% for the walk's collapse figure. That reading predates the batched-dispatch
merge, which added the `activity-worker` role technique to every activity delivery; the same test at
this work's branch point reports 69.9%, and 83.5% is read against that.

## W8's second half — the read to take on the next real run

The field arrives now, in the response text as well as in `_meta`. Whether a run then *forms* is a
property of a live session, and no test can stand in for it.

**Trigger.** The first completed work-package session on a server build carrying #441.

**Method.** From that session's `session.json`:

- Group `activity_dispatched` events by `data.agentId`. A scope holding two or more distinct
  activities is a run that formed. The 5 August baseline is four setup activities under four
  identities and twelve client activities under thirteen — no scope with two.
- Count `batch_refused` events. On the same run there were none, and that was the finding rather than
  a pass: nothing was refused because no continuation was attempted. A refusal now means a worker read
  the standing and asked anyway, which is the bound working.
- Where no run forms, the question to answer is whether the orchestrator composed a continuation at
  all — `continue-batch` leaves no server-side trace of its own, so the evidence is a second
  `activity_dispatched` under one identity or nothing.

**Where it does not belong.** Re-running the walk test. It already passes and measures how much a
resumed context receives, not how many activities one context takes.

## W11 — gated, and the gate is not met

W11 asks whether re-delivered characters have fallen on production runs since the delivery-identity
fix (#408, merged 5 August 2026 as #410 and #411). Its own trigger is around ten completed
gate-crossing sessions.

**Sessions available on 6 August 2026:** two planning folders postdate the fix —
`2026-08-05-review-midnight-node-pr-1938` and `2026-08-06-workflow-retrospective-review` — and the
first of those straddles the build, since the container serving the run's first seven hours started
before the merge and cannot be identified. So the usable sample is at most one session, against an
original measurement that drew on twelve session records across nine profiled runs.

**The read is not attempted.** One or two sessions would not distinguish a fix from a quiet run, which
is the reason the trigger exists.

**Baselines to read against when it is met**, unchanged from the capture: re-delivery events expected
at zero, with the two identities on any occurrence distinguishing a replaced worker from the fault
returning; identity changes at gates against twelve of thirty-eight crossings taken over by a
different identity, nine re-receiving a full payload; and 677,132 characters re-delivered on identity
changes plus 1,109,551 on same-identity resumes that re-delivered a byte-identical payload.

**One thing #442 changes about it.** The capture says the total will not reach zero until W10 lands.
W10 is #442, so once that merges the residual is no longer explained by the activity body — the walk
records 83.5% collapse with the body included in the collapsible set.

## W5's audit, and what it found

The ceremony's commit cadence is changed in #439. The delivered-weight half of W5 was measured rather
than assumed, and the measurement is why the change is a cadence change alone.

Per-activity delivery for the meta setup ceremony, measured through the server over the same corpus
the 5 August run used — and reproducing that run's sealed figures exactly, which is what makes the
method trustworthy:

| Activity | Delivered | Its own bundled steps | Definition body | The rest |
|---|---:|---:|---:|---:|
| discover-session | 62,291 | 29,858 | 4,789 | 27,644 |
| initialize-session | 39,368 | 9,725 | 1,993 | 27,650 |
| resolve-target | 37,339 | 6,237 | 3,460 | 27,642 |
| dispatch-client-workflow | 31,990 | 0 | 4,388 | 27,602 |
| end-workflow | 53,067 | 23,296 | 2,132 | 27,639 |

Three findings:

- **No setup activity declares an activity-level technique**, so none delivers a technique its steps
  never exercise. `check:activity-tech` covers the class and passes.
- **No setup activity eager-bundles a resource at all**, so there is no resource delivered whole where
  a section would do. Every `planning-readme` reference in the corpus already carries a `#section`
  anchor; the whole-file fetches in the 5 August run were the agent's choice, which is what W3's
  guidance addresses.
- **The weight is the fixed activity bundle**, 27,600 characters on every activity of every workflow —
  the inherited `techniques.activity` set plus the core worker techniques plus the rules blocks. That
  is not a ceremony-specific concern and trimming it is a corpus-wide decision, so it is named here
  rather than done under W5. #441 takes about 4,000 characters off it by dropping the repeats inside
  one response.

So W5 delivers the single commit, and records that the per-activity trim it was scoped to find has
nothing in the setup activities' own declarations to take.
