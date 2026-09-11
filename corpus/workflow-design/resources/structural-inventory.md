---
name: structural-inventory
description: Creation guide for bare filename `structural-inventory.json` — per-target baseline counts of an existing workflow, its activity ids, and the scope of the change under way.
metadata:
  order: 11
---

# Structural Inventory Guide

Creation guide for bare filename `structural-inventory.json`. The before-picture of a workflow that already exists: how much of each thing is there, and what this session intends to change. Later passes measure against it to tell an intentional removal from an accidental one.

## Template

One object per target, carrying the three count groups, the activity ids in order, and the change scope.

```json
{
  "mode": "update",
  "catalog_source": "committed workflow catalog (list_workflows)",
  "targets": [
    {
      "workflow_id": "midnight-system-review",
      "title": "Midnight System Review",
      "version": "2.4.0",
      "initial_activity": "01-intake-and-scope",
      "file_counts": {
        "workflow_yaml": 1,
        "activity_yaml": 9,
        "technique_leaf": 34,
        "technique_container": 6,
        "resources": 21,
        "total": 71
      },
      "entity_counts": {
        "activities": 9,
        "techniques": 34,
        "resources": 21,
        "checkpoints": 12,
        "transitions": 14,
        "decisions": 3,
        "variables": 27,
        "rules": 9
      },
      "step_kinds": {
        "technique": 61,
        "checkpoint": 12,
        "action": 18,
        "loop": 4
      },
      "activities": [
        { "ordinal": "01", "id": "intake-and-scope" },
        { "ordinal": "02", "id": "evidence-probes" }
      ],
      "update_scope": "Add a verdict-rubric resource and bind it from the adjudication pass."
    }
  ]
}
```

| Field | Type | Meaning |
|-------|------|---------|
| `mode` | string | `update` or `review` |
| `catalog_source` | string | Where the counts were read from |
| `targets` | object[] | One entry per workflow under review, in the order they were named |
| `targets[].workflow_id` | string | Id of the workflow this entry inventories |
| `targets[].title` | string | Its declared title |
| `targets[].version` | string | Its declared version at the time of the snapshot |
| `targets[].initial_activity` | string | The activity the workflow starts at |
| `targets[].file_counts` | object | Files by kind — `workflow_yaml`, `activity_yaml`, `technique_leaf`, `technique_container`, `resources`, `total`. Leaf counts exclude containers and READMEs; `resources` excludes README |
| `targets[].entity_counts` | object | Definitions by kind — `activities`, `techniques` (leaf), `resources`, `checkpoints` (including those nested in loops), `transitions`, `decisions`, `variables`, `rules` (the activity partition) |
| `targets[].step_kinds` | object | Steps across all activities by kind — `technique`, `checkpoint`, `action`, `loop` |
| `targets[].activities` | object[] | The activity ids in workflow order, each with its `ordinal` |
| `targets[].update_scope` | string \| null | What this session intends to change; null in a pure review with no change request |

## Rules

- **Counts, then scope.** The numbers and the activity id list are the inventory; per-file description belongs to the passes that read it.
- **One entry per target.** A multi-target review appends entries rather than writing a second artifact.
- **`update_scope` is set whenever mode is `update`.** It is what the change-request decision resolves against.
- **Every count group is complete.** A partial group cannot be compared against a later one, so an absent count is recorded as `0`, never omitted.
