---
metadata:
  version: 1.0.0
---

## Capability

An issue raised in the tracker for one approved deferred-item row, and the row updated to name it.

## Inputs

### current_deferred_item

The register row the raise gate approved, carrying its ID, its item text and the rationale the deferring activity recorded.

### issue_platform

The tracker the work package's own issue lives in — github or jira — so a deferred item is raised where its package is tracked.

### component_name

Basename of the component the work package targets, which scopes the issue the same way the package's own issue is scoped.

## Outputs

### deferred_items

The [register](../../resources/deferred-items.md#template) with this row's Follow-up cell carrying the issue it was raised as.

#### artifact

`deferred-items.md`

#### audience

`human`

## Protocol

### 1. Draft the Issue

- Draft a title from `{current_deferred_item}`'s item text, and a body carrying the item, the rationale the register gives for it being out of scope, and the row's ID.
- Scope the issue to `{component_name}`, and state the problem the deferral leaves open rather than a solution for it, per the issue-writing rules in [create-issue](../create-issue.md#rules).

### 2. Raise It Against the Tracker

- Create the issue on `{issue_platform}`, capturing its key and URL.
  > - For GitHub, follow the [issue template](../../resources/github-issue-creation.md#issue-template) and [section rules](../../resources/github-issue-creation.md#section-rules), labelling the issue `chore`.
  > - For Jira, obtain the Atlassian cloud ID via `getAccessibleAtlassianResources` before any other Jira call, and create the issue as a Task in the project the package's own issue lives in.
  > - Where creation fails, leave the row's dash intact and report the failure with the row ID. A row is raised or it is not; a half-raised row would claim an issue that does not exist.

### 3. Link the Row to Its Issue

- Write the new issue's link into this row's Follow-up cell in place, leaving the ID, item and rationale columns as the deferring activity wrote them. The register is where a raised row is counted from, so the link in the cell is the whole record of the raise.
