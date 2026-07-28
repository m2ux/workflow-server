---
metadata:
  version: 1.0.0
---

## Capability

Shared inputs and authoring invariants for every operation in this workflow.

## Inputs

### user_description

Free-form statement of the workflow the user wants created, changed or audited.

### planning_folder_path

Absolute path to this run's planning folder — the write location for every planning artifact.

### target_workflow_id

*(optional)* Id of the workflow this run is authoring, changing or auditing.

### target_workflow_ids

*(optional)* Ordered list of workflow ids in scope for this run; a single-target run carries a one-element list.

## Rules

### single-source-and-link

Every planning fact has exactly one canonical artifact. Where a second artifact needs that fact, it carries a link to the canonical home and at most a one-line pointer, never a copy of the body.

### canonical-home-map

No fact category below has a second canonical home.

| Fact category | Canonical home |
|---|---|
| Purpose, change goals, open design judgements | `change-brief.md` |
| Impact classification, integrity verdicts, removals inventory | `impact-analysis.md` |
| Session index — progress, links, artifact pointers | `README.md` |

### apply-canon-when-authoring

Author definition content against [Schema Expressiveness Anti-Patterns](../../workflow-design/resources/anti-patterns.md#schema-expressiveness-anti-patterns) and [Description Hygiene Anti-Patterns](../../workflow-design/resources/anti-patterns.md#description-hygiene-anti-patterns) as write-time constraints rather than as findings a later audit recovers. Follow each entry as written; do not restate its criteria here.
