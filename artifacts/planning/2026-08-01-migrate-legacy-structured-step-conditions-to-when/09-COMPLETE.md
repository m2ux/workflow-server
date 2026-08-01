# Workflow Authoring: corpus-when-migration — Complete

> Update · 2026-08-01

## Summary

Migrated plain-comparison structured step `condition:` blocks to inline `when:` across six corpus workflows, with checkpoint, exists-shaped, and loop-continuation sites kept structured and every site disposition recorded. Semantics preserved; definition guards clean; published as [PR #378](https://github.com/m2ux/workflow-server/pull/378) on `workflow/corpus-when-migration`.

## What Was Delivered

- **Activities:** Modified step gates in 30 activity files across `work-package`, `workflow-design`, `prism`, `meta`, `prism-audit`, and `substrate-node-security-audit` (plus one intentional no-edit kept-class file). Six root `workflow.yaml` minor version bumps.
- **Techniques:** Unchanged.
- **Resources:** Unchanged.
- **Variables and rules:** Unchanged — dialect swap only inside existing steps.

## Design Decisions

| Artifact | Role |
|----------|------|
| [01-change-brief.md](01-change-brief.md) | Purpose, out-of-scope kept classes, open judgement on deprecated `workflow-design` |
| [01-impact-analysis.md](01-impact-analysis.md) | Blast radius, integrity, empty removals inventory |
| [06-scope-manifest.md](06-scope-manifest.md) | 38-entry file inventory and drafting order |
| [06-migration-register.md](06-migration-register.md) | Per-site migrate/keep disposition for all 238 structured step-condition sites |
| [09-findings-register.md](09-findings-register.md) | Quality-review rollup — 0 open findings |

Drafting-time call with no other home: include deprecated `workflow-design` (open judgement 1) so the corpus fully converges on one step-gate dialect.

## Scope Outcome

Manifest delivered exactly — 38 of 38 entries addressed; no unplanned files on the branch.

## Known Limitations and Deferrals

- **Checkpoint `condition` blocks stay structured** — migration gated on server work that makes `when` enable `condition_not_met` dismissal; see change brief out-of-scope.
- **Exists-shaped and `while`/`doWhile` continuation predicates stay structured** — no live `when` form / not step gates.
- **OR-shaped compound step gates stay structured** — `||` has no live `when` precedent; `&&` compounds migrated.
- **Related baseline PR #374** remains on `workflow/338-when-migration`; this run’s delivery is PR #378 on `workflow/corpus-when-migration`.
- **Planning artifacts** (including this close-out and the findings register) live on the engineering branch; host main submodule pointers are out of this activity’s commit surface.

## Run Retrospective

- Quality-review left a clean decision surface (0 open findings), so validate-and-commit did not need a remediation round — the commit gate was the only interactive stop after scope confirmation.
- Corpus edits were already committed on the worktree branch before this activity’s stage step; the activity verified the commit (36 definition files), confirmed push up-to-date, and opened the PR rather than re-committing.
- PR #374 and this branch’s head differ (`workflow/338-when-migration` vs `workflow/corpus-when-migration`); create-pr correctly opened a new PR (#378) instead of overwriting #374’s head.
