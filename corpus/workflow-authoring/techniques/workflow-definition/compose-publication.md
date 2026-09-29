---
metadata:
  version: 1.1.0
---

## Capability

The publication payload for a definition change — what to stage, the commit message, and the pull-request title and body.

## Inputs

### manifest_entries

The confirmed file manifest for this run — one entry per file to create, modify or remove, each with its path, its action and a one-line statement of the change.

### change_brief

The change brief for this run — purpose and the dimensions the change alters.

## Outputs

### paths

The file paths to stage: every path `{manifest_entries}` names, resolved under the run's edit worktree, with entries the manifest records as removals included so the removal is committed rather than left in the tree.

### commit_message

A Conventional Commits message whose scope names the workflow the change targets and whose subject states the change in one line, taken from the brief's purpose rather than from the file list.

### title

Pull-request title naming the target workflow and whether the change creates or modifies it.

### body

Pull-request body: the change stated in a short paragraph, the manifest's entries as the file breakdown, and a link to the planning folder for the artifacts behind the change.

## Protocol

### 1. Resolve What to Stage

- Take every entry of `{manifest_entries}` and resolve its path under `{target_path}` into `{paths}`, keeping removal entries so the deletion is part of the commit

### 2. Compose the Commit Message

- Compose `{commit_message}` from the purpose in `{change_brief}`: the scope names the target workflow, and the subject states what the change does, not how many files it touched

### 3. Compose the Pull-Request Payload

- Compose `{title}` and `{body}`: the title names the target and the kind of change; the body states the change, breaks it down by the manifest's entries, and links the planning folder rather than restating the artifacts in it

## Rules

### payload-describes-the-change-not-the-diff

Every field here states what the change does and why it exists. No message or body is assembled from the file list.
