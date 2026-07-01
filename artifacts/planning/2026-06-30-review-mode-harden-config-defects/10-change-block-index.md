# Change Block Index — Post-Implementation Review (#145)

**Review scope:** `4f72a20b..HEAD` (commits `c6e10666` feat + `2c2b9e94` dedup) on `feat/145-review-mode-harden-config-defects`, base `workflows`.
**Layer:** definition (workflow markdown/yaml). GitNexus indexes server `src/` only — no applicable symbols for these edits; preflight noted and skipped.
**Estimated manual review time:** ~9 blocks × 30s ≈ 5 min.

> Note on diff scope: `git diff origin/workflows..HEAD` shows spurious `codebase-wiki/*` deletions because `origin/workflows` has advanced past the branch's merge-base (`e6c13def`) on an unrelated merge (#146). The true change set is `4f72a20b..HEAD` — the 9 files below.

| Row | Path | File | Aug |
|-----|------|------|-----|
| [1](#block-1) | `prism/techniques/` | structural-analysis.md | 3 |
| [2](#block-2) | `work-package/techniques/` | findings-classification.md | 4 |
| [3](#block-3) | `work-package/resources/` | review-mode.md | 4 + 1 |
| [4](#block-4) | `work-package/techniques/` | review-code.md | 2 |
| [5](#block-5) | `work-package/techniques/` | review-existing-feedback.md (NEW) | 1 |
| [6](#block-6) | `work-package/activities/` | 01-start-work-package.yaml | 1 (wiring) |
| [7](#block-7) | `work-package/techniques/` | review-summary.md | 1 (render) |
| [8](#block-8) | `work-package/activities/` | 11-validate.yaml | 5 (wiring) |
| [9](#block-9) | `work-package/techniques/` | review-test-suite.md | 5 |

## Block Rationale

### Block 1
`structural-analysis.md` — aug 3. Adds a "Producer/clearer ledger" subsection under the Execute-Lens step, plus Format-Output and output-component edits. Makes the abstract "Conservation Law" concrete: a set-wide enumeration of every producer of a conserved resource against every clearer, verified per termination path. Purely additive to protocol/output — no signature change — so cross-workflow bindings of this shared lens are preserved (DD-2 assumption holds). Canonical home for the lifecycle method; `review-code` (Block 4) points here rather than duplicating.

### Block 2
`findings-classification.md` — aug 4 core. Adds "Impact-based severity axes" (unbounded-state-growth, economic-spam, liveness-halt, migration-upgrade) orthogonal to code-correctness, and a `classified_findings` output carrying the `impact_axis`. Codifies "correct-but-harmful ⇒ Major at minimum (Critical when unrecoverable)". Because Major ≥ Minor, the existing `needs_code_fixes` routing threshold is unchanged — the axes add severity without changing routing (assumption verified).

### Block 3
`review-mode.md` — aug 4 render boundary + aug 1 render. Adds (a) the classified→rendered severity map (Critical→Critical, Major→High, Minor→Medium, Nit→Low, Informational→omitted) to Severity Definitions so a reclassified finding is not downgraded at render; (b) a Prior Feedback Triage section, table, and PF prefix; (c) the rating-cap rule in Review Type Selection. Resource remains the authoritative format owner.

### Block 4
`review-code.md` — aug 2. Adds an "Associated-type / trait-impl swap" sub-check to Bound-Review-Scope: a `Config`/associated-type/trait-impl change extends the blast radius to unchanged upstream read/write sites keyed on the swapped binding. Delegates the lifecycle walk to the prism producer/clearer ledger (Block 1) via a cross-workflow anchor link — single-owner method (the `2c2b9e94` dedup commit collapsed a duplicated walk description into this pointer).

### Block 5
`review-existing-feedback.md` (NEW) — aug 1. New technique: ingest every prior PR comment/review (human + bot, top-level + inline) BEFORE independent analysis; disposition each Confirmed/Refuted/Superseded; derive a `rating_cap` when an unaddressed blocker-class concern stands. Outputs `prior_feedback_triage` (artifact + bag var) and `rating_cap`. `single-ingest-of-reported-failures` rule makes this the sole ingest point; aug 5 consumes its tagged entries (DD-4, no double-count). Inherits the 6 common inputs from `techniques/TECHNIQUE.md` (`pr_number`, `planning_folder_path`, etc.), so the protocol's `{pr_number}`/`{planning_folder_path}` reads are satisfied by inheritance.

### Block 6
`01-start-work-package.yaml` — aug 1 wiring. Bound-pure step `ingest-prior-feedback` (id + technique + condition only, AP-64) referencing `review-existing-feedback`, gated `is_review_mode == true`, placed after `capture-pr-reference` so `review_pr_url`/`pr_number` exist (DD-3). Current-workflow bare ref resolves in lint.

### Block 7
`review-summary.md` — aug 1 render boundary. Declares `prior_feedback_triage` and `rating_cap` as inputs (signature-is-the-contract) and adds protocol steps to render the triage section and apply the cap to the Overall Rating (held ≤ Request Changes when an external blocker stands). Producer→consumer chain for both variables now complete.

### Block 8
`11-validate.yaml` — aug 5 wiring. Bound-pure step `triage-reported-failures` referencing `review-test-suite`, gated `is_review_mode == true`. Reads `{prior_feedback_triage}` (bag var from Block 5) via same-name binding.

### Block 9
`review-test-suite.md` — aug 5. Adds optional `prior_feedback_triage` input; a "Multi-instance coverage gate" (each instance of instance-generic code must be exercised; a mock-masked branch escalates the HARNESS as a finding, not a default nit); and a "Reported-failure triage" that traces each tagged reported failure to a code path + state precondition. All findings classify ≥ Minor so they route.
