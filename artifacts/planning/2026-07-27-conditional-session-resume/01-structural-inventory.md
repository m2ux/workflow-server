# Structural Inventory — meta

**Workflow:** Meta Workflow
**ID:** `meta`
**Version:** 5.8.0
**Initial activity:** `discover-session`
**Catalog source:** committed workflow tree (`meta` is excluded from `list_workflows`; bootstrap enters it directly)
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 10 |
| Technique leaf files (`.md`, excl. containers/README) | 121 |
| Technique container `TECHNIQUE.md` files | 10 |
| Resource files (excl. README) | 4 |
| Total files under workflow tree | 150 |

Activity YAML splits into 5 lifecycle activities under `activities/` and 5 reusable pattern activities under `activities/patterns/` (a subdirectory outside the lifecycle graph).

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 5 (+5 pattern) |
| Techniques (leaf) | 121 |
| Resources | 4 |
| Checkpoints (incl. nested in loops) | 4 |
| Transitions | 4 |
| Decisions | 0 |
| Workflow variables | 18 |
| Workflow rules (activity partition) | 0 |

`rules.workflow` carries 2 entries; `rules.activity` is unset. `discover-session` carries 1 activity-local rule.

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 16 |
| checkpoint | 4 |
| action | 8 |
| loop | 1 |

## Activities

| # | Activity ID |
|---|-------------|
| 00 | `discover-session` |
| 01 | `initialize-session` |
| 02 | `resolve-target` |
| 03 | `dispatch-client-workflow` |
| 04 | `end-workflow` |

## Update scope

Gate the saved-session resume search in `discover-session` on explicit resume intent in the user's request.

- `activities/00-discover-session.yaml` (v7.2.1) — steps `extract-context`, `scan-planning-folders`, `match-session`, `record-match`, `record-no-match`, checkpoint `resume-session`; activity rule 1 currently mandates matching "even when the user said 'start'" and is in direct conflict with the requested behaviour.
- `workflow.yaml` (v5.8.0) — a resume-intent variable to gate the scan steps on.
- `techniques/workflow-engine/scan-saved-sessions.md` (v1.0.0) — the unbounded walk of every planning folder; its `workflowId` filter is also structurally unable to match post-2026-07-12 folders, which hold only the meta orchestrator's `session.json`.
- `techniques/workflow-engine/extract-identifying-context.md` (v1.0.0) — candidate home for resume-intent detection, or a sibling technique.
