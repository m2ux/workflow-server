## Overview

This work makes one write technique whose parameter names the section of a guide to fill.

## Problem

- **Several documents are written the same way.**
  A plan, a findings list, a close-out, an ADR, and an elicitation record each fill one section of a guide.
- **A write technique per document would repeat that method.**

## Proposal

- **The technique cites a section of a refactored resource.**
  The parameter names the section. A composition, such as the review summary, is not this technique.

The sections are:

- plan
- findings
- close-out
- ADR
- elicitation

- **The tests accompany the technique.**
  A unit test fails when the technique cites a section the resource does not contain. An integration test loads the technique against a fixture resource and fails when the cited section is not the one the parameter selected.

## Work Breakdown

| Part | Description |
| --- | --- |
| Analysis | Name the documents that fill one section of a guide |
| Implementation | Write the one technique and the section parameter |
| Test | A missing section fails, and the cited section is the one the parameter selected |

## References

- **R1.** [E06](https://github.com/m2ux/workflow-server/issues/1126) — the epic whose table indexes this work.
- **R2.** [Planning record](README.md) — the record this file belongs to.
