## Overview

This work gives each review reading its own technique.

## Problem

- **Review readings are a person's judgment.**
  Deciding what a diff shows, what the code does, what the tests cover, and how a finding is settled are readings.
- **Filling a document is a different job.**
  Those readings are not the write that fills a guide section.

## Proposal

- **The techniques cite the refactored resource sections.**
  - the diff review
  - the code review
  - the test-suite review
  - settling findings

- **The diff review runs once.**
  A fill applies a person's reply. The per-block interview stays a checkpoint. After a fix, only the lens that raised the finding runs again.

- **The tests accompany the techniques.**
  A unit test fails when a second lens is selected for a finding the first lens raised. An integration test loads the diff technique and the fill and fails when the reply is applied by fetching the whole review again.

## Work Breakdown

| Part | Description |
| --- | --- |
| Analysis | Separate the review readings from the document fill |
| Implementation | Write the diff, code, test-suite, and settle-findings techniques |
| Review | The diff runs once, a fill applies the reply, and the raising lens rechecks |
| Test | A second lens fails, and applying the reply does not fetch the whole review |

## References

- **R1.** [E06](https://github.com/m2ux/workflow-server/issues/1126) — the epic whose table indexes this work.
- **R2.** [Planning record](README.md) — the record this file belongs to.
