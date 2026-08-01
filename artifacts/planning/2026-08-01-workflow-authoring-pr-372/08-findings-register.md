# Findings Register — 358-338-corpus-batch

**Date:** 2026-08-01 · **Mode:** Update
**Base ref:** `46bc1811dbc265179e8b62055adb6aaad2b0974b` · **Targets:** nine (rows below)
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/pr1-corpus-batch/` · branch `workflow/358-338-corpus-batch`
**Scope:** [06-scope-manifest.md](06-scope-manifest.md) · **Impact:** [01-impact-analysis.md](01-impact-analysis.md)

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |

Known class-keyed baselines in scope (not severity-bucketed open findings): 45 (`binding-fidelity-triage` + `ACCEPTED_HEADLESS_AUTO_ADVANCE`).

| Metric | Value |
|--------|-------|
| Targets swept | 9 |
| Changed files (branch vs base) | 14 |
| Definition guards | all green (`fail_count` = 0 per target) |
| Change-introduced open findings | 0 |
| Coverage blocked units | 0 |
| Independent High re-derivation | n/a (zero High rows) |

## Findings

### `work-package`

| Field | Value |
|-------|-------|
| Surface files | 164 |
| Changed vs base | 3 (`work-package/activities/02-design-philosophy.yaml`, `work-package/techniques/create-issue.md`, `work-package/techniques/requirements-elicitation/ask-question.md`) |
| Consumer refs into target | 42 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 10 |
| Notes | Classification checkpoint message drops render-time-unavailable `{problem_complexity}`; create-issue step 1 rescoped and platform-for-creation extracted as step 2; ask-question retargets requirements-elicitation to `#question-domain-reference` (heading exists). |

### `meta`

| Field | Value |
|-------|-------|
| Surface files | 156 |
| Changed vs base | 8 (cargo-operations TECHNIQUE.md + six ops + run-suite.md) |
| Consumer refs into target | 19 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 33 |
| Notes | Env-before-nice on six ops; resource-budget narrows `RUST_TEST_THREADS` to test ops; foreground-only reconciled with run-suite concurrent foreground shells. Co-change sets satisfied. |

### `workflow-design`

| Field | Value |
|-------|-------|
| Surface files | 75 |
| Changed vs base | 0 |
| Consumer refs into target | 1 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 1 |
| Notes | No files changed on branch. Surface walked; no change-introduced findings. |

### `cicd-pipeline-security-audit`

| Field | Value |
|-------|-------|
| Surface files | 66 |
| Changed vs base | 0 |
| Consumer refs into target | 0 |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 0 |
| Notes | No files changed. Surface walked; empty consumer surface. |

### `midnight-system-review`

| Field | Value |
|-------|-------|
| Surface files | 34 |
| Changed vs base | 0 |
| Consumer refs into target | 0 |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 0 |
| Notes | No files changed. Surface walked; empty consumer surface. |

### `prism`

| Field | Value |
|-------|-------|
| Surface files | 116 |
| Changed vs base | 1 (`prism/workflow.yaml`) |
| Consumer refs into target | 5 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 0 |
| Notes | Inline ORCHESTRATION MODEL → ref `prism-audit::orchestration-model` + local fragment `pass-output-forwarding`. Fragments guard green; prism-evaluate still holds home ref. |

### `substrate-node-security-audit`

| Field | Value |
|-------|-------|
| Surface files | 54 |
| Changed vs base | 1 (`substrate-node-security-audit/techniques/score-severity.md`) |
| Consumer refs into target | 2 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 1 |
| Notes | Six severity-rubric citations retargeted to resolving section anchors. resource-anchors guard green. |

### `prism-audit`

| Field | Value |
|-------|-------|
| Surface files | 35 |
| Changed vs base | 0 |
| Consumer refs into target | 2 (touching changed files: 0) |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 0 |
| Notes | Fragment home retained verbatim per judgements. Consumers prism + prism-evaluate reference it. |

### `remediate-vuln`

| Field | Value |
|-------|-------|
| Surface files | 14 |
| Changed vs base | 1 (`remediate-vuln/workflow.yaml`) |
| Consumer refs into target | 0 |
| Coverage | 53 walked, 0 n/a, 0 blocked |
| Guard fail_count | 0 |
| Open findings | _(none)_ |
| Known suppressed | 0 |
| Notes | Inline ORCHESTRATION MODEL → local fragment `inline-orchestration-model`. Fragments guard green. |

## Known

| Key class | Count | Source |
|-----------|------:|--------|
| binding-fidelity-triage (harmless) | 78 triaged corpus-wide; 45 class-keyed baselines in this run's target set | `scripts/binding-fidelity-triage.json` + quality-review load-known-findings |
| ACCEPTED_HEADLESS_AUTO_ADVANCE | included in the 45 | quality-review known set |

No prior findings-register exclusions beyond class-keyed baselines. Decision surface carries zero open rows.

## Sources

| Label | Path |
|-------|------|
| Change brief | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-08-01-workflow-authoring-pr-372/01-change-brief.md` |
| Impact analysis | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-08-01-workflow-authoring-pr-372/01-impact-analysis.md` |
| Scope manifest | `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-08-01-workflow-authoring-pr-372/06-scope-manifest.md` |
| Quality-review register (prior pass body rolled up here) | same path — find-or-update in place |
| Edit surface | `/home/mike1/projects/dev/workflow-server/.worktrees/pr1-corpus-batch/` |
| Base ref | `46bc1811dbc265179e8b62055adb6aaad2b0974b` |

## Decision surface

No open findings require remediation. Independent re-derivation: zero High rows to confirm. `has_critical_finding=false`, `has_coverage_gap=false`, `open_finding_count=0`, `fail_count=0`.
