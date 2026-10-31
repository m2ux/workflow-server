## Overview

This initiative gives every operation more than one workflow needs a single home in a shared library, and has each workflow that uses one bind it. The GitHub, Git and GitNexus libraries cover what board-driven, revision-pinned and cross-repository work asks of them. Every answer they give says what settled it. The operations trapped inside workflow families live in support libraries. Every construct sits at the grain the canon's tests assign. The reviews test against this end state: no workflow re-describes or privately owns an operation a shared library holds.

## Problem

Toolchain probes and revision pinning are still held by one workflow family each.

- **Probes and revision pinning are private.**
  Midnight's GitNexus and cargo probes, and Substrate's revision step, sit in the workflows that use them. The canon names this as an anti-pattern: a reusable primitive trapped in a client workflow (R2).

## Proposal

- **Extend the three tool libraries.**
  GitHub gains label-family writes and board field reads and writes over the Projects REST endpoints. Git gains a pin operation and a readiness run over a roster of checkouts. GitNexus gains a run that measures a concern's reach across every member of a repository group. Each operation confirms what it did or names the instrument behind its answer.
- **Survey, then hoist.**
  A reviewed survey gives each hoist candidate a destination library and a grain verdict before anything moves. Approved moves land as content-preserving relocations, one family per branch, with every referring workflow re-bound.
- **Correct grain by the canon's tests.**
  Protocol that iterates or stops for a person becomes a routine or an activity checkpoint. Content an agent consults rather than performs becomes a resource.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/879) | GitHub Library | AC1, AC2, AC6 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/880) | Git Library | AC3, AC4, AC7, AC8, AC11 | | ✓ |
| [E02](https://github.com/m2ux/workflow-server/issues/881) | GitNexus Library | AC5, AC9, AC10 | | ✓ |
| [E03](https://github.com/m2ux/workflow-server/issues/882) | Support Libraries | AC11, AC12, AC13, AC14 | [E01](https://github.com/m2ux/workflow-server/issues/880) | |
| [E05](https://github.com/m2ux/workflow-server/issues/955) | Specimen Smoke Runs | AC3, AC4, AC5, AC7, AC8, AC9, AC10 | [E01](https://github.com/m2ux/workflow-server/issues/880), [E02](https://github.com/m2ux/workflow-server/issues/881) | |

## Acceptance Criteria

- [x] **AC1.** A workflow replaces the one label a board keeps per family through a shared GitHub library operation, shown by a scratch-board run whose re-read finds only the new label.
- [x] **AC2.** A workflow writes a GitHub Projects item field through a shared GitHub library operation, shown by a single-select field write on the scratch board.
- [ ] **AC3.** A workflow brings a checkout to a named commit, tag or branch head through a shared Git library operation, shown by a smoke run of the git-pin-conformance specimen landing each kind.
- [ ] **AC4.** A workflow makes a roster of checkouts ready at stated revisions through a shared Git library run, shown by a smoke run of the git-pin-conformance specimen holding checkouts at distinct revisions side by side.
- [ ] **AC5.** A workflow measures a concern's reach across every member of a repository group through a shared GitNexus library run, shown by a smoke run of the gitnexus-radius-conformance specimen answering for every member.
- [x] **AC6.** Every write the GitHub library's label-family and project-board operations make is confirmed by reading the landed value back, shown by a scratch-board re-read of each write.
- [ ] **AC7.** Every pin answers with the commit its checkout actually landed on, shown by a smoke run of the git-pin-conformance specimen.
- [ ] **AC8.** No pin lands a checkout on a revision its name does not resolve to, shown by a smoke run of the git-pin-conformance specimen refusing an unresolvable name with the checkout left at the earlier pin's commit.
- [ ] **AC9.** No per-member reach entry omits the graph or instrument behind it, shown by the rows a smoke run of the gitnexus-radius-conformance specimen writes.
- [ ] **AC10.** Every reach that no graph holds an edge for is settled by a recorded search of the member's tree, shown by the hand-derived rows of a smoke run of the gitnexus-radius-conformance specimen.
- [ ] **AC11.** Every operation that more than one workflow binds directly, with the same outputs, lives in exactly one shared library, as the shared-operation guard reports.
- [ ] **AC12.** Every workflow that uses a hoisted operation binds it from its shared library, shown by the all-workflows walk and `check:refs` passing over every re-bound workflow.
- [ ] **AC13.** Every repeatable run or stop for a person on a site the survey approved is a routine or an activity checkpoint, shown by the canon grain guards.
- [ ] **AC14.** Every piece of content an agent consults rather than performs, on a site the survey approved, lives in a resource, shown by the canon resource guard.

## Non-Goals

- Changing a workflow's behaviour while relocating its operations.
- Hoisting a construct only one workflow uses.
- Changes to GitNexus itself or to its graph schema.
- Any GitHub call made through GraphQL.
- The standing faults in the definitions and concurrent execution.

## References

- **R1.** [Standing Work](https://github.com/m2ux/workflow-server/issues/540) — I01, which owns the standing faults in the definitions and concurrent execution.
- **R2.** [AP-70 capability-group-placement](https://github.com/m2ux/workflow-server/blob/workflows/corpus/canon/resources/anti-patterns.md#ap-70-capability-group-placement) — The canon's rule for where a reusable primitive lives, which the survey's destinations follow.
- **R3.** [Throwaway Write Target](https://github.com/m2ux/workflow-server/issues/924) — The scratch-board issue the GitHub library's writes are confirmed against.
