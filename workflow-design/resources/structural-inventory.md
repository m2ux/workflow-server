---
name: structural-inventory
description: Guidelines for creating the structural-inventory planning artifact (update/review baseline).
metadata:
  order: 11
---

# Structural Inventory Guide

Baseline snapshot of an existing workflow for update or review. Answers: what is here, and what change is in scope? Human gate surface at change-request confirmation.

## Template

```markdown
# Structural Inventory — {workflow-id}

**Workflow:** {title}
**ID:** `{workflow-id}`
**Version:** {version}
**Initial activity:** `{initialActivity}`
**Catalog source:** committed workflow catalog (`list_workflows`)
**Mode:** update | review

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | N |
| Activity YAML files | N |
| Technique leaf files (`.md`, excl. containers/README) | N |
| Technique container `TECHNIQUE.md` files | N |
| Resource files (excl. README) | N |
| Total files under workflow tree | N |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | N |
| Techniques (leaf) | N |
| Resources | N |
| Checkpoints (incl. nested in loops) | N |
| Transitions | N |
| Decisions | N |
| Workflow variables | N |
| Workflow rules (activity partition) | N |

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | N |
| checkpoint | N |
| action | N |
| loop | N |

## Activities

| # | Activity ID |
|---|-------------|
| NN | `{activity-id}` |

## Update scope

[One short paragraph or bullet list: what this session intends to change. Omit in pure review when no change request.]
```

## Rules

- **Counts only, then scope.** No per-file essays; the activity id table is the structural list.
- **One-line update scope** when mode is update — enough for the change-request gate.
- **Line budget:** ~60 lines. Longer means dumping catalog detail the gate does not need.
- Multi-target review: one inventory artifact per target (or clearly sectioned by workflow id).
