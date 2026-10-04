## Overview

This work wires the review run and walks it, so a worker records findings on an existing pull request and posts the review.

## Problem

- **A review starts from a pull request that already exists.**
  The run records what it finds and posts the review. It leaves the code as it found it.

## Proposal

- **The id is `review`.**
  Start captures the existing pull request. Submit posts the review. Complete republishes the close-out and skips the ADR.

- **The path omits elicitation and implement.**
  These activities document and do not apply:
  - lean-coding
  - post-impl
  - validate
  - strategic review

- **The workflow declares neither `is_review_mode` nor `stealth_mode`.**
  The README states this mode and names no other mode's activities.

The workflow omits:

- implementation-plan execution names
- public-pull-request lifecycle names it never writes

- **The tests of this wiring accompany it.**
  A sidecar specimen walks review. Any unit or integration test of this wiring is in this work. The claim table names the walk. A mismatch changes the bound routine, technique, or resource, with the tests that cover that change.

The step manifest includes no step that:

- writes implementation files
- creates a public pull request

## Work Breakdown

| Part | Description |
| --- | --- |
| Plan | Lay out capture, document, post, and close-out, and the names the workflow omits |
| Implementation | Wire `workflows/review` |
| Review | Walk the run and read the step manifest |
| Test | The walk, and any unit or integration test of the wiring, stay with this work. A mismatch changes the bound component |

## References

- **R1.** [E06](https://github.com/m2ux/workflow-server/issues/1126) — the epic whose table indexes this work.
- **R2.** [Planning record](README.md) — the record this file belongs to.
