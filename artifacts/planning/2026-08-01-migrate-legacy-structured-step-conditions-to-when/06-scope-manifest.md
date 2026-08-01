# Scope Manifest — Corpus condition-to-when step-gate migration

**Target:** `work-package` v3.40.0→3.41.0 · `workflow-design` v1.31.0→1.32.0 · `prism` v2.3.0→2.4.0 · `meta` v5.14.0→5.15.0 · `prism-audit` v1.2.0→1.3.0 · `substrate-node-security-audit` v4.19.0→4.20.0 · **Mode:** Update
**Basis:** [change brief](01-change-brief.md) · [impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-migrate-legacy-structured-step-conditions-to-when/` — present, on branch `workflow/corpus-when-migration` @ `e2e70e68` (PR #374 baseline)

38 files enumerated: 1 created, 37 modified, 0 removed — as landed, 36 modified (row 26 took no edit: all its sites are kept-class) and 1 created. Preserved instead of removed: 0 — the [removals inventory](01-impact-analysis.md) is empty. Per-site dispositions: [migration register](06-migration-register.md).

The impact analysis's "possibly touched" question on the six `workflow.yaml` files is settled: the library's version-bump convention (every definition-editing commit bumps the target's minor version — e.g. `7c964e45` 3.39.0→3.40.0, `17d3c1e8` 3.38.0→3.39.0) applies, so all six are in scope.

---

## File manifest

Site counts are candidate sites from the [impact analysis](01-impact-analysis.md). At draft time OR-shaped compounds stayed structured; after [PR #383](https://github.com/m2ux/workflow-server/pull/383) those four sites migrate to parenthesized `when:` (see [migration register](06-migration-register.md)).

| # | Path (under the edit surface) | Kind | Action | One-line change |
|---|-------------------------------|------|--------|-----------------|
| 1 | `work-package/activities/01-start-work-package.yaml` | activity | modify | 18 plain/compound step gates become `when:` (6 exists-shaped kept) |
| 2 | `work-package/activities/02-design-philosophy.yaml` | activity | modify | 2 plain/compound step gates become `when:` |
| 3 | `work-package/activities/04-research.yaml` | activity | modify | 3 step gates become `when:` (incl. 1 forEach entry gate) |
| 4 | `work-package/activities/05-implementation-analysis.yaml` | activity | modify | 3 step gates become `when:` (incl. 1 forEach entry gate) |
| 5 | `work-package/activities/06-plan-prepare.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 6 | `work-package/activities/07-assumptions-review.yaml` | activity | modify | 5 step gates become `when:` (incl. 1 forEach entry gate) |
| 7 | `work-package/activities/08-implement.yaml` | activity | modify | 2 step gates become `when:` (incl. 1 forEach entry gate) |
| 8 | `work-package/activities/10-post-impl-review.yaml` | activity | modify | 4 step gates become `when:` (incl. 1 forEach entry gate; NOT-shaped `structural-analysis-inline` migrated after #383) |
| 9 | `work-package/activities/11-validate.yaml` | activity | modify | 4 plain/compound step gates become `when:` |
| 10 | `work-package/activities/12-strategic-review.yaml` | activity | modify | 4 plain/compound step gates become `when:` |
| 11 | `work-package/activities/13-submit-for-review.yaml` | activity | modify | 17 plain/compound step gates become `when:` |
| 12 | `work-package/activities/14-complete.yaml` | activity | modify | 5 plain/compound step gates become `when:` (2 nested-OR kept) |
| 13 | `workflow-design/activities/01-intake-and-context.yaml` | activity | modify | 10 plain/compound step gates become `when:` (1 OR-shaped kept) |
| 14 | `workflow-design/activities/03-requirements-refinement.yaml` | activity | modify | 3 step gates become `when:` (incl. 1 forEach entry gate) |
| 15 | `workflow-design/activities/05-impact-analysis.yaml` | activity | modify | 3 plain/compound step gates become `when:` |
| 16 | `workflow-design/activities/06-scope-and-draft.yaml` | activity | modify | 7 step gates become `when:` (incl. 1 forEach entry gate) |
| 17 | `workflow-design/activities/08-quality-review.yaml` | activity | modify | 21 step gates become `when:` (incl. 1 forEach entry gate) |
| 18 | `workflow-design/activities/09-validate-and-commit.yaml` | activity | modify | 13 plain/compound step gates become `when:` |
| 19 | `workflow-design/activities/10-post-update-review.yaml` | activity | modify | 5 plain/compound step gates become `when:` |
| 20 | `workflow-design/activities/11-retrospective.yaml` | activity | modify | 3 plain step gates become `when:` |
| 21 | `prism/activities/01-structural-pass.yaml` | activity | modify | 4 plain/compound step gates become `when:` |
| 22 | `prism/activities/02-adversarial-pass.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 23 | `prism/activities/03-synthesis-pass.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 24 | `prism/activities/05-behavioral-synthesis-pass.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 25 | `prism/activities/12-adaptive-pass.yaml` | activity | modify | 2 plain/compound step gates become `when:` |
| 26 | `meta/activities/00-discover-session.yaml` | activity | modify | dropped out at draft: all 5 sites are kept-class (3 checkpoint, 2 exists) — no edit landed |
| 27 | `meta/activities/04-end-workflow.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 28 | `meta/activities/patterns/02-supervisor.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 29 | `meta/activities/patterns/03-plan-and-execute.yaml` | activity | modify | 1 forEach entry gate becomes `when:` |
| 30 | `prism-audit/activities/01-prompt-generation.yaml` | activity | modify | 1 plain step gate becomes `when:` |
| 31 | `substrate-node-security-audit/activities/05-report-generation.yaml` | activity | modify | 1 compound step gate becomes `when:` if AND-shaped (`&&` precedented; OR-shaped stays structured) |
| 32 | `work-package/workflow.yaml` | root | modify | version 3.40.0 → 3.41.0 |
| 33 | `workflow-design/workflow.yaml` | root | modify | version 1.31.0 → 1.32.0 |
| 34 | `prism/workflow.yaml` | root | modify | version 2.3.0 → 2.4.0 |
| 35 | `meta/workflow.yaml` | root | modify | version 5.14.0 → 5.15.0 |
| 36 | `prism-audit/workflow.yaml` | root | modify | version 1.2.0 → 1.3.0 |
| 37 | `substrate-node-security-audit/workflow.yaml` | root | modify | version 4.19.0 → 4.20.0 |
| 38 | `06-migration-register.md` (planning folder, not edit surface) | register (planning artifact) | create | migrate/keep disposition row with reason for every one of the 238 structured step-condition sites — co-change set names it as a PR merge gate |

**Out of scope this pass:**

- Kept-site classes — checkpoint gates, exists-shaped predicates, `while`/`doWhile` continuation predicates, workflow-level `transitions[].condition`, checkpoint option effects: see the [change brief](01-change-brief.md) Out of scope.
- The 15 activity files whose only structured sites are kept, and every file of the five register-only workflows (`codebase-wiki`, `remediate-vuln`, `workflow-authoring`, `midnight-system-review`, `ponytail`) — per the [impact analysis](01-impact-analysis.md) these take register rows only, no edits.
- All technique files, resource files, READMEs across the corpus — unaffected per the [impact analysis](01-impact-analysis.md).

---

## Structural design

Layout unchanged — no directory, file, activity, technique or resource is added, removed or renamed; every edit is in place inside existing `activities/*.yaml` files plus the six root `workflow.yaml` version lines.

**Flow:** topology unchanged — no `transitions[]`, `initialActivity`, checkpoint or option changes in any target.

| Convention | This change |
|------------|-------------|
| File naming (`NN-name.yaml`, kebab-case) | Unchanged — no file is created or renamed on the edit surface |
| Field ordering | Unchanged — `when:` replaces `condition:` at the same step position |
| Version format (semantic `X.Y.Z`) | One minor bump per target root, per the library's bump-on-edit convention |
| Transition patterns | Untouched |
| Checkpoint structure | Untouched — checkpoint `condition:` blocks are kept sites |
| Step gate dialect | Migrated sites use the schema-preferred inline `when:` expression; `&&` compounds follow 20 live precedents, `||` compounds stay structured |

---

## Drafting order

1. **Pilot — `meta` + `prism-audit` (5 sites, rows 26–30)** — smallest surfaces prove the literal-equivalence recipe, including one forEach entry gate, before any bulk edit.
2. **Compound precedent — `substrate-node-security-audit` (row 31)** — the sole flagged compound settles the `&&`-precedent ruling early.
3. **Mid tier — `prism` (rows 21–25)** — 9 sites across 5 files under the proven recipe.
4. **Bulk — `work-package` (rows 1–12), then `workflow-design` (rows 13–20)** — the two largest surfaces last, when the recipe is settled; `workflow-design` is included per the resolved target list (deprecation judgement: [change brief](01-change-brief.md) Open judgements).
5. **Root version bumps (rows 32–37)** — after each target's activity edits are final, so a target whose sites all drop out at draft time can drop its bump too.
6. **Migration register (row 38)** — last; every disposition (152 candidates + 86 kept sites) is settled only once all drafting is done.

The target READMEs take no manifest rows: the change alters no behavior a README states; the readme-authoring step verifies alignment rather than editing.
