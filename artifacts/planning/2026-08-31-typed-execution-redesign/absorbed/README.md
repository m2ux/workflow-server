# Absorbed issues — verbatim captures

The tracker was reorganised on 2026-08-31 so that its epics match the running order of the two-paths
initiative ([#527](https://github.com/m2ux/workflow-server/issues/527)) and so that interdependent
work shares a home. Thirteen issues were absorbed and closed. Each body is captured here verbatim at
the moment it closed, so the evidence, tables and acceptance detail stay reachable.

Each closed issue also carries a closing comment naming where every one of its work items now lives.
This file is the index of those redistributions.

## The eight epics work was redistributed into

The reorganisation produced **two initiatives**, and every open epic belongs to one of them. Each
stands on its own subject; neither is defined against the other, and neither gates the other.

- **[#527 — I0: Two Paths](https://github.com/m2ux/workflow-server/issues/527)** — the mechanical part
  of a run moves to a program, in stages, while the server stays in production use. Eight phases,
  42 items, 90–132 effort-days.
- **[#540 — I1: Standing Work](https://github.com/m2ux/workflow-server/issues/540)** — the workflow
  definitions carry twenty-three known faults, each found, written down, and owned by nobody. Five
  phases, 23 items, 34–50 effort-days.

Every epic title carries the initiative and the phase, so both running orders read off a sorted issue
list without anyone opening one: **`[Epic] I<n> P<n>: Name: The Broad Concern`**. That extends the epic
title convention rather than replacing it — the name still handles the area of concern and the
description still names it in five to eight words. Both initiatives number their phases from zero, so
the initiative prefix is what keeps `I0 P0` and `I1 P0` apart.

**I0 — Two Paths** (#527)

| Epic | Items | Item hours | Epic effort |
|---|---|---|---|
| [#528 I0 P0: Safe Ground](https://github.com/m2ux/workflow-server/issues/528) | 6 | 24–39 h | 7–10 days |
| [#529 I0 P1: One Predicate](https://github.com/m2ux/workflow-server/issues/529) | 7 | 36–60 h | 10–14 days |
| [#530 I0 P2: Resolved References](https://github.com/m2ux/workflow-server/issues/530) | 4 | 29–46 h | 7–10 days |
| [#531 I0 P3: Definition Shape](https://github.com/m2ux/workflow-server/issues/531) | 4 | 37–60 h | 8–12 days |
| [#532 I0 P4: Mechanical Execution](https://github.com/m2ux/workflow-server/issues/532) | 5 | 69–117 h | 14–22 days |
| [#533 I0 P5: Session Record](https://github.com/m2ux/workflow-server/issues/533) | 3 | 35–55 h | 7–11 days |
| [#534 I0 P6: Compiled Delivery](https://github.com/m2ux/workflow-server/issues/534) | 5 | 48–75 h | 11–15 days |
| [#535 I0 P7: Typed Definitions](https://github.com/m2ux/workflow-server/issues/535) | 8 | 129–205 h | 26–38 days |
| **Total** | **42** | **407–657 h** | **90–132 days** |

**I1 — Standing Work** (#540)

| Epic | Items | Item hours | Epic effort |
|---|---|---|---|
| [#537 I1 P0: Live Faults](https://github.com/m2ux/workflow-server/issues/537) | 6 | 27–45 h | 8–11 days |
| [#538 I1 P1: Decisions That Take Effect](https://github.com/m2ux/workflow-server/issues/538) | 3 | 22–38 h | 5–8 days |
| [#438 I1 P2: Review by Definition](https://github.com/m2ux/workflow-server/issues/438) | 6 | 31–50 h | 8–11 days |
| [#539 I1 P3: Shared Capability and Delivery Grain](https://github.com/m2ux/workflow-server/issues/539) | 5 | 34–57 h | 8–12 days |
| [#310 I1 P4: Reach](https://github.com/m2ux/workflow-server/issues/310) | 3 | 22–36 h | 5–8 days |
| **Total** | **23** | **136–226 h** | **34–50 days** |

**Both tracks: 65 work items, 543–883 agent hours, 124–182 effort-days.** Neither is gated on the
other. Three overlaps are named on both sides, each resolved by whichever lands second.

A work item is estimated in agent hours — one uninterrupted implementation run. An epic is estimated
in effort-days: that work at six productive hours a day, plus half a day per item for the review and
integration cycle each pull request carries. Neither includes the coverage walk's runtime or the human
decisions a gated item waits on, and neither is elapsed time.

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
| #338 Corpus backlog | [issue-338](./issue-338-corpus-backlog.md) | W1 → #536 as its own issue; W2 → #535 W6; W3 → #529 W5; W4 **absorbed** by #531 W2 |

## Absorbed into I1

| Absorbed | Capture | Where its work went |
|---|---|---|
| #400 Decision integrity | [issue-400](./issue-400-decision-integrity.md) | W1 narrowed / W2 / W4 → #538; W3 → #537 W2 |
| #399 Shared homes | [issue-399](./issue-399-shared-homes.md) | W1/W2/W4 → #539; W3 → #531 W4 (I0) |
| #398 Section delivery | [issue-398](./issue-398-section-delivery.md) | W2/W3 → #539; W1 → #530 W1 (I0) |
| #491 Found by running | [issue-491](./issue-491-found-by-running.md) | f2/f3 → #537; f4 → #438 W6; f1 → #530 W3 (I0) |
| #536 Content defects | [issue-536](./issue-536-content-defects.md) | #537 W1 |
| #511 Issue creation | [issue-511](./issue-511-issue-creation.md) | #537 W5 |
| #437 Deployment hardening | [issue-437](./issue-437-deployment-hardening.md) | W1 → #537 W6; W2 → #533 W3 (I0) |

Two epics mapped onto a phase without regrouping and were **retitled rather than replaced**: #438
became I1 P2 and gained one item from #491; #310 became I1 P4 unchanged.

#536 was itself filed during this reorganisation, carrying #338's five enumerated content defects, and
absorbed into #537 in the same pass — a two-step that reflects the order the work was done in rather
than a change of mind about where the defects belong.

## Two epics were hollowed out, and each was handled on its own terms

An epic with one live work item is a heading rather than a grouping, and both were resolved by asking
whether the epic's *subject* survived the loss of its other items.

**#338's did not.** Its subject was the definition debt left behind when earlier issues closed
part-merged. Three of four remainders went to the transition, and five enumerated content defects are
not that subject. Closed, with the defects re-filed as #536.

**#437's did.** "The server outside a developer's machine" still describes dependency pinning exactly.
Retitled, body unchanged, nothing re-filed.

The re-check that produced this also corrected an error in the first pass: **#338 W4 was recorded as
gated on #531 W1 when it is absorbed by #531 W2.** A retire sweep of constructs registered for removal
was dormant because it needed a breaking version to execute against; under the transition there is no
breaking version, there is a conversion, and a converter drops such constructs rather than carrying
them. The register becomes an input to the converter, which is recorded on #531.

## What was stopped

Seven work items build mechanism the destination removes. Each is recorded on its own issue with the
phase that replaces it named, and the reasoning for each is in
[migration-disposition.md](../migration-disposition.md).

#436 W1 · #404 W3 · #404 W8 · #404 W11 · #513 stage 6 · #397 W3b · #518 W5.1 relocation half

**No evidence was discarded with them.** #404 W11's re-delivery baselines — 677,132 characters at gate
crossings and 1,109,551 on same-identity resumes — are carried into #534's final acceptance criterion,
where the question is answered from the compiled corpus rather than sampled from production.
