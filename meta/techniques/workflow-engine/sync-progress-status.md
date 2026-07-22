---
metadata:
  version: 1.4.0
---

## Capability

Orchestrator-owned Progress **status** writer for selected activity (and optional item) rows in the planning-folder README.

## Inputs

### planning_folder_path

Path to the planning folder whose `README.md` Progress surface is updated.

### target_status

Status value to write — a canonical icon from [Status vocabulary](../../resources/planning-readme.md#status-vocabulary).

### activity_id

*(optional)* Activity that owns the Progress rows. Used to resolve `{artifact_prefix}` when `{artifact_prefix}` is unbound.

### artifact_prefix

*(optional)* Activity `artifactPrefix` (two-digit identity, e.g. `08`). When unbound, resolve from `{activity_id}` via the activity definition / filename. Required (directly or via `{activity_id}`) unless `{item_match}` alone uniquely identifies rows.

### item_match

*(optional)* Substring or bare filename matched against the Progress **item** field when only some rows for an activity should change. When unbound, all rows for `{artifact_prefix}` are candidates — selection per [Matching](../../resources/planning-readme.md#matching).

### allow_overwrite_na

*(optional)* When true, permit writing `{target_status}` onto cells that [Status transition policy](../../resources/planning-readme.md#status-transition-policy) treats as overwrite-N/A eligible. Defaults follow that section.

## Outputs

### rows_updated

Count of Progress status fields changed this apply.

## Protocol

1. Open `{planning_folder_path}/README.md` and locate the Progress surface per [Progress table](../../resources/planning-readme.md#progress-table).
2. Resolve `{artifact_prefix}`: use the bound value, else derive from `{activity_id}`'s server `artifactPrefix` (activity filename index).
3. Select candidate rows per [Matching](../../resources/planning-readme.md#matching) using `{artifact_prefix}` and, when bound, `{item_match}`.
4. For each candidate, set the status field to `{target_status}` per [Status transition policy](../../resources/planning-readme.md#status-transition-policy) (honour `{allow_overwrite_na}` when bound; otherwise use that section's defaults). Skip candidates the policy forbids.
5. Write status fields per [Status column](../../resources/planning-readme.md#status-column).
6. Ensure Progress chrome required by the resource is present per [Icon key](../../resources/planning-readme.md#icon-key).
7. Do not mutate the README lifecycle Status line — ownership per [Progress table](../../resources/planning-readme.md#progress-table).
8. Return `{rows_updated}`.

## Rules

### preserve-unrelated-rows

Rows not in the candidate set are untouched per [Status transition policy](../../resources/planning-readme.md#status-transition-policy).

### orchestrator-owned

Client workflow activities and workers do not Apply this technique as a substitute for the orchestrator hooks listed under [Progress Status call sites](../../resources/planning-readme.md#progress-status-call-sites). Seed-time mode exclusion remains [create-readme](./create-readme.md) / readme-seed profile duty.
