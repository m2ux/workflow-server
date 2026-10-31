## Overview

This initiative replaces the agent as the runner. A **program** walks the steps, decides whether each one runs, and drives the loops. The prose that describes judgement stays as it is.

## Problem

Today the model does that mechanical job, and about 33,000 characters of every dispatch exist only to teach it how. The server hands over the definition and grades what comes back.

The definition does not mean one thing. The same yes/no test — a **gate** — can be written two ways, and of thirteen written both ways five return opposite answers. A run of steps cannot be named, so shared runs are copied: four copies of one run differ in ten ways. A program cannot take over a definition that answers two ways.

## Proposal

Make every definition mean one thing, then have a program walk it. The agent is called for judgement, writing, and putting a question to a person.

The destination and the alternatives weighed are in R1 [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign). A language that types those definitions lives on [#705](https://github.com/m2ux/workflow-server/issues/705).

A change this initiative makes to the definition language, to who receives which content, or to session transitions lands spec-first on the `language` branch [Language Branch](https://github.com/m2ux/workflow-server/issues/943) creates. [Formal Specification](https://github.com/m2ux/workflow-server/issues/937) and [Execution Model](https://github.com/m2ux/workflow-server/issues/939) state the rule and bind the enforcer built here.

- **Tip validation.**
  Each criterion passes the instrument it names, on the integration tips, as one ledger records.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E01](https://github.com/m2ux/workflow-server/issues/529) | One Predicate | AC1, AC3, AC8 | [I04:E08](https://github.com/m2ux/workflow-server/issues/528) | |
| [E02](https://github.com/m2ux/workflow-server/issues/699) | Write Authority | AC4 | [I04:E08](https://github.com/m2ux/workflow-server/issues/528) | |
| [E03](https://github.com/m2ux/workflow-server/issues/530) | Resolved References | AC2, AC3 | | |
| [E04](https://github.com/m2ux/workflow-server/issues/698) | Binding Resolution | AC2, AC3 | | |
| [E06](https://github.com/m2ux/workflow-server/issues/700) | Position and Repetition | AC5, AC7 | | |
| [E07](https://github.com/m2ux/workflow-server/issues/531) | Definition Shape | AC3 | | |
| [E08](https://github.com/m2ux/workflow-server/issues/532) | Mechanical Execution | AC4, AC5, AC6, AC7, AC8, AC10, AC12 | | |
| [E09](https://github.com/m2ux/workflow-server/issues/534) | Compiled Delivery | AC11 | | |
| [E10](https://github.com/m2ux/workflow-server/issues/533) | Session Record | AC7, AC9 | [E01](https://github.com/m2ux/workflow-server/issues/529), [E03](https://github.com/m2ux/workflow-server/issues/530), [E04](https://github.com/m2ux/workflow-server/issues/698), [E06](https://github.com/m2ux/workflow-server/issues/700), [E07](https://github.com/m2ux/workflow-server/issues/531), [E08](https://github.com/m2ux/workflow-server/issues/532) | |
| [E11](https://github.com/m2ux/workflow-server/issues/951) | Program Walk | AC4, AC6, AC10 | [E01](https://github.com/m2ux/workflow-server/issues/529), [E03](https://github.com/m2ux/workflow-server/issues/530), [E04](https://github.com/m2ux/workflow-server/issues/698), [E06](https://github.com/m2ux/workflow-server/issues/700), [E07](https://github.com/m2ux/workflow-server/issues/531) | |
| [E12](https://github.com/m2ux/workflow-server/issues/1101) | Tip Validation | AC13 | [E09](https://github.com/m2ux/workflow-server/issues/534), [E10](https://github.com/m2ux/workflow-server/issues/533), [E11](https://github.com/m2ux/workflow-server/issues/951) | |

## Acceptance Criteria

- [ ] **AC1.** The loader accepts a gate only when it parses under the one settled predicate form, shown by `check:activities` and `check:workflow-yaml` loading every workflow and activity and finding no gate written any other way.
- [ ] **AC2.** Every name a definition uses, whether reference, binding or placeholder, has the one meaning the server's loader gives it, shown by the guard suite resolving every site through that loader with none left unresolved.
- [ ] **AC3.** The whole guard suite, including the guards that hold gate form and name resolution, passes over every workflow and activity loaded through the resolved tree, shown by `check:all`.
- [ ] **AC4.** Every gate on the program path is decided from session values, including each that reads a value produced earlier in its own activity, shown by the all-workflows walk on the program path leaving no gate unanswered.
- [ ] **AC5.** No loop on the program path runs past its declared limit, shown by a fixture walk of a forEach, a while, a doWhile and a count-bounded cycle across activities.
- [ ] **AC6.** On the program path every call to an agent asks for judgement, writing or a question to a person, shown by the call-out log of the all-workflows walk on the program path.
- [ ] **AC7.** An interrupted run dispatched again into its folder continues at its next unexecuted step with its completed activities and variables intact, shown by an end-to-end test that interrupts a run inside a loop body.
- [ ] **AC8.** Every transition and every dismissal a session records matches the server's own derivation from session values, shown by replaying that derivation over recorded real sessions.
- [ ] **AC9.** Every session entry, once written, reads back byte-identical, including after a second dispatch into its folder or a rotated or lost signing key, shown by an end-to-end test that replays the record after each.
- [ ] **AC10.** No dispatch on any path carries grading or driving instruction, shown by the all-workflows walk finding none of the withheld grading or driving blocks in any dispatch it records.
- [ ] **AC11.** No context is sent a block it already holds, except on a forced full delivery, shown by the re-delivery report against the baseline at gate crossings.
- [ ] **AC12.** Every workflow completes a production run on the program path and is accepted by the same check its agent-driven runs passed, shown by that check.
- [ ] **AC13.** Every criterion of this initiative passes the instrument it names, on the integration tips, as the validation ledger records.

## Non-Goals

- Rewriting the prose that describes judgement.
- A typed authoring language.
- Building the routine construct.
- Stating the definition language's grammar and constraints formally.
- Moving the standing agent contract into role skills.
- The work the definitions owe whatever runs them.

## References

- **R1.** [Design record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-31-typed-execution-redesign) — Destination, diagnosis, counts, and dropped alternatives.
- **R2.** [Item disposition](https://github.com/m2ux/workflow-server/blob/engineering/artifacts/planning/2026-08-31-typed-execution-redesign/migration-disposition.md) — Disposition of the fifty-five work items.
- **R3.** [Programme rebase](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-12-i0-programme-rebase) — 2026-09-12 rebase against the runner specification.
- **R4.** [Routine construct](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-03-routines) — How a shared run of steps is declared and referred to.
- **R5.** [Routines sweeps](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-10-routines-sweeps) — Ten defects in the routine plan.
- **R6.** [Routines protocol](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-07-requirements-spec-for-the-routines-protocol) — Requirements specification for the routine construct.
- **R7.** [Typed language](https://github.com/m2ux/workflow-server/issues/705) — I03, the language that types the definitions this initiative makes mean one thing.
