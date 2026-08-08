---
metadata:
  version: 1.6.0
---

## Capability

Orchestrator-owned Progress **status** writer for selected activity (and optional item) rows in the planning-folder README.

## Inputs

### planning_folder_path

Path to the planning folder whose `README.md` Progress surface is updated.

### target_status

Status value to write — a canonical icon from [Status vocabulary](../../../meta/resources/planning-readme.md#status-vocabulary).

### activity_id

*(optional)* Activity that owns the Progress rows. Used to resolve `{artifact_prefix}` when `{artifact_prefix}` is unbound.

### artifact_prefix

*(optional)* Activity `artifactPrefix` (two-digit identity, e.g. `08`). When unbound, resolve from `{activity_id}` via the activity definition / filename. Required (directly or via `{activity_id}`) unless `{item_match}` alone uniquely identifies rows.

### seed_profile

Resource id of the workflow's readme-seed profile, which carries the [row-ownership map](../../../meta/resources/planning-readme.md#row-ownership-map) selection resolves through.

### item_match

*(optional)* Substring or bare filename matched against the Progress **item** field when only some rows for an activity should change. When unbound, all rows for `{artifact_prefix}` are candidates — selection per [Matching](../../../meta/resources/planning-readme.md#matching).

### delivered_artifact

*(optional)* Bare filename the selected rows' deliverable actually landed in, when it landed somewhere other than the row's seeded target. Unset when the deliverable is at the seeded target or does not exist.

### allow_overwrite_na

*(optional)* When true, permit writing `{target_status}` onto cells that [Status transition policy](../../../meta/resources/planning-readme.md#status-transition-policy) treats as overwrite-N/A eligible. Defaults follow that section.

## Outputs

### rows_updated

Count of Progress status fields changed this apply.

## Protocol

1. Open `{planning_folder_path}/README.md` and locate the Progress surface per [Progress table](../../../meta/resources/planning-readme.md#progress-table).
2. Resolve `{artifact_prefix}`: use the bound value, else derive from `{activity_id}`'s server `artifactPrefix` (activity filename index).
3. Load `{seed_profile}` and read the Item labels `{artifact_prefix}` owns from its [row-ownership map](../../../meta/resources/planning-readme.md#row-ownership-map).
4. Select candidate rows per [Matching](../../../meta/resources/planning-readme.md#matching) using those labels and, when bound, `{item_match}`.
5. For each candidate, set the status field to `{target_status}` per [Status transition policy](../../../meta/resources/planning-readme.md#status-transition-policy) (honour `{allow_overwrite_na}` when bound; otherwise use that section's defaults). Skip candidates the policy forbids.
6. Write status fields as icons from [Status vocabulary](../../../meta/resources/planning-readme.md#status-vocabulary).
7. Bring each written row's item field into line with what its status now asserts, per the same policy section: a cancelled/N/A write strips the item link to plain text; a complete write with `{delivered_artifact}` bound repoints the item link at that artifact. Leave the item label either way.
8. Ensure Progress chrome required by the resource is present per [Icon key](../../../meta/resources/planning-readme.md#icon-key).
9. Do not mutate the README lifecycle Status line — ownership per [Progress table](../../../meta/resources/planning-readme.md#progress-table).
10. Return `{rows_updated}`.

## Rules

### preserve-unrelated-rows

Rows not in the candidate set are untouched per [Status transition policy](../../../meta/resources/planning-readme.md#status-transition-policy).

### orchestrator-owned

Client workflow activities and workers do not Apply this technique as a substitute for the orchestrator hooks listed under [Progress Status call sites](../../../meta/resources/planning-readme.md#progress-status-call-sites). Seed-time mode exclusion remains [create-readme](./create-readme.md) / readme-seed profile duty.
