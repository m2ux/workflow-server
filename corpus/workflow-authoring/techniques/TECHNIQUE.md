---
metadata:
  version: 1.2.0
---

## Capability

Shared inputs and authoring invariants for the techniques that classify, author and audit workflow definition files.

## Inputs

### user_description

Free-form statement of the workflow the user wants created, changed or audited.

### planning_folder_path

Absolute path to this run's planning folder — the write location for every planning artifact.

### target_path

Absolute path of the run's edit worktree, where definition files are read and create and update edits land.

### operation_type

*(optional)* The classified operation — `create`, `update` or `review`. Absent until the request is classified.

### target_workflow_id

*(optional)* Id of the workflow this run is authoring, changing or auditing.

### target_workflow_ids

*(optional)* Ordered list of workflow ids in scope for this run; a single-target run carries a one-element list.

## Rules

### edit-surface-is-the-evidence

Definition files are read and written under `{target_path}`. The served catalog answers from the library checkout, which can lag the branch under change, so a claim taken from it is not evidence about the files this run edits.

### single-source-and-link

Every planning fact has exactly one canonical artifact. Where a second artifact needs that fact, it carries a link to the canonical home and at most a one-line pointer, never a copy of the body.

### canonical-home-map

No fact category below has a second canonical home. [verify-artifact-conforms](/meta/techniques/verify-artifact-conforms.md) enforces the map.

| Fact category | Canonical home |
|---|---|
| Purpose, change goals, open design judgements | `change-brief.md` |
| Impact classification, integrity verdicts, removals inventory | `impact-analysis.md` |
| File manifest, structural design, drafting order | `scope-manifest.md` |
| Audit findings, coverage divergences, accepted exclusions | `findings-register.md` |
| Delivery, limitations, deferrals, the run's own retrospective | `COMPLETE.md` |
| Session index — progress, links, artifact pointers | `README.md` |

### apply-canon-when-authoring

Author definition content against [Schema Expressiveness](/canon/resources/anti-patterns.md#schema-expressiveness) and [Description Hygiene](/canon/resources/anti-patterns.md#description-hygiene) as write-time constraints rather than as findings a later audit recovers. Follow each entry as written; do not restate its criteria here.
