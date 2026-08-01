# Impact Analysis — Corpus condition-to-when step-gate migration

**Workflow:** `work-package` v3.40.0 · `workflow-design` v1.31.0 · `prism` v2.3.0 · `meta` v5.14.0 · `prism-audit` v1.2.0 · `substrate-node-security-audit` v4.19.0
**Mode:** Update
**Date:** 2026-08-01
**Change source:** [change brief](01-change-brief.md)
**Baseline:** Branch `workflow/338-when-migration` @ `e2e70e68`

---

## Summary

Cross-cutting step-gate dialect swap with workflow topology untouched: no activities, transitions, techniques, resources, variables or checkpoint options are added, removed or renamed. Each structured `condition:` block that is a plain step gate is replaced in place by the literal-equivalent `when:` expression; every other structured site is kept and dispositioned in the migration register.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

Candidate-site counts per file; a compound OR-shaped site inside a file stays structured, so a file whose sites are all OR-shaped drops out at draft time.

| File | Sites | Why |
|------|-------|-----|
| `work-package/activities/01-start-work-package.yaml` | 19 | plain/compound step gates |
| `work-package/activities/02-design-philosophy.yaml` | 2 | plain/compound step gates |
| `work-package/activities/04-research.yaml` | 3 | incl. 1 forEach entry gate |
| `work-package/activities/05-implementation-analysis.yaml` | 3 | incl. 1 forEach entry gate |
| `work-package/activities/06-plan-prepare.yaml` | 1 | plain step gate |
| `work-package/activities/07-assumptions-review.yaml` | 5 | incl. 1 forEach entry gate |
| `work-package/activities/08-implement.yaml` | 2 | incl. 1 forEach entry gate |
| `work-package/activities/10-post-impl-review.yaml` | 4 | incl. 1 forEach entry gate |
| `work-package/activities/11-validate.yaml` | 4 | plain/compound step gates |
| `work-package/activities/12-strategic-review.yaml` | 4 | plain/compound step gates |
| `work-package/activities/13-submit-for-review.yaml` | 17 | plain/compound step gates |
| `work-package/activities/14-complete.yaml` | 7 | plain/compound step gates |
| `workflow-design/activities/01-intake-and-context.yaml` | 11 | plain/compound step gates |
| `workflow-design/activities/03-requirements-refinement.yaml` | 3 | incl. 1 forEach entry gate |
| `workflow-design/activities/05-impact-analysis.yaml` | 3 | plain/compound step gates |
| `workflow-design/activities/06-scope-and-draft.yaml` | 7 | incl. 1 forEach entry gate |
| `workflow-design/activities/08-quality-review.yaml` | 21 | incl. 1 forEach entry gate |
| `workflow-design/activities/09-validate-and-commit.yaml` | 13 | plain/compound step gates |
| `workflow-design/activities/10-post-update-review.yaml` | 5 | plain/compound step gates |
| `workflow-design/activities/11-retrospective.yaml` | 3 | plain step gates |
| `prism/activities/01-structural-pass.yaml` | 4 | plain/compound step gates |
| `prism/activities/02-adversarial-pass.yaml` | 1 | plain step gate |
| `prism/activities/03-synthesis-pass.yaml` | 1 | plain step gate |
| `prism/activities/05-behavioral-synthesis-pass.yaml` | 1 | plain step gate |
| `prism/activities/12-adaptive-pass.yaml` | 2 | plain/compound step gates |
| `meta/activities/00-discover-session.yaml` | 1 | plain step gate |
| `meta/activities/04-end-workflow.yaml` | 1 | plain step gate |
| `meta/activities/patterns/02-supervisor.yaml` | 1 | plain step gate |
| `meta/activities/patterns/03-plan-and-execute.yaml` | 1 | forEach entry gate |
| `prism-audit/activities/01-prompt-generation.yaml` | 1 | plain step gate |
| `substrate-node-security-audit/activities/05-report-generation.yaml` | 1 | compound step gate (needs `&&` precedent check per site) |

31 files, 152 candidate sites (`work-package` 71 · `workflow-design` 66 · `prism` 9 · `meta` 4 · `prism-audit` 1 · `substrate-node-security-audit` 1).

### Possibly touched at draft time

| File | Why |
|------|-----|
| `<target>/workflow.yaml` (6 files) | Only if the library's version-bump convention applies to corpus-wide definition edits at commit time |
| Migration register (planning folder) | New planning artifact minted by this run; records all 238 dispositions |

### Unaffected

All technique files (standalone, group contracts, nested operations), all resource files, all READMEs and root definitions across the corpus; the 15 activity files whose only structured sites are kept (checkpoint / exists / `while`-`doWhile` continuation); and every file of the five register-only workflows (`codebase-wiki`, `remediate-vuln`, `workflow-authoring`, `midnight-system-review`, `ponytail`).

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity is added, removed, renamed or reordered; `transitions[]` and `initialActivity` are untouched in every target |
| Technique and resource references | Pass — no `techniques[]`, `technique:` or resource reference changes anywhere in the change surface |
| Variables, checkpoint effects, step gates | Pass by construction — each migrated `when` references exactly the variables its structured block referenced; no `setVariable` key changes. Baseline-wide variable audits belong to the guard runs at quality review, not to this change |

---

## Decision ask

Confirm the impact scope: a semantics-preserving in-place dialect swap with zero material removals — the removals inventory is empty because every replaced `condition:` block's full predicate (variable, operator, value, combinator) is carried into its `when:` expression.
