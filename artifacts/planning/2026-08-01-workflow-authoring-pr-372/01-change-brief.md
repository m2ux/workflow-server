# Change Brief — Corpus batch: top-20 citation grain, C3 defects, ORCHESTRATION MODEL fragments

**Workflow:** multi-target corpus batch — nine workflows: `work-package`, `meta`, `workflow-design`, `cicd-pipeline-security-audit`, `midnight-system-review`, `prism`, `substrate-node-security-audit`, `prism-audit`, `remediate-vuln`
**Mode:** Update
**Date:** 2026-08-01
**Change categories:** Technique · Resource · Activity · Structural refactor
**Change request:** Close the remaining unblocked corpus debt from [#358](https://github.com/m2ux/workflow-server/issues/358) and [#338](https://github.com/m2ux/workflow-server/issues/338) in one batch ([PR #372](https://github.com/m2ux/workflow-server/pull/372)): AP-134 verdicts for the twenty reserved whole-resource citation pairs, the five #189-C3 content defects, and the ORCHESTRATION MODEL fragment conversion with fragment-body dedupe.
**Baseline:** branch `workflow/358-338-corpus-batch` @ `b04713e4` (base `workflows@46bc1811`), checked out at `.worktrees/pr1-corpus-batch`; per-target file/entity counts in the intake structural inventory (session record)

---

## Purpose

Each target workflow keeps producing exactly the runs it produces today; this session changes the definition corpus those runs are served from. Citation grain moves from whole-resource to section-anchored where AP-134 says it should, five known content defects stop misdirecting executors, and the ORCHESTRATION MODEL rule stops existing as divergent inline copies. The batch clears the last unowned #358 work and the last unblocked #338 corpus items.

| Goal | Meaning |
|------|---------|
| G1 — Citation grain (top-20) | Judge each of the twenty reserved whole-resource citation pairs under AP-134: retarget to `#section` anchors where the citing technique names specific sections; record leave-whole verdicts where it consumes the full body; log every verdict in the planning register. Deprecated `workflow-design` sites get twin verdicts, minimal edits. |
| G2 — Content defects (#189 C3) | Fix the five defects: invalid env-after-`nice` shell form across the `cargo-operations` group; `RUST_TEST_THREADS` budget claim scoped to test operations only; `create-issue` step-1 scoping contradiction; `run-suite` concurrency vs `foreground-only` reconciliation; `design-philosophy` checkpoint message interpolating only render-time-available values. |
| G3 — Fragments (#338 W6 b1–2) | Convert the remaining inline ORCHESTRATION MODEL rule copies to fragment refs with a single declaring home; dedupe fragment bodies declared in more than one workflow. |
| G4 — Verification | Anchors, fragments and binding-fidelity guards run clean against the branch before review. |

**Out of scope:**

- #338 W8 (B12 retire sweep) — parked until a schema major is cut
- #316 — deferred by its own text; revisit trigger not fired
- #320 C-3 `trace_token` — needs fresh repro
- The #358 citation tail — delivered by PR #370
- `when`-migration and the citation-grain guard — routed to PRs 2 and 3 of the [routing plan](../2026-08-01-backlog-pr-routing/README.md)

---

## Dimensions

Update set: only the dimensions this change alters. Purpose, activity list, artifacts, activity model and variables of every target workflow are unchanged. Techniques appears because the request names technique-content changes explicitly.

| Dimension | This run's shape |
|-----------|------------------|
| Techniques | Citing technique files across the nine targets retargeted (or verdict-confirmed leave-whole) per AP-134; `meta/techniques/cargo-operations/` shell-form and budget-claim fixes (`TECHNIQUE.md`, `check.md`, `clippy.md`, `test.md`, `build-dev.md`, `build-release.md`, `doc.md`, `run-suite.md`); `work-package/techniques/create-issue.md` step-1 rescope. |
| Checkpoints | `work-package/activities/02-design-philosophy.yaml` classification checkpoint message interpolates only values that exist at render time (currently references a value its own options set). |
| Rules | Inline ORCHESTRATION MODEL rule copies (`prism/workflow.yaml`, `remediate-vuln/workflow.yaml`) become fragment refs against a single declaring home (existing home: `prism-audit` fragment `orchestration-model`, already consumed cross-workflow by `prism-evaluate`); `cargo-operations` group rule `resource-budget` narrows its test-threads claim; `foreground-only`/`run-suite` wording reconciled. |
| Resources | No body rewrites. Section headings/anchors added only where a retarget verdict needs an addressable heading that does not exist; ten resource bodies in six workflows are the anchor surface (`design-principles`, `schema-construct-inventory`, `tdd-concepts-rust`, `requirements-elicitation`, `injection-pattern-catalog`, `remediation-playbook`, `cicd-severity-rubric`, `severity-rubric`, `probe-catalog`, `subsystem-map`, `strategist`). |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Declaring home for the `orchestration-model` fragment | The sources ask for "a single declaring home" without naming it; `prism-audit` already declares the fragment and `prism-evaluate` already refs it cross-workflow | Keep `prism-audit` as home: two new cross-workflow refs, no ref churn. Move to a neutral home (e.g. `meta`): three refs repointed including the existing `prism-evaluate` ref, symmetric coupling. |
| 2 | One shared fragment body vs per-workflow variants | The three ORCHESTRATION MODEL texts differ materially: `prism` adds output-forwarding and workers-not-resumed clauses; `remediate-vuln` describes an inline orchestrator with a one-level-indirection constraint | Unify: maximal dedupe, but variant clauses must survive elsewhere or be approved as removals. Keep variants as separate fragments: semantics preserved, dedupe limited to genuinely identical bodies. |
| 3 | Inline copy count: PR says three, baseline shows two | Branch baseline carries inline copies in `prism` and `remediate-vuln` only; the third "copy" is plausibly `prism-audit`'s fragment body itself (three bodies of one rule) | Counted-as-three: conversion includes rehoming/deduping the `prism-audit` body. Counted-as-two: scope manifest records the count correction against the PR text. |

---

## Confirmation ask

Approving this brief commits the run to drafting the three change groups on `workflow/358-338-corpus-batch` across the nine-workflow scope, with content removals limited to the inventory in the [impact analysis](01-impact-analysis.md).
