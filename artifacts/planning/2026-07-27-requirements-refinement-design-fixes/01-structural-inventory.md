# Structural Inventory — requirements-refinement

**Workflow:** Requirements Refinement Workflow
**ID:** `requirements-refinement`
**Version:** 1.1.0
**Initial activity:** `intake-and-analyze`
**Catalog source:** committed workflow catalog (`list_workflows`)
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 5 |
| Technique leaf files (`.md`, excl. containers/README) | 6 |
| Technique container `TECHNIQUE.md` files | 1 |
| Resource files (excl. README) | 4 |
| Total files under workflow tree | 21 |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 5 |
| Techniques (leaf) | 6 |
| Resources | 4 |
| Checkpoints (incl. nested in loops) | 4 |
| Transitions | 5 |
| Decisions | 0 |
| Workflow variables | 14 |
| Workflow rules (activity partition) | 5 |

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 6 |
| checkpoint | 4 |
| action | 0 |
| loop | 0 |

## Activities

| # | Activity ID |
|---|-------------|
| 01 | `intake-and-analyze` |
| 03 | `update-specification` |
| 04 | `validate-specification` |
| 05 | `finalize-specification` |
| 06 | `report-failure` |

## Update scope

Audit `requirements-refinement` against the workflow-design canon (design principles + anti-patterns) and fix every violation in place. Change categories expected to be touched: **Activity** (checkpoint message/option shapes, action messages, step composition), **Technique** (protocol/signature hygiene in the six leaf techniques and the container), **Structural refactor** (the correction cycle, variable wiring, activity-file numbering), with **Resource** and **Metadata** (version bump) as follow-on. No behavioural redesign is requested — the target's purpose and lifecycle stay as they are.
