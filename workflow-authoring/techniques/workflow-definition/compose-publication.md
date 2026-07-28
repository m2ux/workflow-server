---
metadata:
  version: 1.0.0
---

## Capability

The publication payload for a definition change — what to stage, the commit message, and the pull-request title and body.

## Inputs

### scope_manifest

The confirmed file manifest for this run, whose entries name every file the change touches.

### change_brief

The change brief for this run — purpose and the dimensions the change alters.

## Outputs

### paths

The file paths to stage: every path `{scope_manifest}` names, resolved under the run's edit worktree, with entries the manifest records as removals included so the removal is committed rather than left in the tree.

### commit_message

A Conventional Commits message whose scope names the workflow the change targets and whose subject states the change in one line, taken from the brief's purpose rather than from the file list.

### title

Pull-request title naming the target workflow and whether the change creates or modifies it.

### body

Pull-request body: the change stated in a short paragraph, the manifest's entries as the file breakdown, and a link to the planning folder for the artifacts behind the change.

## Protocol

### 1. Resolve What to Stage

- Take every entry of `{scope_manifest}` and resolve its path under the run's edit worktree into `{paths}`, keeping removal entries so the deletion is part of the commit

### 2. Compose the Commit Message

- Compose `{commit_message}` from the purpose in `{change_brief}`: the scope names the target workflow, and the subject states what the change does, not how many files it touched

### 3. Compose the Pull-Request Payload

- Compose `{title}` and `{body}`: the title names the target and the kind of change; the body states the change, breaks it down by the manifest's entries, and links the planning folder rather than restating the artifacts in it

## Rules

### payload-describes-the-change-not-the-diff

Every field here states what the change does. A message or body assembled from the file list describes the diff a reader can already see, and says nothing about why the change exists.
