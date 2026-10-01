# I10 Work Package Streamline — planning record

Initiative: [I10](https://github.com/m2ux/workflow-server/issues/1040). Epics: [E00 Lean Reviews](https://github.com/m2ux/workflow-server/issues/1041), [E01 Assumption Settling](https://github.com/m2ux/workflow-server/issues/1042), [E02 Routine Bindings](https://github.com/m2ux/workflow-server/issues/1043), [E03 Parallel Reviews](https://github.com/m2ux/workflow-server/issues/1044), [E04 Contract-First Tests](https://github.com/m2ux/workflow-server/issues/1045), [E05 Tip Validation](https://github.com/m2ux/workflow-server/issues/1099).

Integration branches: `i10/main` and `i10/workflows`, cut from `main` at `6bb35651` and `workflows` at `d0dd198d`.

## Problem

The work-package workflow spends effort its change does not need, and loses values it passes between steps. The [scan](scan.md) holds the census: reports with method records, an imposed prism pipeline, convergence in seven activities, routine values that reach the wrong variable, independent work in series, and tests written by the agent that wrote the code.

## Goal

Confirmed with the user, one clause per observable outcome:

1. Each review leaves one terse report, code named in words and links in prose.
2. The full prism pipeline runs only on an assessed recommendation the user accepts, or on a review run of a complex change.
3. Assumptions converge only where they are settled, through one shared routine.
4. Every routine name a body step reads or writes reaches the variable its site binds, held by a guard.
5. Independent reviews, and research beside implementation analysis, run side by side.
6. Implementation is checked against contract tests written from the plan before the code.
7. Each changed activity is held by a canon audit and a sidecar specimen walk.
8. Every initiative criterion passes its named instrument on the integration tips before those tips merge, as one validation ledger records.

## Trace

| Clause | Initiative criteria | Epics | Epic criteria |
|---|---|---|---|
| 1 | AC1, AC2 | E00 | E00 AC1, AC2, AC3 |
| 2 | AC3, AC4 | E00 | E00 AC4, AC5, AC6 |
| 3 | AC5, AC6 | E01 | E01 AC1, AC2, AC3, AC7 |
| 4 | AC7 | E02 | E02 AC1–AC8, AC10 |
| 5 | AC8, AC9 | E03 | E03 AC1–AC5 |
| 6 | AC10, AC11, AC12 | E04 | E04 AC1–AC6 |
| 7 | AC13, AC14 | all | each epic's audit and specimen criteria; E02 AC9 |
| 8 | AC15 | E05 | E05 AC1, AC2 |

E01 AC4, AC5 and AC8 trace to clause 3's routine work and to the user's direction to follow the integration-branch scheme.

## Decisions

- **Placement.**
  A new initiative, not epics in I02 or I04: its integration branches merge when its own work is done, and the coupled routine-binding chain stays in one initiative.
- **Theme.**  Canon: four of the five epics change work-package definitions, each driven by canon audits.
- **Paired integration CI.**
  Engine CI checks out `iNN/workflows` and corpus CI `iNN/main` when the pull request's base is the other half of an initiative, so coupled changes are tested together (E01 W01, W02).
- **Local unbound outputs.**
  An optional output a site leaves unbound is local to that use of the routine, renamed as an internal is, rather than dropped (E02 W04).
- **Earlier decisions.**  The scan's [Decisions](scan.md#decisions) hold the report, prism, convergence, parallelism and contract-first choices.
- **Prism child stays at the fan join (E03).**
  Load-time L14 refuses `workflow-engine::handle-sub-workflow` on a fanned activity: a child session records one activity id while a fan holds several in flight. The full prism walk therefore runs at post-implementation review (the join); the structural-analysis fan branch runs the inline pass only.
- **Tip validation as E05 (I10).**
  Lives on the same initiative. Re-executes every AC1–AC14 instrument on `i10/main` and `i10/workflows` (no new automated checks beyond those instruments). One task writes [e05-validation-ledger.md](e05-validation-ledger.md). Integration PRs merge only after every ledger row passes.

## Delivery order

E01 W01 #1046 and W03 #1010 are delivered to `i10/main`. The [progress review](progress-2026-10-01.md) records their evidence and the current CI dependencies.

1. E00's roster correction #1049 into `i10/workflows`.
2. E01 W02 #1047, with the roster correction, into `i10/workflows`.
3. E01 W04–W07 #1018 into `i10/workflows`, after merging `i10/workflows` into its branch so its corpus CI file carries the pairing.
4. E02 W01 #1032 into `i10/workflows`.
5. E02 W02–W05 #1031 into `i10/main`.
6. E02 W06 #1033, retargeted to `i10/workflows` once #1018 merges.

## Reviews

- **Goal pass on the drafts.**  Every clause traces to an initiative criterion, and every initiative criterion to an epic row; the dependency check reported no problem after E02 W07's implied dependency and E04's missing E01 dependency were folded in.
- **Audit rounds.**  The claim tables [pr1](pr1-claims.md), [pr2](pr2-claims.md) and [pr3](pr3-claims.md) record each delivery's audit rounds and sidecar walk.

