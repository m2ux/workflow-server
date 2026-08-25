---
metadata:
  version: 1.0.0
---

## Capability

Deferred-items register rows carried into the issue tracker — the open rows found, and an issue raised and linked for each row the run approves.

## Inputs

### planning_folder_path

The work package's planning folder, which holds the deferred-items register when the run deferred anything.

## Rules

### register-takes-no-prefix

The register is written in place and never declared as an artifact of the activity raising from it. Any activity may be the one that defers first, so the register has no owning activity and takes no `artifactPrefix` — an operation here that declared it would make `complete` its owner and publish a prefixed second copy alongside it.


### register-is-the-source

An issue is raised from a register row and carries that row's ID, so the issue and the row each name the other. A deferral that reaches the tracker without a row has no record of why it was out of scope.

### one-issue-per-row

A row acquires at most one issue. A row whose Follow-up cell already holds a link is raised already, and a second issue for it would split the item's history across two tickets.

### row-survives-the-raise

Raising rewrites the Follow-up cell and nothing else. The item, its rationale and its ID stay as the deferring activity wrote them, so the register still says why the item was set aside rather than only where it went.

### approval-precedes-creation

An issue appears in a tracker other people read, so each row is raised only where the run approved that row. A row the run skipped keeps its dash and stays open for a later package to raise.
