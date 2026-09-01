# Delivery reconciliation — what was already merged when the epics were written

**Date:** 2026-09-01
**Method:** merged pull requests on `origin/main` and `origin/workflows`, checked against the code and
corpus rather than against pull-request titles.

## Why this exists

Both initiatives were built from the bodies of the issues they absorbed. Those bodies describe the
state of the world when each was last edited, and in several cases work has merged since. So the epics
carry items that are already delivered, and their estimates are overstated by that amount.

This file records what is verified delivered, what is partly delivered, and what could not be settled
without a closer read than this pass gave it.

**Confidence is marked per row.** *Verified* means the code or corpus was inspected. *Evidenced* means
a merged pull request states it and nothing contradicts it. *Unsettled* means the instruments cannot
currently answer.

---

## Verified delivered

| Item | Delivered by | Evidence inspected |
|---|---|---|
| **I0 P0 W6** — bootstrap stops sending content nobody reads | PR #439 | No schema read remains in the engine techniques; `tests/bootstrap-budget.test.ts` exists |
| **I0 P6 W1** — compose each instruction set once per delivery | PR #440 | The per-activity memo is in `binding-provenance.ts`; `tests/provenance-resolve-once.test.ts` exists |
| **I0 P6 W5** — the ceremony commits once | PR #439 | Same pull request; its subject states it |
| **I1 P1 W1** — one presentation contract | PRs #514 (corpus), #515 (code) | Merged commits are the item's scope: the guard for its one home, softness spelled once as the field pair, enforced at load, each checkpoint rule in the home whose domain it is |
| **I1 P2 W6** — a deferred row reaches an issue | PRs #509, #510 | Merged into `workflows`; commits raise a deferred item through the issue-creation operation and retire the register's claim about who raises its rows |

## Partly delivered

| Item | What landed | What remains |
|---|---|---|
| **I1 P0 W1** — the five content defects | At least two. The environment assignment now precedes `nice` in every operation, and the checkpoint options set `problem_complexity`, the name the message interpolates | Three unverified: the create-issue first step, the suite-runner concurrency tension, and whether the test-thread budget disagreement is fully closed |
| **I1 P0 W4** — the guard runs | PR #507 registered the branch-as-step guard | **The recurrence half does not exist.** `tests/guard-registry.test.ts` checks registry→script only. There is no `readdirSync` in it, so nothing checks script→registry, and the next unregistered guard is still silent |
| **I1 P1 W2** — approvals that apply | Corpus half, PR #516 — open judgements resolved at a gate that records the answer, a removal inventoried wherever the run discovers it | Code half is one unmerged commit on `fix/400-w2-approvals-that-apply` |
| **I1 P3 W5** — classify the framings | The classification pass appears to have run: `workflows/section-framing-triage.json` carries 104 verdicts against the 69 framings the issue counted | Fix-per-class, the canon clause and the catalogue's mechanical detection unverified |
| **I0 P0 W5** — the cost line and the fan-out ratios | Per-technique and per-resource delivery cost lines exist in `resource-tools.ts` | The per-delivery summary and the two fan-out ratios unverified |
| **I0 P4 W5 / I0 P7 W6** — conduct rule homing | PRs #521, #522 homed each conduct rule with the audience that can act on it, catalogued three restatement classes and declared the value sets | `agent-conduct.md` still carries orchestrator-scoped rules. Whether that is correct-by-declaration or residue needs a read |

## Verified still open

| Item | Evidence |
|---|---|
| **I1 P0 W6** — pin the seed family | No `overrides` block in `package.json` |
| **I1 P4 W1** — bind the graph where reasoning is structural | The six named workflows still contain zero references to the graph operations |
| **I0 P1 W4 / W5** — remove the second dialect, sweep the nested gates | Roughly 110 structured conditions remain in the corpus, matching the 109 blocks the source issue counted |
| **I0 P1 W6** — a declaration constrains the values it admits | No value-set constraint in `src/schema/variable.schema.ts` |

## Unsettled — and why

**I1 P0 W2, the binding sweep.** The guard reports `70 violations — 70 harmless, 0 fix-later, 0 live
bugs, 0 untriaged`, which reads as done. It also reports that its verdicts were made against corpus
`3569e93` while the checkout is at `09b6067` — **281 corpus commits of drift**.

So the clean result is measured against judgements made 281 commits ago. The sweep may be complete or
the guard may simply be unable to see what changed. Nothing in the current instruments distinguishes
those, and the item cannot be closed or costed until the verdicts are re-stamped.

**This is the strongest evidence yet for I0 P7 W7.** When #497 was written the drift was 249 commits.
It is now 281. The number the issue used to argue that a corpus which cannot check itself accumulates
unreadable state has grown by 32 commits while the issue sat open.

**Eight further items were not read closely enough** to distinguish delivered from open: I1 P2 W1–W5
and I1 P1 W3, plus I0 P2 W1 and I0 P6 W3. Each is corpus content whose status needs its acceptance
criteria walked against the definitions, which is a slower pass than this one.

---

## Effect on the estimates

Five items are delivered outright and six are partly delivered, out of 65. The two initiatives'
totals are overstated by roughly that share, and the affected epics carry the correction.

Two corrections are structural rather than arithmetic:

- **I1 P1 has one item left of three.** With W1 delivered and W2's corpus half merged, what remains is
  one unmerged code commit and W3. That is below the size at which an epic earns its own heading, and
  it should be reconsidered the same way #338 and #437 were.
- **I1 P0 W4 is the reverse of what it looked like.** It was estimated as a registry entry plus a
  meta-check. The registry entry is done; the meta-check — the half that stops the fault recurring — is
  the whole of what is left.

## What this says about the method

The epics were assembled from issue bodies without checking merge history. Every count, every estimate
and every acceptance criterion inherited whatever staleness the source body carried, and three of the
sources had merged work behind them.

**A body's last-edited date is not its scope's as-of date.** Any future consolidation should reconcile
against the branches first, and the reconciliation belongs in the epic, not beside it.
