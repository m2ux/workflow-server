## Overview

This initiative is the language in which a workflow definition states its own rules.

## Problem

The rules a definition must obey are written outside the definitions: checking scripts, catalogue entries, and principles. Type-checking lives where nothing keeps it honest. The runner specification carries no compatibility obligation toward a later language.

## Proposal

Author definitions in a language whose checker enforces what the current scripts enforce. Disposition every script, catalogue entry, and principle. Make what a step may do part of its type. Declare presets, alternatives, and modules. Let the corpus check itself. Disposition instruction sets that only wrap a tool call.

The destination and the alternatives weighed are in R1 [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign).

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/535) | Typed Definitions | AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC9, AC10, AC11 | | |
| [E01](https://github.com/m2ux/workflow-server/issues/953) | Checker Fixtures | AC4, AC5, AC6, AC7, AC8 | [E00](https://github.com/m2ux/workflow-server/issues/535) | |

## Acceptance Criteria

- [ ] **AC1.** Every corpus workflow compiles from the language to the definition structure, with a whole-corpus compile reporting zero errors.
- [ ] **AC2.** Every tier's checker is generated from that tier's formal artifact (a constraint model, or the type definition that is the grammar), so regenerating it reproduces the committed checker exactly, as a guard that regenerates every checker and compares it with the committed one reports.
- [ ] **AC3.** Every rule stated outside the language, whether a registered rule id, an anti-pattern entry the canon keeps or a principle, carries a recorded verdict of retired, kept, or declined with its reason, with none missing from the disposition record, as a guard that reconciles that record against the guard registry and the canon reports.
- [ ] **AC4.** Every rule whose verdict is kept is enforced by the language's checker, shown by a violating fixture per rule that the checker rejects.
- [ ] **AC5.** Compiling rejects every workflow in which a step's declared kinds of effect exceed the workflow's declared ceiling, shown by a rejecting fixture for each kind of effect.
- [ ] **AC6.** The disclosure guarantee holds as a declared ceiling at least as strongly as the analysis it replaces, shown by a fixture suite of every case `check:stealth` rejects, each of which the ceiling also rejects.
- [ ] **AC7.** The checker verifies reachability separately under every declared preset, rejecting a preset that leaves any activity unreachable, shown by a rejecting fixture preset.
- [ ] **AC8.** The checker verifies selection in both directions for every declared alternative set, shown by a rejecting fixture for each direction.
- [ ] **AC9.** Every shared body in the corpus lives in a module named for what it is, with the whole-corpus compile finding no shared body owned by a domain workflow.
- [ ] **AC10.** Every corpus pull request's CI run reports its coverage, walks and delivery cost before merge, as the checks on a corpus pull request show.
- [ ] **AC11.** No test on the code branch reads the corpus, as a CI check that fails on any such read enforces.

## Non-goals

- Formally specifying the language as it stands.
- The runner and the structure definitions compile to.
- Host enforcement of what a step may do, beyond stating where the type's guarantee ends.

## References

- **R1.** [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign) — Destination, diagnosis, and item-by-item disposition.
- **R2.** [Workflow Runner](https://github.com/m2ux/workflow-server/issues/527) — I00, the runner this language compiles to.
- **R3.** [Workflow Design](https://github.com/m2ux/workflow-server/issues/936) — I07, whose formal specification of the current language ([E01](https://github.com/m2ux/workflow-server/issues/937)) the formal artifacts start from.
