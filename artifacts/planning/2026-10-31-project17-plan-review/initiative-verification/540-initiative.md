## Overview

This initiative owns the known faults in the workflow definitions — what is wrong on every run, decisions that do not take effect, and work the definitions leave to people — so each kind of debt has a home and does not lose to anything larger when it is triaged alone.

## Problem

The definitions are the product: which questions get asked, which checks run, what gets written down, and what a person is stopped for. They carry twenty-three known faults. Some fire every time they are reached — a command that cannot work as written, a binding that resolves to nothing, an activity that can be entered twice with no way out. Some make a decision not stick. Some leave work to people that a definition should do.

Each is written down with its location and owned by nobody. That is why they persist.

## Proposal

One epic per kind of debt, twenty-seven items across them. Comprehension across runs lives on [#587](https://github.com/m2ux/workflow-server/issues/587).

The grouping, and a verbatim capture of each issue whose items this initiative carries, are in R1 [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign).

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/537) | Live Faults | AC1, AC2, AC3, AC13 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/538) | Effective Decisions | AC4, AC5, AC13 | | ✓ |
| [E02](https://github.com/m2ux/workflow-server/issues/438) | Review by Definition | AC6, AC7, AC13 | | ✓ |
| [E03](https://github.com/m2ux/workflow-server/issues/539) | Shared Capability | AC8, AC9, AC13 | | ✓ |
| [E04](https://github.com/m2ux/workflow-server/issues/310) | Knowledge Reach | AC10, AC13 | | ✓ |
| [E05](https://github.com/m2ux/workflow-server/issues/634) | Concurrent Execution | AC11, AC12, AC13 | | |
| [E06](https://github.com/m2ux/workflow-server/issues/952) | Guard Coverage | AC3, AC8, AC10 | | |

## Acceptance Criteria

- [x] **AC1.** A second pass through the re-entrant activity always has an unfinished stage to reach, as `check:activity-variables` reports no unreachable read on re-entry.
- [x] **AC2.** Every guard with a script and a test runs in the suite, enforced by the registry check that fails on a guard missing from the registry.
- [ ] **AC3.** An install that resolves any denylisted package version fails the build, as `check:lockfile` running in the server's continuous integration shows.
- [ ] **AC4.** Every effect an approval records is applied, shown by the decision-integrity disposition check reporting no approved effect left unapplied.
- [x] **AC5.** The presentation contract has one home, enforced by the rule-text guard failing any presentation claim stated elsewhere.
- [ ] **AC6.** Every check a reviewer would otherwise perform from memory is a review-path step that records its outcome, shown by the work-package snapshot walk.
- [x] **AC7.** Every canonical register that close-out reads has an activity that writes it, as the work-package snapshot walk shows.
- [ ] **AC8.** Every citation in the ranked whole-file tail carries a recorded delivery outcome, as `check:citations` reports against its triage ledger.
- [x] **AC9.** Every framing above a first heading carries a recorded verdict, as `check:framing` reports.
- [ ] **AC10.** No workflow whose job includes structural reasoning binds zero graph operations, as the graph-reach guard reports.
- [ ] **AC11.** Fan-out has one stated owner in the corpus, as the fan-out ownership guard reports.
- [ ] **AC12.** Every site the concurrency survey classed ready or blocked is migrated to a graph fan or carries a recorded reason not to migrate, shown by the concurrency-demand inventory check reporting no site with neither.
- [ ] **AC13.** Each known fault is fixed or carried by open work, shown by the standing-work disposition check reporting no fault with neither.

## Non-goals

- Engine changes, including graph destinations that name several activities, and work gated on a phase of the engine transition.
- Measuring wall-clock or delivery cost.
- Comprehension across runs.
- Shared operation libraries and construct grain.

## References

- **R1.** [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign) — Grouping, disposition, and verbatim captures of the issues whose items this initiative carries.
- **R2.** [Delivery reconciliation](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-31-typed-execution-redesign/delivery-reconciliation.md) — Each already-delivered item with the pull request that landed it.
- **R3.** [Captured issues](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign/absorbed) — The seven issues whose items this initiative carries, with the owner of each item.
- **R4.** [Shared Libraries](https://github.com/m2ux/workflow-server/issues/946) — I08, which owns the shared operation libraries and construct grain.
