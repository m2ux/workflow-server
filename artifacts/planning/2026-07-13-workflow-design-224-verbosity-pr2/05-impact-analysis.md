# Impact Analysis

> workflow-design · #224 PR 2 · 2026-07-13

## Directly modified

**work-package (target, 3.28.0 → 3.29.0):**

| File | Items | Change |
|---|---|---|
| `workflow.yaml` | V7 | version bump |
| `activities/12-strategic-review.yaml` | V1 | add `verify-artifact-conforms` step beside `verify-readme` |
| `activities/10-post-impl-review.yaml` | V6 | destination binding on `structural-analysis-inline`; `file-index-table` checkpoint message names the merged report location |
| `activities/09-lean-coding-audit.yaml` | V6 | destination binding on ponytail review op |
| `resources/wp-plan.md` | V2, V3 | Key Findings Summary → link-only Inputs; Problem Statement / Scope / Success Criteria / Assumptions / Testing Strategy → link slots; keeps Approach, Tasks, Dependencies & Risks |
| `resources/requirements-elicitation.md` | V3, V6 | canonical home (Problem/Scope/Criteria); `### Deferred` → pointer to register |
| `resources/design-framework.md` | V3 | philosophy template: line-budgeted ticket statement; Success Criteria + Design Decisions → link slots |
| `resources/implementation-analysis.md` | V3 | Success Criteria → link slot (keeps Baseline Metrics, Measurement) |
| `resources/architecture-summary.md` | V3 | Risks & Mitigations → link + new-post-impl-risks only |
| `resources/complete-wp.md` | V6 | Deferred Items → link to register |
| `resources/assumptions-review.md` | V6 | wrap-up deferred pointer: COMPLETE.md → register |
| `resources/review-mode.md` | V6 | Consolidated Review Format: findings by ID + disposition |
| `resources/manual-diff-review.md` | V6 | report template section rehomed as a `code-review.md` section template (index-table forms unchanged) |
| `resources/github-issue-creation.md` | V6 | deferred-item issue creation reads the register |
| `resources/readme.md` | V7 | artifact-list sweep |
| `techniques/manage-artifacts/TECHNIQUE.md` | V3 | canonical-home map rule (single declaration) |
| `techniques/manage-artifacts/verify-artifact-conforms.md` | V1 | **NEW** — conformance gate op |
| `techniques/plan-prepare/plan.md` | V2, V3 | link-only Inputs protocol; decisions/risks ownership |
| `techniques/requirements-elicitation/create-document.md` | V3 | canonical-home responsibilities |
| `techniques/design-philosophy/document.md` | V3 | line-budget + no-forward-restatement |
| `techniques/research/document.md` | V2 | findings stated once in kb-research; consumers link |
| `techniques/implementation-analysis/document.md` | V3 | success-criteria link discipline |
| `techniques/review-assumptions/record.md` | V6 | deferred outcomes point at register |
| `techniques/review-diff.md` | V6 | manual-diff report → `code-review.md` section; drops `manual-diff-review.md` artifact declaration; keeps `change-block-index.md` |
| `techniques/review-code.md` | V6 | `code-review.md` gains merged sections (manual-diff findings, structural analysis, lean-coding) |
| `techniques/review-summary.md` | V6 | render by ID + disposition |
| `techniques/strategic-review/document-findings.md` | V6 | exception-only, ID-referencing findings |
| `techniques/finalize-documentation/create-complete-doc.md` | V6 | Deferred Items slot links register |
| `README.md`, `REVIEW-MODE.md`, `resources/README.md`, `techniques/README.md` | V7 | reference sweep (new op, merged artifacts, format change) |

**Cross-workflow (RR-3, user-confirmed):** `prism/techniques/structural-analysis.md`, `ponytail/techniques/review-over-engineering.md` — optional findings-destination input, default = current standalone artifact.

**workflow-design (V8, 1.7.0 → 1.8.0):** `resources/anti-patterns.md` (AP-86–89: template-mandated section duplication; restatement slots; unenforced style rules; undeclared artifact audience), `resources/design-principles.md` (pointer extension), `workflow.yaml` (version).

## Indirectly affected

- `techniques/update-pr/post-review-comment.md` — posts the reformatted summary verbatim; verify its format references still hold (likely no edit).
- `techniques/conduct-retrospective/retrospective.md` — writes into COMPLETE.md; unaffected by artifact merges (verified: no advisory-artifact greps).

## Integrity

No activities added/removed/reordered — transition chains, `initialActivity`, reachability unchanged. No variables added/removed — all gates and `setVariable` keys intact. New reference `manage-artifacts::verify-artifact-conforms` resolves once the new file lands (same commit). All `manual-diff-review.md` artifact references swept in the same pass (resources/README.md, review-diff.md, activity 10 checkpoint message).

## Removals (flagged for confirmation)

1. `wp-plan.md` — "Key Findings Summary" restatement slot (replaced by link-only Inputs list).
2. `wp-plan.md` — Problem Statement / Scope / Success Criteria / Assumptions / Testing Strategy prescribed sections (→ one-line link slots to their canonical homes).
3. `design-framework.md` — philosophy template's Success Criteria and Design Decisions sections (→ link slots); Problem Statement reduced to a 2–4 sentence ticket-derived budget.
4. `implementation-analysis.md` — Success Criteria section (Performance/Quality/Functional subsections → link; Baseline Metrics and Measurement Strategy stay).
5. `architecture-summary.md` — Risks & Mitigations restatement (→ link + net-new risks only).
6. `complete-wp.md` — Deferred Items table body (→ link to `deferred-items.md` register).
7. `review-mode.md` — Consolidated Review Format's full finding restatement (→ ID + disposition per finding).
8. `review-diff.md` — standalone `manual-diff-review.md` artifact (findings become a `code-review.md` section; `change-block-index.md` unchanged).
9. Per-run standalone `structural-analysis.md` / lean-coding `review-findings.md` in work-package runs (redirected into `code-review.md`; standalone prism/ponytail runs unchanged).
