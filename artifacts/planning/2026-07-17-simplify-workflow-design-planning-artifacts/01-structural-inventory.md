# Structural Inventory — workflow-design

**Workflow:** Workflow Design Workflow  
**ID:** `workflow-design`  
**Version:** 1.24.1  
**Initial activity:** `intake-and-context`  
**Catalog source:** committed workflow catalog (`list_workflows`)  
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 9 |
| Technique leaf files (`.md`, excl. containers/README) | 36 |
| Technique container `TECHNIQUE.md` files | 1 |
| Resource files (excl. README) | 11 |
| Total files under workflow tree | 62 |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 9 |
| Techniques (leaf) | 36 |
| Resources | 11 |
| Checkpoints (incl. nested in loops) | 25 |
| Transitions | 11 |
| Decisions | 1 |
| Workflow variables | 53 |
| Workflow rules (activity partition) | 2 |

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 60 |
| checkpoint | 25 |
| action | 16 |
| loop | 5 |

## Activities

| # | Activity ID |
|---|-------------|
| 01 | intake-and-context |
| 03 | requirements-refinement |
| 04 | pattern-analysis |
| 05 | impact-analysis |
| 06 | scope-and-draft |
| 08 | quality-review |
| 09 | validate-and-commit |
| 10 | post-update-review |
| 11 | retrospective |

## Update scope

Simplify planning artifacts that checkpoints link for user decisions: cut redundancy, keep only salient decision-facing content, use plain language, and keep tables short. Likely touch points: artifact-writing techniques, related resources/templates, and checkpoint-linked planning outputs (not a create or unrelated-workflow review).
