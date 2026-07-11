# Intake & Context — substrate-node-security-audit (focused review)

**Created:** 2026-07-03
**Mode:** Review (audit an existing workflow against three targeted goals; remediation follows via the quality-review disposition if warranted)
**Target workflow:** `substrate-node-security-audit` v4.17.0
**Baseline:** `workflows` branch tip `e802ece2` (PR #159 merged — the general compliance remediation is complete and out of scope here)

---

## Operation classification

- **Operation:** `review` (recognition pattern: "ensure this workflow makes effective use of… does not duplicate… prefer X over Y" — an evaluative audit against design principles, not a blind edit).
- **`is_review_mode` = true**, `review_scope_confirmed = true` (target explicitly named by the user in the request; the review-scope checkpoint was resolved on that basis).
- This is a **separate, new** design session from `2026-07-02-workflow-design-review-substrate-node-security-audit` (which ran a general AP-compliance review → v4.17.0, PR #159, now merged). The user confirmed: *"that work is separate and complete. this is a new workflow."*

## Review goals (the audit dimensions)

1. **Prism-technique reuse & no content duplication.** Assess whether `substrate-node-security-audit` should reuse techniques/resources from the `prism` family (`prism`, `prism-audit`) instead of re-implementing overlapping capability, and whether it duplicates content that already lives elsewhere.
2. **Effective gitnexus use.** Assess where the audit scans/analyses the codebase (reconnaissance, function-registry build, architecture mapping, coverage) and determine where gitnexus code-intelligence should be invoked to do that scanning/analysis.
3. **gitnexus preferred over grep where appropriate.** Identify grep-centric steps/resources where gitnexus (symbol graph, call graph, impact, execution flows) is the better instrument, and where grep legitimately remains (pattern-presence lead generation).

## Structural baseline (target inventory)

| Dimension | Count / note |
|-----------|--------------|
| Version | 4.17.0 (author m2ux) |
| Purpose | Fully automated multi-phase AI security audit for Substrate-based blockchain node codebases |
| Main-flow activities (7) | `scope-setup` → `reconnaissance` → `primary-audit` → `adversarial-verification` → `report-generation` → `ensemble-pass` (opt) → `gap-analysis` (opt) |
| Sub-agent activities (7) | `sub-reconnaissance`, `sub-architectural-analysis`, `sub-crate-review`, `sub-static-analysis`, `sub-toolkit-review`, `sub-output-verification`, `sub-structured-merge` |
| Techniques (~19) | `dispatch-sub-agents/` group (5 ops) + `score-severity`, `verify-sub-agent-output`, `merge-findings`, `write-report`, `write-gap-analysis`, `map-vulnerability-domains`, `execute-ensemble-pass`, `apply-checklist`, `build-function-registry`, `extract-invariants`, `scan-storage-lifecycle`, `decompose-safety-claims`, `map-codebase`, `analyze-architecture`, `setup-audit-target`, `search-pattern-catalog`, `execute-sub-agent` |
| Resources (11) | `start-here`, `audit-template-reference`, `audit-prompt-template`, `severity-rubric`, `static-analysis-patterns`, `toolkit-checklist`, `sub-agent-output-schema`, `target-profile`, `vulnerability-pattern-vocabulary`, `gap-analysis-template` |
| User checkpoints | 0 (fully automated by design; phase gates are structural boolean variables) |
| **`prism` references** | **0** (no reuse of the prism family) |
| **`gitnexus` references** | **0** |
| **grep footprint** | Heavy: `static-analysis-patterns.md` is a grep-pattern catalog executed by `search-pattern-catalog`; `build-function-registry` enumerates functions; `audit-prompt-template.md` philosophy = "grep is a lead generator, read EVERY file" |

## Analysis focus (raised by the baseline)

- **Codebase-analysis surface** where gitnexus is a candidate: `reconnaissance`/`sub-reconnaissance` (architecture map, crate classification, trust boundaries), `build-function-registry` (currently manual/`grep 'fn '`), `map-codebase`, `analyze-architecture`/`sub-architectural-analysis`, coverage gate (files >200 lines read), `search-pattern-catalog` (grep sweeps).
- **Prism overlap** to assess: `adversarial-verification` + `decompose-safety-claims` vs prism adversarial/dispute machinery; `execute-ensemble-pass` vs prism multi-mode; `analyze-architecture`/cognitive-lens decomposition vs prism structural lenses; whether `prism-audit` already encodes reusable audit scaffolding.

## Governing constraints (carried into the review)

- **Fidelity:** do not modify server `src/`/`schemas/` or unrelated workflow YAML; changes (if any) land only in the target workflow, in a **dedicated worktree** off the `workflows` tip.
- **Non-destructive:** content-reducing edits require explicit approval; flag any removed material.
- **Grep is not wholesale wrong:** grep remains the right tool for pattern-*presence* lead generation; the goal is to prefer gitnexus where structural/relational analysis is what's actually needed — not to purge grep.

---

**Status:** Intake complete — review mode confirmed, target confirmed, three audit goals fixed, structural baseline captured. Proceeding to scope the review dimensions.
