# Expressiveness Findings — `workflow-design`

**Mode:** update · **Date:** 2026-07-17
**Pass:** expressiveness (third quality-review pass — audits the binding-fidelity fix pass, commit `aad982cf`)
**Target:** edit tree `2026-07-17-workflow-design-slim-planning-artifacts/workflow-design` (v1.24.4)

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Medium | `{$dimension_capture}` bound at the producing step is read again with the `$` prefix at the consuming step (`bind-protocol-locals`) — declare-once requires the second read to be bare `{dimension_capture}` | `techniques/capture-dimension.md` (Protocol 2. Fold Accumulated Design) | Drop `$` at the read site |
| F-2 | Medium | Same pattern for two locals: `{$structural_design}` / `{$drafting_order}` read with `$` at the persist step instead of bare | `techniques/scope-definition.md` (Protocol 6. Persist Scope Manifest) | Drop `$` at both read sites |
| F-3 | Medium | Same pattern: `{$pr_title}` / `{$pr_body}` read with `$` at the create-pr step instead of bare | `techniques/publish-workflow-pr.md` (Protocol 3. Create Or Update Draft PR) | Drop `$` at both read sites |
| F-4 | Medium | `#### artifact` sits on `structural_inventory_path` instead of the producing content Output `structural_inventory` — this pass moved the same marker onto content outputs in 12 sibling techniques but missed this one | `techniques/intake-classification.md` | Move `#### artifact` onto `structural_inventory` |
| F-5 | Medium | Same artifact-placement gap: `#### artifact` sits on `scope_manifest_path` instead of the content Output `scope_manifest` | `techniques/scope-definition.md` | Move `#### artifact` onto `scope_manifest` |

**Finding count:** 5 (at audit) · **after fix-all:** 0

## Fixes applied

| # | File | Change | Result |
|---|------|--------|--------|
| F-1 | `techniques/capture-dimension.md` | Read site → bare `{dimension_capture}` | Applied; version 1.1.0 → 1.1.1 |
| F-2 | `techniques/scope-definition.md` | Read sites → bare `{structural_design}` / `{drafting_order}` | Applied |
| F-3 | `techniques/publish-workflow-pr.md` | Read sites → bare `{pr_title}` / `{pr_body}` | Applied; version 1.2.0 → 1.2.1 |
| F-4 | `techniques/intake-classification.md` | `#### artifact` relocated onto `structural_inventory` | Applied; version 2.5.0 → 2.5.1 |
| F-5 | `techniques/scope-definition.md` | `#### artifact` relocated onto `scope_manifest` | Applied; version 1.3.0 → 1.3.1 (combined with F-2) |

Re-audit: `npx tsx scripts/check-binding-fidelity.ts --root <worktree>` re-run after the fixes — **0 NEW**, and 4 of the fixes each resolved a violation that was already sitting in the accepted baseline (`251 total, 255 baselined, 0 NEW, 4 fixed`). `check-all-refs.ts` and `validate-workflow-yaml.ts` both re-run clean.

## Notes

- A sixth candidate (`techniques/verify-high-findings.md`: `#### artifact` on `verified_findings_path` instead of `verified_findings`) was considered and **rejected** — moving it would strip `verified_findings_path`'s dead-output exemption, and no other file reads `{verified_findings_path}` or bare `{verified_findings}`. `check-binding-fidelity.ts` confirmed the would-be regression (1 NEW dead-output finding) before the edit was kept; the file is left unchanged. `verify-high-findings.md` was not part of the 20-file binding-fidelity scope for this reason.
- F-1..F-3 are `bind-protocol-locals` (Coupling Anti-Patterns) rather than a schema-construct-inventory substitution; `audit-anti-patterns` (the technique that owns that catalog entry) is review-mode only. This update-mode `audit-expressiveness` pass still caught and fixed them as protocol-binding-correctness defects introduced by the return-to-draft binding-fidelity pass, since they are unambiguous per the entry's own Detect/Fix text and independently confirmed by the binding-fidelity script's baseline-shrink.
- F-4/F-5 are the same "artifact on content Output, not path Output" construct this pass already applied to 12 sibling techniques (`assemble-file-approach`, `audit-anti-patterns`, `audit-conformance`, `audit-expressiveness`, `audit-principles`, `audit-rule-enforcement`, `audit-rule-hygiene`, `pattern-analysis`, `review-drafted-file`, `persist-report`, `conduct-retrospective`, `create-completion-doc`, `readme-authoring`) — `intake-classification.md` and `scope-definition.md` were touched in the same commit for a different reason (locals demotion) and the placement gap was missed there.
