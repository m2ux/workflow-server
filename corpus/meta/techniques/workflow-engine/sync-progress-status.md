---
metadata:
  version: 1.10.0
---

## Capability

Progress **status** writer for selected activity (and optional item) rows in the planning-folder README.

## Inputs

### target_status

*(optional)* Status value to write — a canonical icon from [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary). When unset, the completion row of [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites) supplies it.

### mark_progress_na

*(optional)* True when an unset `{target_status}` is the cancelled / N/A row. Unset, that row is `activity_complete`.

### artifact_prefix

*(optional)* Activity `artifactPrefix` (two-digit identity, e.g. `08`). When unbound, resolve from `{activity_id}` via the activity definition / filename. Required (directly or via `{activity_id}`) unless `{item_match}` alone uniquely identifies rows.

### seed_profile

Resource id of the workflow's readme-seed profile, which carries the [row-ownership map](/meta/resources/planning-readme.md#row-ownership-map) selection resolves through.

### item_match

*(optional)* Substring or bare filename matched against the Progress **item** field when only some rows for an activity should change. When unbound, all rows for `{artifact_prefix}` are candidates — selection per [Matching](/meta/resources/planning-readme.md#matching).

### delivered_artifact

*(optional)* Bare filename the selected rows' deliverable actually landed in, when it landed somewhere other than the row's seeded target. Unset when the deliverable is at the seeded target or does not exist.

### allow_overwrite_na

*(optional)* When true, permit writing `{target_status}` onto cells that [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy) treats as overwrite-N/A eligible. Defaults follow that section.

## Protocol

### 1. Resolve the Moment

- When `{target_status}` is unset, take the moment from [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites): the cancelled / N/A row when `{mark_progress_na}` is true, otherwise `activity_complete`. Record that row's status as `{target_status}`.
  > - When `{mark_progress_na}` was true, set it false after the row is read.
  > - Where `{activity_id}` holds the branches a fan retired, one resolution covers all of them per `fan.persist-the-fan-at-convergence`.
  > - Apply `dispatch-activity.distrust-then-reconcile` when `inspect_session` path/state for `{planning_folder_path}` or related critical variables disagrees with the just-completed worker's `activity_complete` envelope.

### 2. Open README

- Open `{planning_folder_path}/README.md` and locate the Progress surface per [Progress table](/meta/resources/planning-readme.md#progress-table).

### 3. Resolve Artifact Prefix

- Resolve `{artifact_prefix}`: use the bound value, else derive from `{activity_id}`'s server `artifactPrefix` (activity filename index).

### 4. Read Owned Rows

- Load `{seed_profile}` and read the Item labels `{artifact_prefix}` owns from its [row-ownership map](/meta/resources/planning-readme.md#row-ownership-map).

### 5. Narrow To Scope

- Select candidate rows per [Matching](/meta/resources/planning-readme.md#matching) using those labels and, when bound, `{item_match}`.

### 6. Write Selected Cells

- For each candidate, set the status field to `{target_status}` per [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy) (honour `{allow_overwrite_na}` when bound; otherwise use that section's defaults). Skip candidates the policy forbids.
  > A status field carries an icon from [Status vocabulary](/meta/resources/planning-readme.md#status-vocabulary) and nothing else.

### 7. Repoint Item Links

- Bring each written row's item field into line with what its status now asserts, per the same policy section: a cancelled/N/A write strips the item link to plain text; a complete write with `{delivered_artifact}` bound repoints the item link at that artifact. Leave the item label either way.

### 8. Restore Icon Key

- Ensure Progress chrome required by the resource is present per [Icon key](/meta/resources/planning-readme.md#icon-key).

## Rules

### progress-rows-only

This technique writes Progress row fields and nothing else in the README. The header's lifecycle `**Status:**` line has an owner of its own, per [Progress table](/meta/resources/planning-readme.md#progress-table).

### preserve-unrelated-rows

Rows not in the candidate set are untouched per [Status transition policy](/meta/resources/planning-readme.md#status-transition-policy).
