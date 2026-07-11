# Intake and Context — prism compliance review

**Date:** 2026-07-01
**Session:** OYGFOT
**Workflow:** workflow-design v1.5.0
**Activity:** intake-and-context
**Operation:** review (audit)

## Classification

| Variable | Value |
|----------|-------|
| operation type | review |
| `is_review_mode` | `true` |
| `is_update_mode` | `false` |
| `target_workflow_id` | `prism` |
| `review_scope_confirmed` | pending (blocking checkpoint) |

This session audits an **existing** workflow against the 14 design principles and the schema/convention
baseline. No drafting or modification occurs in review mode. Per the review-mode guide, the activity
sequence is shortened to: intake-and-context → quality-review → validate-and-commit → retrospective
(requirements-refinement, pattern-analysis, impact-analysis, scope-and-draft are skipped).

## Review target location (IMPORTANT)

The audit reads the **UPDATED** prism from a git worktree, NOT the server's own (older) copy:

```
/home/mike1/projects/work/workflow-server/2026-07-01-prism-lens-remediation/workflows/prism
```

Target files are inspected with Read/Grep on that absolute path. `get_workflow` / `get_resource`
are NOT used to load the target (they resolve the server's stale copy); those server tools remain
reserved for the workflow-design workflow's OWN resources/techniques.

## Structural inventory of target (prism, worktree copy)

**Root**
- `workflow.yaml` — id `prism`, version `2.0.0`, title "Structural Analysis Prism Workflow", author m2ux
- `README.md`
- `concept-lexicon.md`
- `initialActivity: select-mode`

**Counts**

| Entity | Count | Notes |
|--------|------:|-------|
| Total files under `prism/` | 110 | |
| Activities (`activities/*.yaml`) | 13 | `00-select-mode` … `12-adaptive-pass` |
| Technique files (incl. subfolders) | 31 | 9 top-level `.md` + `TECHNIQUE.md` base + 4 multi-file technique dirs (adaptive-analysis, smart-analysis, subsystem-analysis, verified-analysis) |
| Resource files (`resources/*.md`) | 63 | lens prompts + templates + calibration/synthesis resources |
| Checkpoints (across activities) | 1 | `select-mode` pipeline-mode confirmation only (minimal-interaction model) |
| Transition blocks | 12 activities carry `transitions:` | ~20 `- to:` edges total |

**Step-kind census across the 13 activity files**

| kind | count |
|------|------:|
| technique | 29 |
| action | 11 |
| loop | 4 |
| checkpoint | 1 |
| **total steps** | **45** |

**Activities**

| # | Activity file | checkpoints | has transitions |
|---|---------------|:-----------:|:---------------:|
| 00 | select-mode | 1 | yes |
| 01 | structural-pass | 0 | yes |
| 02 | adversarial-pass | 0 | yes |
| 03 | synthesis-pass | 0 | yes |
| 04 | deliver-result | 0 | no |
| 05 | behavioral-synthesis-pass | 0 | yes |
| 06 | generate-report | 0 | yes |
| 07 | dispute-pass | 0 | yes |
| 08 | subsystem-pass | 0 | yes |
| 09 | verified-pass | 0 | yes |
| 10 | reflect-pass | 0 | yes |
| 11 | smart-pass | 0 | yes |
| 12 | adaptive-pass | 0 | yes |

**Techniques (top-level + multi-file dirs)**

- Top-level `.md`: behavioral-pipeline, dispute-analysis, full-prism, generate-report, plan-analysis,
  portfolio-analysis, present-result, reflect-analysis, single-lens-analysis, structural-analysis
- `TECHNIQUE.md` base contract at techniques root
- Multi-file technique dirs (each with own `TECHNIQUE.md` + stage files):
  - `adaptive-analysis/` (stage-1-sdl, stage-2-l12, stage-3-full)
  - `smart-analysis/` (dispute-correction, knowledge-fill, prereq-scan, run-analysis, select-mode)
  - `subsystem-analysis/` (calibrate, decompose, execute, synthesize)
  - `verified-analysis/` (corrected-analysis, gap-detection, gap-extraction, initial-analysis)

**Workflow variables:** 27 declared (target, target_type, pipeline_mode, output_path, selected_lenses,
lens_name, analysis_focus, analysis_units, current_unit, structural/adversarial/synthesis_output_path,
portfolio_output_paths, behavioral_output_paths, behavioral_synthesis_output_path, all_artifact_paths,
report_path, gitnexus_available, unit_output_dir, dispute_outputs, subsystem_assignments,
subsystem_outputs, verified_gap_data, reflect_history_context, smart_pipeline_steps, adaptive_stage,
adaptive_signal_quality).

**Domain model.** Ten analysis pipeline modes selectable via `pipeline_mode`: single (L12), full-prism
(3-pass structural→adversarial→synthesis), portfolio (multi-lens), behavioral (4+1 pipeline), dispute
(2 orthogonal prisms + disagreement synthesis), subsystem (per-region prism + cross-subsystem
synthesis), verified (L12 + gap detection + re-analysis), reflect (L12 + meta + constraint synthesis),
smart (adaptive chain), adaptive (depth escalation SDL→L12→full). Core invariant: each analytical pass
runs in a FRESH sub-agent (isolation model) — orchestrator with disposable workers, output forwarded
verbatim between passes.

## Preliminary observations (to carry into quality-review — NOT audit findings)

These are inventory-level notes only; the `audit-*` techniques in the quality-review activity produce
the authoritative findings.

- `rules` uses the keyed-object shape `{ workflow: [...], activity: [...] }`, which is the schema's
  current shape (`workflow.schema.json` defines `rules` as an object with `workflow[]`/`activity[]`).
  So the shape itself is schema-valid; audit-rule-hygiene will judge content/placement.
- Several rules are written as ALL-CAPS-prefixed prose directives (ISOLATION MODEL, ORCHESTRATION
  MODEL, etc.) — candidates for the rule-hygiene / rule-enforcement passes (text-only vs. structurally
  enforced).
- 63 resource files with several apparent variant families (e.g. `error-resilience` has base / `-70w`
  / `-compact` / `-neutral` variants; `api-surface` has base + `-neutral`; `evolution` base +
  `-neutral`; `l12` has several variants). Consistency/anti-pattern passes should check for redundancy.
- Only one checkpoint in the whole workflow (by design — minimal-interaction model stated in rules).

## Schema baseline internalized

- Loaded the `workflow-server://schemas` MCP resource: all six schemas (workflow, activity, technique,
  condition, state, session-file). Design-time trio for the audit: workflow / activity / technique.
- Read `schemas/README.md` — schema ontology, entity relationships (workflow → activities → steps
  {technique|action|checkpoint|loop}; techniques bound at steps via `step.technique`; condition
  combinators simple/AND/OR/NOT; transitions/decisions route between activities).

## Reference peers surveyed (pattern baseline)

Similar-type workflows available in the server `workflows/` tree for convention comparison during the
audit: `prism-audit`, `prism-evaluate`, `prism-update` (prism family), plus `work-package` and
`workflow-design` as modern well-formed exemplars.

## Checkpoint

`review-scope-confirmed` (blocking) — confirm the audit is scoped to `target_workflow_id = prism`.
Options: `confirm-review-target` (sets `review_scope_confirmed = true`) / `wrong-review-target`.
