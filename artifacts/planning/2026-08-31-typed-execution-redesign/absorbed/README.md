# Absorbed issues — verbatim captures

The tracker was reorganised on 2026-08-31 so that its epics match the running order of the two-paths
initiative ([#527](https://github.com/m2ux/workflow-server/issues/527)) and so that interdependent
work shares a home. Thirteen issues were absorbed and closed. Each body is captured here verbatim at
the moment it closed, so the evidence, tables and acceptance detail stay reachable.

Each closed issue also carries a closing comment naming where every one of its work items now lives.
This file is the index of those redistributions.

## The eight epics work was redistributed into

| Epic | Phase | Items | Agent time |
|---|---|---|---|
| [#528 Safe Ground](https://github.com/m2ux/workflow-server/issues/528) | P0 | 6 | 24–39 h |
| [#529 One Predicate](https://github.com/m2ux/workflow-server/issues/529) | P1 | 7 | 36–60 h |
| [#530 Resolved References](https://github.com/m2ux/workflow-server/issues/530) | P2 | 4 | 29–46 h |
| [#531 Definition Shape](https://github.com/m2ux/workflow-server/issues/531) | P3 | 4 | 37–60 h |
| [#532 Mechanical Execution](https://github.com/m2ux/workflow-server/issues/532) | P4 | 5 | 69–117 h |
| [#533 Session Record](https://github.com/m2ux/workflow-server/issues/533) | P5 | 3 | 35–55 h |
| [#534 Compiled Delivery](https://github.com/m2ux/workflow-server/issues/534) | P6 | 5 | 48–75 h |
| [#535 Typed Definitions](https://github.com/m2ux/workflow-server/issues/535) | P7 | 8 | 129–205 h |

## Redistribution map

| Absorbed | Capture | Where its work went |
|---|---|---|
| #526 Typed Execution | [issue-526](./issue-526-typed-execution.md) | W1–W2 → #531; W3 → #532; W4 → #533; W5 → #534; W6–W7 → #535. Design record stays as this folder's README |
| #523 Runner | [issue-523](./issue-523-runner.md) | #532 W1–W3, in full, with five coexistence amendments |
| #520 Routine | [issue-520](./issue-520-routine.md) | #531 W3, in full |
| #519 Fragment homes | [issue-519](./issue-519-fragment-homes.md) | Rule bodies → #535 W6; the two checkpoint bodies → #531 W3 |
| #518 Rule homes | [issue-518](./issue-518-rule-homes.md) | W5.1 reduced → #532 W5; W5.4 value-set half → #529 W6; rest → #535 W6 |
| #513 Expression grammar | [issue-513](./issue-513-expression-grammar.md) | Stage 1 → #528 W4; stages 2–5 → #529; **stage 6 stopped** |
| #497 Corpus tests | [issue-497](./issue-497-corpus-tests.md) | #535 W7, in full |
| #492 Wrapper prose | [issue-492](./issue-492-wrapper-prose.md) | #535 W8, reopened on different terms |
| #436 Engine surfaces | [issue-436](./issue-436-engine-surfaces.md) | W2 reduced → #532 W4; **W1 stopped** |
| #404 Delivery cost | [issue-404](./issue-404-delivery-cost.md) | W2/W4/W6 → #528; W1/W5/W7/W9/W10 → #534; **W3, W8, W11 stopped** |
| #402 Server unblocks | [issue-402](./issue-402-server-unblocks.md) | W1 → #529 W3; W2 → #535 W6 |
| #401 Session creation | [issue-401](./issue-401-session-creation.md) | W2 → #528 W2; W3 split #528 W1 / #533 W2; W1 → #535 W4 |
| #397 Protocol structure | [issue-397](./issue-397-protocol-structure.md) | W2 + batches → #530; W1/W4 → #535 W5; W3a → #534 W4; **W3b stopped** |

## Issues that stayed open

Six kept their remaining items and gained a comment recording what moved and which gates were
retargeted: **#338** (W1 and a retargeted W4), **#398** (W2, W3), **#399** (W1, W2, W4), **#400** (all
four, W1 narrowed to one of the two branches it offered), **#437** (W1), **#491** (findings 2–4).

Three were left untouched on the independent track and gained only a note saying so: **#438**,
**#310**, **#511**.

## What was stopped

Seven work items build mechanism the destination removes. Each is recorded on its own issue with the
phase that replaces it named, and the reasoning for each is in
[migration-disposition.md](../migration-disposition.md).

#436 W1 · #404 W3 · #404 W8 · #404 W11 · #513 stage 6 · #397 W3b · #518 W5.1 relocation half

**No evidence was discarded with them.** #404 W11's re-delivery baselines — 677,132 characters at gate
crossings and 1,109,551 on same-identity resumes — are carried into #534's final acceptance criterion,
where the question is answered from the compiled corpus rather than sampled from production.
