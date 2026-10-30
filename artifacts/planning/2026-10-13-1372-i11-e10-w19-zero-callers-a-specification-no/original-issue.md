# Original Issue

> [Zero Callers: A Specification No Procedure Runs Placed by a Stated Test](https://github.com/m2ux/workflow-server/issues/1372) · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W19] Zero Callers: A Specification No Procedure Runs Placed by a Stated Test` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

The shared skill-file check reads every `###` under a catalog's listing, or under a file's Commands section, as a command specification, and places it by how many procedures run it. Six of Work Planner's sections pass that test while running no command at all: no procedure cites them, and several carry no invocation to run. The localisation rule has nothing to say about them, so they sit in the catalog by default rather than by a stated reason.

## Problem

- **Six specifications have no procedure-caller.**
  Measured with `skills/scripts/check_skill_files.py` over `skills/work-planner` at `5fd293b0`, printing each specification's caller set: `Delivery State`, `Development Access`, `Graph Conventions` and `List Initiative Titles` in `references/commands.md`, `Fetch All Initiative Pull Requests` in `references/board.md`, and `Open Task Pull Request` in `references/deliver-mode.md`.
- **Three of them specify no command.**
  `Delivery State` states what a report's lines mean and which inputs the commands that produce them take. `Graph Conventions` states how graph queries are written. `Development Access` states how the Development field is read and edited through whatever tool is available. None carries an invocation, so there is no command for a procedure to run.
- **The rule reads a count it cannot interpret here.**
  A specification moves to its caller where exactly one procedure runs it. Zero is neither one nor several, so the rule passes over all six silently and the check reports nothing. A reader cannot tell a section deliberately shared from a section nothing reaches.
- **One of them is cited as a prerequisite by four modes.**
  Align, Deliver, Plan and Sync each open `references/commands.md` and read `Delivery State` before their procedures start. That is a real retrieval cost, charged by a section that is a definition rather than an operation.

## Proposal

- **Name the class the check and the guidelines currently skip.**
  A `###` under a Commands listing that carries no invocation is a shared definition, not a command specification. Deciding what it is called settles whether the placement rule applies to it, and whether the check should report one that no procedure reaches.
- **Weigh three placements for the definitions.**
  They stay where they are and the guidelines say why; they move to the guide whose readers already hold them, which for `Delivery State` is the Work Breakdown Guide's Delivery section; or the catalog gains a stated section for shared definitions, separate from its listing of operations.
- **Decide the zero-caller operations separately.**
  `Fetch All Initiative Pull Requests`, `List Initiative Titles` and `Open Task Pull Request` do carry invocations. Each is reached from prose or an entry-point list rather than from a numbered step, which is the masked-caller pattern this epic already found ten times, so each needs reading against its citing prose before it is placed.

## Acceptance Criteria

- [ ] **AC1.** A command specification no procedure runs is either reported by the shared skill-file check or excluded from the placement rule by a test the shared guidelines state, as the check's own test suite shows against a specimen carrying one.
- [ ] **AC2.** Each of the six sections no procedure runs stands where the guidelines place it, with its class and its placement named, as the check reports no finding over the two skills.

## References

- **R1.** [Caller sets of the eight](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-13-1319-i11-e12-w15-plan-mode-s-operations) — the caller sets that measured `Delivery State` at zero procedure-callers.


