# Security Audit Activities

> Part of the [Security Audit Workflow](../README.md)

The activities that carry an audit from a confirmed target through reconnaissance, concurrent multi-agent review, adversarial verification, severity-calibrated reporting, and the optional ensemble and gap-analysis passes. The main flow (`01`–`07`) is linear with two configuration branches after report generation (ensemble pass, then gap analysis). The sub-agent activities (`10`–`16`) are dispatched by the orchestrator during reconnaissance and primary audit; they do not appear in the main transition graph.

This file is an orientation map. The authoritative definition of each activity — its steps, actions, conditions, decisions, and transitions — lives in the per-activity YAML linked below and is served by `get_activity`. Cross-cutting invariants live in the workflow-root [`workflow.yaml`](../workflow.yaml) `rules`.

---

## Main Flow

| # | Activity | Role |
|---|----------|------|
| 01 | [`scope-setup`](01-scope-setup.yaml) | Pin the audit to a confirmed target at an exact commit, run dependency scanning, and establish the planning folder |
| 02 | [`reconnaissance`](02-reconnaissance.yaml) | Classify the in-scope surface, map trust boundaries and consensus paths, build the function registry, and assign each area to a responsible agent |
| 03 | [`primary-audit`](03-primary-audit.yaml) | Dispatch all specialized agent groups concurrently, verify output completeness with a fresh-context verification agent (V), and consolidate with a fresh-context merge agent (M). Report generation is entered only when the dispatch, verification, and merge gates are all set |
| 04 | [`adversarial-verification`](04-adversarial-verification.yaml) | Re-check every high-stakes PASS verdict at the property level to recover findings missed as false PASSes |
| 05 | [`report-generation`](05-report-generation.yaml) | Enforce the coverage / dispatch-completeness / reconciliation gates, integrate adversarial results, apply calibrated severity, and produce the report |
| 06 | [`ensemble-pass`](06-ensemble-pass.yaml) *(optional)* | Run a second-model pass on priority-1/2 components and union-merge with primary results |
| 07 | [`gap-analysis`](07-gap-analysis.yaml) *(optional)* | Compare the finalized report against a professional reference report |

---

## Sub-Agent Activities

Dispatched by the orchestrator; each is loaded by a sub-agent via [`execute-sub-agent`](../techniques/execute-sub-agent.md).

| # | Activity | Agent | Role |
|---|----------|-------|------|
| 16 | [`sub-reconnaissance`](16-sub-reconnaissance.yaml) | R | Classify the in-scope surface and build the function registry |
| 13 | [`sub-architectural-analysis`](13-sub-architectural-analysis.yaml) | S | Security-oriented architectural decomposition surfacing vulnerability domains beyond §3 |
| 10 | [`sub-crate-review`](10-sub-crate-review.yaml) | Group A | Deep, evidence-backed §3 review of an entire priority crate |
| 11 | [`sub-static-analysis`](11-sub-static-analysis.yaml) | Group B | Pattern-based and mechanical analysis across the whole scope, with zero-hit cases verified |
| 12 | [`sub-toolkit-review`](12-sub-toolkit-review.yaml) | Group D | Per-function toolkit review |
| 14 | [`sub-output-verification`](14-sub-output-verification.yaml) | V | Fresh-context validation that every required agent ran and every mandatory table is present |
| 15 | [`sub-structured-merge`](15-sub-structured-merge.yaml) | M | Fresh-context, provably-lossless merge into a single canonical, deduplicated, severity-scored finding set |
