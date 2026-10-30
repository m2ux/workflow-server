# Original Issue

> Draft Report: A Base Named Only Where It Leads Its Branch · issue #1407 · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W25] Draft Report: A Base Named Only Where It Leads Its Branch` |
| Labels | `bug`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

Sync Epic reports an epic base as draft when a merged task targets it and no open pull request merges it. Where an epic's review pull request has already merged mid-delivery, the base is level with its long-lived branch and no pull request can be opened on it, so the report names an action the reader cannot take.

## Problem

- **The condition reads the pull request, not the branch.**
  A merged task targeting the base and no open pull request merging it is enough to report a draft. Whether the base carries anything the long-lived branch lacks is never asked.
- **A mid-delivery merge makes the report permanent.**
  `i11/e09/workspace` is 0 commits ahead of `workspace` and 130 behind, its content having landed through its first review pull request. Every sync of that epic reports a draft, and will until another task merges into the base.
- **The action it names cannot be taken.**
  Opening a pull request with no commits between head and base is refused. A reader following the report learns that only by trying it.
- **A report nobody can act on trains the reader past it.**
  The draft line sits among lines that do require action, and an epic that merges mid-delivery is the ordinary case for a long epic.

## Proposal

- **The draft line asks what the base carries.**
  An epic base is reported as draft only where it holds a commit its long-lived branch does not. A base level with or behind its branch has nothing to review and draws no line.
- **The merged review pull request is not what the report turns on.**
  Whether a previous review pull request merged says nothing about what the base now carries; the comparison between the two branches says it directly.

## Acceptance Criteria

- [ ] **AC1.** Sync Epic reports an epic base as draft only where that base carries a commit its long-lived branch lacks, as the script's own test suite shows against a base level with its branch and one ahead of it.

