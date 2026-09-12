## Summary

A step's results reach the session, in the main, only when its whole activity finishes. More than half of every condition in the corpus asks about something produced inside the activity it sits in — 274 of the sites the investigation counted, against 194 fed by an earlier activity. While those results are frozen, a program walking the definition can decide only the minority. The committed end-to-end baseline recorded the effect across 79 activity deliveries: 313 conditions the server could not yet answer, and not one delivery that answered every condition it carried.

This epic makes a step's declared outputs land when the step finishes, has the server derive the set of names that step may write, and gives the session store an index or a cache so roughly 1,085 writes per run are affordable against a store that currently reads and parses every session file on every call. It is the load-bearing stage of [#527](https://github.com/m2ux/workflow-server/issues/527). Until it lands, the fidelity argument has no purchase.

This epic covers one work item per gap.

## The three gaps

**Results arrive too late for the conditions that read them.** Answering a decision already lands values mid-activity, and yielding a checkpoint already accepts a bag of changes before the gate is presented. Outside those two routes the bag is frozen at what it was when the activity opened. The majority of conditions therefore stay unanswerable to anyone but the agent that produced the earlier step.

**Nothing joins "this step may write these names" to "the session gained them".** The server already owns the analysis that works out which values a step may write. A step's report is one free-text string checked for non-emptiness. Type and value-set disagreements are warn-only.

**The store cannot afford a write per step.** Every authenticated call walks the planning tree and parses every session file it finds — 73 files totalling 4,884,336 bytes in the investigation's checkout, the largest 392,155 — with no index, no cache, and no early exit once a match is found. The already-sent-content ledger is a delivery-deduplication record, not this index. Per-step writes without an index multiply that walk from about 79 times a run to about 1,085.

## The work

**W1 — The session store gains an index or a cache.** A lookup by session identifier does not parse every session file. This is a prerequisite for W3, not a follow-up to it. The delivery ledger is left alone.

**W2 — A step identifier is unique within its activity.** One check covering the whole activity, not a fresh check per loop body. The corpus has zero duplicates across the activities reachable from every workflow graph, so this is a permission nobody uses. It keeps step lookup correct rather than lucky, and it keeps the position key valid.

**W3 — A step's declared outputs land when the step finishes.** The yield-checkpoint write path is the model: values arrive without moving the activity pointer. The server derives the set of names the step may write, applies what falls inside that set, and returns the accepted names, the rejected names each with a reason, and the values delta. A value falling outside the set is refused, not warned.

**W4 — A missing value fails a positive test loudly; absence keeps its meaning for negative and presence tests.** The corpus spells "not in that mode" as a value nobody set. This item lands after [#528](https://github.com/m2ux/workflow-server/issues/528) W4 has listed where the two collectors disagree about inequality, so the rule is applied consistently.

## Why now is cheap

Two mid-activity write routes already exist, so the work is a generalisation rather than an invention. The producer index the delivery path already builds is the write-set derivation. The cost of waiting is every condition that reads an earlier step of its own activity — the majority — remaining unanswerable.

## Acceptance criteria

- [ ] A session lookup by identifier does not parse every session file, and the investigation's walk-every-file cost is no longer the per-call path.
- [ ] Two steps in different loop bodies of one activity cannot share an identifier; the load fails.
- [ ] A step's declared outputs are in the session bag when that step finishes, without waiting for the activity to end.
- [ ] A produced value falling outside the derived write set is refused, with the reason named, and the accepted names, rejected names and values delta come back on the same call.
- [ ] A missing value fails a positive test; a negative or presence test still treats absence as meaningful, on the evidence of the #528 W4 list.

## Non-goals

- **Driving iteration, or a cursor that names the current step.** Those are the position-and-repetition epic. This epic makes the bag current enough for a cursor to be worth recording.
- **The append-only event log, or continuing a run rather than refusing a second dispatch.** Those stay on [#533](https://github.com/m2ux/workflow-server/issues/533).
- **The runner package.** [#532](https://github.com/m2ux/workflow-server/issues/532) walks a bag this epic has made answerable.

## Tracking

Each work item is delivered as its own pull request when picked up.

| | Work item | Agent time | Gate |
|---|---|---|---|
| [ ] | **W1** — the session store gains an index or a cache | 6–10 h | — |
| [ ] | **W2** — a step identifier is unique within its activity | 1–2 h | — |
| [ ] | **W3** — a step's declared outputs land when the step finishes | 8–12 h | W1 |
| [ ] | **W4** — the missing-value rule | 2–3 h | W3; Safe-ground W4 |
| | **Epic total** | **3–5 days** | |

Carries specification REQ-F030, REQ-F031, REQ-F032, REQ-F034, REQ-F046 and REQ-NF027.

## Investigation detail

The rebase that created this epic, the 274 / 194 / 313 figures, and the store-cost argument:
**[2026-09-12-i0-programme-rebase](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-12-i0-programme-rebase)**

The write-timing decision:
**[2026-08-28-runner-execution-protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-28-runner-execution-protocol)**
