# Scope Manifest — Corpus batch: top-20 citation grain, C3 defects, ORCHESTRATION MODEL fragments

**Target:** nine workflows — multi-target corpus batch (scope table in the [change brief](01-change-brief.md)) · **Mode:** Update
**Basis:** [Change brief](01-change-brief.md) · [Impact analysis](01-impact-analysis.md)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/pr1-corpus-batch/` — present and on the run's branch `workflow/358-338-corpus-batch` @ `b04713e4` (clean, in sync with origin; the branch's registered worktree, reused since the branch cannot be checked out twice)

14 files modified; 0 created; 0 removed. Preserved instead of removed: 0 — all four inventoried content removals are approved and land inside modified files ([removals inventory](01-impact-analysis.md#3-removals-inventory)).

**Scope-time re-measurement (G1):** whole-file citation pairs in technique files ranked by resource body size, anti-patterns excluded: 79 pairs at this tree; the top-20 cut holds at ≥ 5,531 chars (pair 20 = 5,766, pair 21 = 4,866) and spans the same ten resources the routing plan names. Verdicts: 2 retarget (rows 13–14 below), 18 leave-whole (out-of-scope list); every retarget anchor resolves to an existing heading, so no resource body is touched. Full verdict log lands in the findings register at quality-review.

---

## File manifest

| # | Path (library-relative) | Kind | Action | One-line change |
|---|--------------------------|------|--------|-----------------|
| 1 | `prism/workflow.yaml` | root | modify | Inline ORCHESTRATION MODEL rule → `ref: prism-audit::orchestration-model` plus new local fragment `pass-output-forwarding` (output-forwarding and workers-not-resumed clauses) and its ref — removal 1 |
| 2 | `remediate-vuln/workflow.yaml` | root | modify | Inline ORCHESTRATION MODEL rule → new local fragment `inline-orchestration-model` (body verbatim) and its ref — removal 2 |
| 3 | `work-package/activities/02-design-philosophy.yaml` | activity | modify | Classification checkpoint message drops `{problem_complexity}` — reads only render-time-available values |
| 4 | `meta/techniques/cargo-operations/TECHNIQUE.md` | technique | modify | `resource-budget` rule narrows the `RUST_TEST_THREADS` claim to test operations (removal 3); `foreground-only` wording reconciled with `run-suite` |
| 5 | `meta/techniques/cargo-operations/run-suite.md` | technique | modify | Step 1 concurrent fan-out reworded to a foreground-consistent form; suite semantics kept (removal 4) |
| 6 | `meta/techniques/cargo-operations/check.md` | technique | modify | Env assignments precede `nice` — valid shell form (line 28) |
| 7 | `meta/techniques/cargo-operations/clippy.md` | technique | modify | Env assignments precede `nice` (line 32) |
| 8 | `meta/techniques/cargo-operations/test.md` | technique | modify | Env assignments precede `nice` (lines 29 and 31) |
| 9 | `meta/techniques/cargo-operations/build-dev.md` | technique | modify | Env assignments precede `nice` (line 28) |
| 10 | `meta/techniques/cargo-operations/build-release.md` | technique | modify | Env assignments precede `nice` (line 28) |
| 11 | `meta/techniques/cargo-operations/doc.md` | technique | modify | Env assignments precede `nice` (line 24) |
| 12 | `work-package/techniques/create-issue.md` | technique | modify | Step 1 rescoped to run only when an issue key exists; the no-key/platform-selection path moves out of step 1 |
| 13 | `substrate-node-security-audit/techniques/score-severity.md` | technique | modify | Six `severity-rubric` citations → section anchors (`#computing-severity`, `#calibration-benchmark-table`, `#severity-crosscheck-highcritical-findings`) |
| 14 | `work-package/techniques/requirements-elicitation/ask-question.md` | technique | modify | Two `requirements-elicitation` citations → `#question-domain-reference` |

**Out of scope this pass:**

- Leave-whole verdict sites (18 pairs; files untouched — AP-134 do-not-flag: audits walking every entry, whole-catalog loads, parameterized or most-of-file consumers): `design-principles` ← audit-canon (workflow-authoring), audit-principles, reconcile-design-assumptions; `schema-construct-inventory` ← audit-canon, audit-expressiveness, context-loading, yaml-authoring; `tdd-concepts-rust` ← implement-task, review-test-suite; `severity-rubric` ← merge-findings; `injection-pattern-catalog` ← load-patterns; `probe-catalog` ← derive-areas, probe-area; `subsystem-map` ← derive-areas, amend-plan; `strategist` ← portfolio-analysis; `remediation-playbook` ← attach-remediation, write-report
- `prism-audit/workflow.yaml` — fragment home kept verbatim (judgements 1 and 3 below), so it drops out of the impact analysis's directly-modified set
- `meta/workflow.yaml`, `prism-evaluate/workflow.yaml` — untouched; the fragment home does not move
- The ten anchor-surface resource bodies — untouched; every retarget anchor resolves to an existing heading
- All READMEs and the six non-target workflows ([impact classification](01-impact-analysis.md#1-impact-classification))
- Everything the change brief lists out of scope ([change brief](01-change-brief.md))

---

## Structural design

```
(unchanged) — no file is created, removed or renamed in any of the nine targets
```

**Flow:** no `transitions[]`, `initialActivity`, activity-list or step-order change anywhere; the only topology that moves is rule declaration — two inline ORCHESTRATION MODEL strings become fragment refs. Resolution of the brief's [open judgements](01-change-brief.md#open-judgements): (1) home stays `prism-audit::orchestration-model` — no ref churn, `prism-evaluate`'s ref survives; (2) the three bodies differ materially (prism: workers never resumed; remediate-vuln: worker resumed at checkpoints), so dedupe stops at the shared home and variant clauses stay in local fragments; (3) counted-as-two — the PR-text third copy is the `prism-audit` home body itself, retained verbatim.

| Convention | This change |
|------------|-------------|
| File naming | No new files; every path keeps its existing name |
| Fragment refs | `- ref:` construct as siblings use — cross-workflow `prism-audit::orchestration-model`, local bare keys |
| New fragment keys | `pass-output-forwarding` (prism), `inline-orchestration-model` (remediate-vuln) — clear of the taken-key set in the [impact analysis](01-impact-analysis.md#change-constraints) |
| Citation anchors | GitHub-slug `#section` form as corpus-established; all anchors resolve to existing headings |
| Versions / field order | Semantic bumps on modified files — minor where a fragment key is declared (rows 1–2), patch elsewhere; field ordering untouched |

---

## Drafting order

1. **Roots** (rows 1–2) — the fragment co-change set lands atomically: refs never precede their declared bodies
2. **Activity** (row 3) — single self-contained checkpoint-message repair
3. **Techniques** (rows 4–14) — content fixes and retargets; rows 4–5 drafted together (budget-claim and reconciliation co-change sets), rows 6–11 are one mechanical fix applied per file
4. **Resources / README** — no tier: no anchor additions needed, READMEs verified unaffected
