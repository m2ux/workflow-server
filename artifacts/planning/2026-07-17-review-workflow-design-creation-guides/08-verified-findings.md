# Verified Findings — `workflow-design` (update quality-review)

**Mode:** update · **Date:** 2026-07-17
**Pass:** verified (third quality-review pass — audits the binding-fidelity fix pass, commit `aad982cf`)
**Target:** edit tree `2026-07-17-workflow-design-slim-planning-artifacts/workflow-design`

## High findings

None. Expressiveness, conformance, rule-hygiene, and rule-enforcement passes produced 0 High-tier findings this pass — nothing to re-derive adversarially.

## Medium (spot-confirmed)

| ID | Severity | Finding | Location | Verification |
|----|----------|---------|----------|--------------|
| F-1 | Medium | `{$dimension_capture}` read with `$` at the consuming step | `techniques/capture-dimension.md` | **Confirmed** — direct read of the file showed the second occurrence at the "Fold Accumulated Design" step still carried `$`, contradicting `bind-protocol-locals`' declare-once rule. **Applied** (fix-all). Re-audit: 0. |
| F-2 | Medium | `{$structural_design}` / `{$drafting_order}` read with `$` at the persist step | `techniques/scope-definition.md` | **Confirmed** — same pattern, two locals, one file. **Applied** (fix-all). Re-audit: 0. |
| F-3 | Medium | `{$pr_title}` / `{$pr_body}` read with `$` at the create-pr step | `techniques/publish-workflow-pr.md` | **Confirmed** — same pattern. **Applied** (fix-all). Re-audit: 0. |
| F-4 | Medium | `#### artifact` on `structural_inventory_path` instead of `structural_inventory` | `techniques/intake-classification.md` | **Confirmed** — cross-checked `structural_inventory_path` retains an external consumer (`activities/01-intake-and-context.yaml` checkpoint messages, ×2) so relocating the marker does not orphan it. **Applied**. Re-audit: 0. |
| F-5 | Medium | `#### artifact` on `scope_manifest_path` instead of `scope_manifest` | `techniques/scope-definition.md` | **Confirmed** — cross-checked `scope_manifest_path` retains external consumers (`activities/06-scope-and-draft.yaml`, `activities/09-validate-and-commit.yaml` checkpoint messages) and bare `{scope_manifest}` has multiple external readers already. **Applied**. Re-audit: 0. |

**Finding count (verified for remediation):** 5 Medium (all elected fix-all; all applied before re-audit)

## Withdrawn candidate

A sixth candidate — moving `#### artifact` from `verified_findings_path` onto `verified_findings` in `techniques/verify-high-findings.md` — was re-derived and **withdrawn**: `verified_findings_path` has no external consumer (no other file reads `{verified_findings_path}` or bare `{verified_findings}`), so removing its dead-output exemption via the marker move would introduce a NEW binding-fidelity violation, not fix one. Independently confirmed by running `scripts/check-binding-fidelity.ts` with and without the edit (1 NEW with the edit, 0 NEW without). The file is left unchanged.

## Pass summary

| Pass | Count (at audit) | Count (after fix) | Notes |
|------|------:|------:|-------|
| Expressiveness | 5 | 0 | 3 `bind-protocol-locals` read-site defects + 2 artifact-placement gaps, all introduced or left over by the binding-fidelity fix pass; fixed |
| Conformance | 0 | 0 | Clean — no naming/structure/version-format divergence in the 20 touched files |
| Rule hygiene | 0 | 0 | Clean — no `rules[]` content touched by this pass |
| Rule enforcement | 0 | 0 | Clean — no new text-only critical rules; `blocker-gate` unaffected |

## Cross-check with automated binding-fidelity guard

`npx tsx scripts/check-binding-fidelity.ts --root 2026-07-17-workflow-design-slim-planning-artifacts` (run against the edit tree directly, since the MCP server's own `workflows` worktree is pinned to the pre-feature-branch base and does not reflect this branch's commits):

- Before this pass's fixes: 251 total, 255 baselined, **0 NEW** (matches the task brief — commit `aad982cf` already cleared the 21 NEW violations).
- After this pass's fixes: 251 total, 255 baselined, **0 NEW, 4 fixed** (the four real fixes each closed a violation already sitting in the accepted baseline; baseline shrink not applied — out of scope for this session).
- `check-all-refs.ts`: 0 unresolved across all workflows.
- `validate-workflow-yaml.ts workflow-design`: all files valid.

## Prior-pass spot-check (carried forward)

The High binding-gap fix (`pattern_analysis` Output) and the two Low cite-anchor fixes (C-1, C-2) from the first quality-review pass, and the four next-step-narration fixes (E-1..E-4) from the second pass, remain applied and unregressed — confirmed by direct read of the current files.

**has_critical_finding:** false — no Critical-severity finding in this pass or carried forward.
