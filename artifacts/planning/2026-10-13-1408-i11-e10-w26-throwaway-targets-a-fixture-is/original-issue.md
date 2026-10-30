# Original Issue

> [Throwaway Targets: A Fixture Is No Hoist Candidate](https://github.com/m2ux/workflow-server/issues/1408) · opened 2026-10-13 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E10:W26] Throwaway Targets: A Fixture Is No Hoist Candidate` |
| Labels | `tech-debt`, `type:task` |
| Opened | 2026-10-13 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

Hoist mode offers every issue outside the agent-engineering structure as a candidate for placement. One class of issue is outside that structure because it is a test fixture: a target a write check changes so that no issue recording work is changed. It must stay open to be writable, and it belongs in no initiative.

## Problem

- **A fixture is offered as planned work.**
  [#924](https://github.com/m2ux/workflow-server/issues/924) exists so the GitHub library's write check has somewhere to write. List Orphans reports it among the hoist candidates, cited by the initiative whose check uses it.
- **Every placement the mode offers is wrong for it.**
  Keeping it as a task, epic or initiative makes a fixture into work. Subsuming it closes it, and a closed issue cannot be written to, which breaks the check it exists for.
- **Leaving it is the right answer and the mode cannot record that.**
  Leave is for an issue that is not initiative work, and the mode's Left rule then asks that it take a standalone issue's layout. A fixture has nothing to say in those sections, and it returns as a candidate on the next run regardless.
- **The label already states what it is.**
  `throwaway:two` marks the issue as a target rather than a record. Nothing reads it.

## Proposal

- **A labelled throwaway is no hoist candidate.**
  List Orphans reads the label and leaves such an issue out of both candidate groups, so the report offers only issues a placement could serve.
- **The label is what marks it.**
  An issue carrying a `throwaway:*` label is a fixture by declaration, which keeps the test in the data rather than in a list of issue numbers.
- **Hoist mode states the exemption.**
  The mode names the class it does not offer, so a reader meeting such an issue knows why it is absent rather than assuming the report missed it.

## Acceptance Criteria

- [ ] **AC1.** List Orphans leaves an issue carrying a `throwaway:*` label out of the orphans and the cited standalone issues alike, as the script's own test suite shows against one of each.
- [ ] **AC2.** Hoist mode states that a declared throwaway target is not a candidate, as a read of that mode shows.

