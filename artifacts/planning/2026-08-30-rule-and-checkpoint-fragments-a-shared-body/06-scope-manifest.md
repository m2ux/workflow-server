# Scope Manifest — Rule and checkpoint fragments: a shared home

**Target:** `work-package` v4.0.0 · **Mode:** Update
**Basis:** [Change brief](01-change-brief.md) · [Impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-30-rule-and-checkpoint-fragments-a-shared-body` — present, on branch `workflow/work-package-borrowed-gate-variables` at `bc52c69`, the fetched `origin/workflows` tip

Zero files created, modified or removed. Preserved instead of removed: none — nothing was flagged.

---

## File manifest

| # | Path (under `work-package/`) | Kind | Action | One-line change |
|---|------------------------------|------|--------|-----------------|
| — | — | — | — | No file in the corpus is left in the state #519 describes |

**Out of scope this pass:**

- `work-package/workflow.yaml` and the four activity files holding the seven `ref` sites — the migration surface of [#520](https://github.com/m2ux/workflow-server/issues/520), which retires #519's checkpoint half.
- `schemas/workflow.schema.json` and `src/loaders/fragment-resolver.ts` — same, and outside the edit surface besides.
- `remediate-vuln/workflow.yaml` — candidate until the variable check was measured; the declarations it was to gain already reach it from the borrowed activities.
- `scripts/check-fragments.ts` — candidate for a widened `undeclared-effect-variable` walk; the walk already follows `activities:` refs into the authoring workflow, so there is nothing to widen.

---

## Structural design

```
work-package/   # unchanged
```

**Flow:** unchanged. No activity is added, removed or reordered, so `work-package`'s graph and `initialActivity` stand, and `remediate-vuln`'s graph keeps binding the same borrowed activity ids.

| Convention | This change |
|------------|-------------|
| File naming | No file is created, so no name is minted |
| Field ordering | No field is added |
| Version format | No definition changes, so no version is bumped |
| Routing patterns | Untouched — no exit or graph edge changes |
| Checkpoint structure | The two shared bodies keep their `fragments.checkpoints` form; #520 converts them |
| Technique structure | Untouched |

---

## Drafting order

Nothing to draft. Each tier is listed with why it is empty, so a reader can tell an empty manifest from an unfinished one.

1. **Root definition** — `work-package/workflow.yaml` holds the two checkpoint fragments and changes under #520.
2. **Activities** — the four files holding the seven `ref` sites change under #520.
3. **Techniques** — none implicated.
4. **Resources** — the placement rule this run considered writing into the canon is superseded by #520's own placement criterion.
5. **README** — no tree change to describe.

---

## Why the manifest is empty

Four of #519's six acceptance criteria are met at the corpus tip and two are carried out under #520. The [change brief](01-change-brief.md) holds the per-criterion standing and its evidence.

A manifest that named a file anyway would be authoring change for its own sake against a corpus already in the state the issue asks for.
