## Overview

This work wires the implement run and walks it, so a worker authors a change through to a pull request.

## Problem

- **An implement run has one job.**
  It authors a change through to a pull request. It has no occasion to post a review of someone else's pull request, or to push to a private security remote.

## Proposal

- **The folder is the implement workflow.**
  `workflows/implement/` holds `workflow.yaml`, `activities/`, and a README. The id is `implement`.

The graph is the authoring path:

- start
- design
- comprehension
- optional elicitation and research
- analysis
- plan
- assumptions
- implement
- lean-coding audit that applies
- post-impl review that fixes
- validate that fixes
- strategic review that applies
- submit that pushes and marks ready
- complete that writes an ADR when complexity requires it

- **Activities bind only what this graph runs.**
  They bind `work-package::` routines and techniques. The workflow declares neither `is_review_mode` nor `stealth_mode`. The README states this mode and names no other mode's activities.

The workflow omits:

- review-delivery names
- security-remote names

- **The tests of this wiring accompany it.**
  A sidecar specimen walks implement. Any unit or integration test of this wiring is in this work. The claim table names the walk. A mismatch changes the bound routine, technique, or resource, with the tests that cover that change.

The step manifest includes no step that:

- posts a pull-request review
- pushes to a private remote

`execute-package` names `legacy`.

## Work Breakdown

| Part | Description |
| --- | --- |
| Plan | Lay out the authoring path and the names the workflow omits |
| Implementation | Wire `workflows/implement` to the library routines and techniques |
| Review | Walk the run and read the step manifest |
| Test | The walk, and any unit or integration test of the wiring, stay with this work. A mismatch changes the bound component |

## References

- **R1.** [E06](https://github.com/m2ux/workflow-server/issues/1126) — the epic whose table indexes this work.
- **R2.** [Planning record](README.md) — the record this file belongs to.
