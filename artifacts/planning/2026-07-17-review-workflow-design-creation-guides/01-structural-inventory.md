# Structural Inventory — workflow-design

**Workflow:** Workflow Design Workflow  
**ID:** `workflow-design`  
**Version:** 1.24.3  
**Initial activity:** `intake-and-context`  
**Catalog source:** PR worktree `2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` (branch `workflow/workflow-design-slim-planning-artifacts`, PR #254); committed `list_workflows` pin is 1.24.1 (stale)  
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 9 |
| Technique leaf files (`.md`, excl. containers/README) | 36 |
| Technique container `TECHNIQUE.md` files | 1 |
| Resource files (excl. README) | 22 |
| Total files under workflow tree | 73 |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 9 |
| Techniques (leaf) | 36 |
| Resources | 22 |
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

Fix compliance findings from the prior review: (1) High — declare `### pattern_analysis` Output on `techniques/pattern-analysis.md`; (2) Low — normalize persist technique cites to `#template` on the listed techniques.
