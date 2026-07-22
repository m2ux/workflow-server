# Structural Inventory — work-package

**Workflow:** Work Package Implementation Workflow
**ID:** `work-package`
**Version:** 3.34.0
**Initial activity:** `start-work-package`
**Catalog source:** committed workflow catalog (`list_workflows`)
**Mode:** update

## File counts

| Kind | Count |
|------|------:|
| Root `workflow.yaml` | 1 |
| Activity YAML files | 15 |
| Technique leaf files (`.md`, excl. containers/README) | 91 |
| Technique container `TECHNIQUE.md` files | 17 |
| Resource files (excl. README) | 30 |
| Total files under workflow tree | 159 |

## Entity counts

| Entity | Count |
|--------|------:|
| Activities | 15 |
| Techniques (leaf) | 91 |
| Resources | 30 |
| Checkpoints (incl. nested in loops) | 41 |
| Transitions | 27 |
| Decisions | 2 |
| Workflow variables | 113 |
| Workflow rules (activity partition) | 1 |

## Step kinds (across activities)

| Kind | Count |
|------|------:|
| technique | 162 |
| checkpoint | 41 |
| action | 27 |
| loop | 15 |

## Activities

| # | Activity ID |
|---|-------------|
| 01 | `start-work-package` |
| 02 | `design-philosophy` |
| 03 | `requirements-elicitation` |
| 04 | `research` |
| 05 | `implementation-analysis` |
| 06 | `plan-prepare` |
| 07 | `assumptions-review` |
| 08 | `implement` |
| 09 | `lean-coding-audit` |
| 10 | `post-impl-review` |
| 11 | `validate` |
| 12 | `strategic-review` |
| 13 | `submit-for-review` |
| 14 | `complete` |
| 15 | `codebase-comprehension` |

## Update scope

Address the nine workflow-server-owned friction points from [issue #272](https://github.com/m2ux/workflow-server/issues/272) (environment/harness context is out of scope except where it informs design):

1. **meta `discover-session` vs worker `list_workflows` ban** — reconcile `list-available-workflows` step binding with activity-worker rules.
2. **Orchestrator next-activity without transition table** — return resolved next-activity / evaluated condition in `activity_complete`, or expose transition table to orchestrator (`no-get-activity-from-orchestrator`).
3. **`validate` externalized path** — first-class user-run / `validation_skipped_by_user` when the agent cannot compile.
4. **Build-dependent artifacts** — flag and route to user from `validate` / `submit-for-review` (e.g. `.scale` metadata regen).
5. **Single-option checkpoints** — guarantee ≥2 options or handle single-option presentation (`submodule-selection` / AskQuestion).
6. **`foreground-always` vs async dispatch** — harness-compat acknowledges async dispatch + notification as blocking-equivalent.
7. **`lean-coding-audit` comment over-verbosity** — proportionality to surrounding code as a hard trim bar.
8. **Single-logical-artifact at write time** — enforce in `manage-artifacts::write-artifact` (no minted duplicates).
9. **PR template tense** — refresh future-tense placeholders / checklist when implementation lands.

**Primary target:** `work-package` (items 3, 4, 7, 8, 9 and related activities/techniques).

**Coupled targets (same change request):**

- `meta` — discover-session / list_workflows reconciliation; orchestrator transition reporting; checkpoint presentation; `foreground-always` / harness-compat (`meta/techniques/harness-compat/`).
- Possibly schema/envelope shape if `activity_complete` gains next-activity fields (server + workflow rules) — confirm in impact analysis; prefer workflow/technique updates first.

**Change categories:** Activity, Technique, Resource, Structural refactor (multi-item).
