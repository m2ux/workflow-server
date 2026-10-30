# Original Issue

> Delivery Reading: The Set a Sync Run Reads During an Initiative · issue #1268 · opened 2026-10-09 · open

The work item issue as it stood when its planning moved into this record. Its title, labels, body and every comment are carried unchanged, so the wording the issue gave each criterion and each piece of evidence is readable beside the work item.

| Field | Value |
| --- | --- |
| Title | `[I11:E09:W06] Delivery Reading: The Set a Sync Run Reads During an Initiative` |
| Labels | `bug`, `type:task` |
| Opened | 2026-10-09 |
| State | open |
| Assignee | m2ux |

## Body

## Overview

Work Planner reads a project's long-lived branches from `config/branches` in the main working tree. A change to that statement reaches the main working tree only when the initiative that made it closes, so for the whole life of that initiative every sync run against the project either reports the set unevaluable or answers with the statement the branch under change replaced. This task gives a run the set the branch under delivery carries, and makes a set it cannot read a reported outcome rather than a silent one.

## Problem

- **The statement lands on a branch nobody reads it from.**
  `config/branches` reaches `i11/e09/workspace` when a task merges, and `workspace` only when the initiative's integration branch merges. `long_lived_names` reads the main working tree, which is checked out on the long-lived branch, so it reads the statement as it stood before the initiative started.
- **Sync drops its reporting rather than its confidence.**
  The epic branch of `sync.py` runs `draft_bases`, `review_references` and `unlinked_reviews` only while `LONG_LIVED` is non-empty. A project whose main working tree states nothing gets no draft line and no reference comparison, and the run reads as clean.
- **A delivering session has to fabricate the set.**
  The session that introduced the statement needed a directory holding nothing but `config/branches` to make Sync Epic report the draft base, because neither the main working tree nor any worktree of it stated the names that work had just added.

## Proposal

- **The reading reaches the branch under delivery.**
  The set a run needs is the one the epic base carries. The reading takes it from the ref the run is working against, falling back to the integration-branch derivation wherever that ref states nothing it can use.
- **An unevaluable set is reported, not skipped.**
  Where the set cannot be read, the epic reporting that depends on it names the checks it did not make, so a run that could not check the draft base and the review references does not read as a run that checked them.

## Acceptance Criteria

- [ ] **AC1.** A sync run against an epic whose base carries a `config/branches` its long-lived branch does not returns that base's branch names, as the skill's fixture suite shows against both refs.
- [ ] **AC2.** A sync run that cannot read the branch set names the epic checks it did not make, as the skill's fixture suite shows against a project stating no branches.

## References

- **R1.** [Work Planner Scripts](https://github.com/m2ux/workflow-server/tree/workspace/skills/work-planner/scripts) — The reading, the epic checks it gates, and the fixture suite that keeps them.

---
*AI assistance: this issue was substantively produced with AI tooling.*


## Comment 1

> m2ux · 2026-10-09

The body before this issue took the [I11:E09:W06] layout:

## Overview

Work Planner reads a project's long-lived branches from `config/branches` in the main working tree. A change to that statement reaches the main working tree only when the initiative that made it closes, so for the whole life of that initiative every sync run against the project either reports the set unevaluable or answers with the statement the branch under change replaced. Sync skips the draft, references and uncited reporting it gates on that set, and the gap is widest for the initiative that introduced the statement in the first place.

## Problem

- **The statement lands on a branch nobody reads it from.**
  `config/branches` reaches `i11/e09/workspace` when a task merges, and `workspace` only when the initiative's integration branch merges. `long_lived_names` reads the main working tree, which is checked out on the long-lived branch, so it reads the statement as it was before the initiative started.
- **Sync drops its reporting rather than its confidence.**
  The epic branch of `sync.py` runs `draft_bases`, `review_references` and `unlinked_reviews` only while `LONG_LIVED` is non-empty. A project whose main working tree states nothing gets no draft line and no reference comparison, and the run reads as clean.
- **The delivering session has to fabricate the set.**
  Delivering I11:E09:W05 needed a directory holding nothing but `config/branches` to make Sync Epic report the draft base, because neither the main working tree nor any worktree of it stated the names the work had just introduced.

## Proposal

- **A reading that reaches the branch under delivery.**
  The set a run needs is the one the epic base carries, not the one the long-lived branch carries. The options are a reading taken from a named ref, a reading taken from the checkout the run is invoked in rather than its main working tree, and the integration-branch derivation being consulted whenever the statement names nothing the run can use.
- **An unevaluable set is reported, not skipped.**
  Where the set cannot be read, the epic reporting that depends on it says so, so a run that cannot check the draft base and the review references does not read as a run that checked them.

## Acceptance Criteria

- [ ] **AC1.** A sync run against an epic whose base carries a `config/branches` the long-lived branch does not returns that base's branch names.
- [ ] **AC2.** A sync run that cannot read the branch set reports the epic checks it did not make, naming the set as unevaluable.

## References

- **R1.** [#1265](https://github.com/m2ux/workflow-server/pull/1265) — the pull request that introduced `config/branches` and the reading of it.


