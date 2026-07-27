# Verified Findings — `requirements-refinement`

**Mode:** update · **Date:** 2026-07-27
**Pass:** verified
**Target:** `requirements-refinement` v1.2.0

Each High re-derived from the cited construct alone, refuting by default; Mediums spot-confirmed.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| N-2 | High — **confirmed** | Correction cycle has no structural termination guarantee | `activities/04` transition 2 + `techniques/update-specification.md` | Gate 2: wrap update/validate in `kind: loop` with `maxIterations` |
| N-1 | High — **confirmed** | Canonical-document integrity text-only across three rule homes | `workflow.yaml` `rules.activity[2]`, `TECHNIQUE.md`, `finalize-specification.md` | Gate 2: `action: validate` on the write target |
| C-1 | ~~High~~ → **Medium** (downgraded) | Seven `_path` outputs were undeclared in `variables[]` against a 19/19 sibling convention | `workflow.yaml` `variables[]` | **Applied** — seven declarations added |
| E-1 | Medium — confirmed | `contract-not-procedure` (AP-111): Protocol 5 restates four Output identity criteria | `techniques/validate-specification.md` | Gate 2 removal (resolves [F-4](03-follow-ups.md)) |
| E-2 | Medium — confirmed | `no-next-step-narration` (AP-98) in two option descriptions | `activities/01-intake-and-analyze.yaml` | **Applied** |
| H-1 | Medium — confirmed | `single-rule-authority` (AP-22): protocol-preservation dual-homed, identifier list already drifted 4-of-7 | `workflow.yaml` `rules.activity[0]` ↔ `TECHNIQUE.md` | Gate 2 removal |
| H-2 | Medium — confirmed | `single-rule-authority` (AP-22): planning-folder invariant dual-homed | `workflow.yaml` `rules.activity[2]` ↔ `TECHNIQUE.md` | Gate 2 removal |
| H-3 | Medium — confirmed | `no-rule-protocol-restatement` (AP-19): restates two technique Protocols | `workflow.yaml` `rules.activity[1]` | Gate 2 removal |
| H-4 | Medium — confirmed | `no-rule-protocol-restatement` (AP-19): restates `update-specification` Protocol 2 | `workflow.yaml` `rules.activity[3]` | Gate 2 removal |
| H-5 | Medium — confirmed | `no-rule-protocol-restatement` (AP-19): restates four other homes | `workflow.yaml` `rules.activity[4]` | Gate 2 removal |
| N-3 | Medium — confirmed | Status-change confirmation clause unenforced, three homes | `workflow.yaml` `rules.universal[0]` | Gate 2: checkpoint, or reclassify as guidance |
| N-4 | Medium — confirmed | Source-readable precondition is technique prose with no failure arm (also AP-113) | `techniques/intake-sources.md` Protocol 2 | Gate 2: `action: validate` on `01` |
| E-3 | Low — confirmed | `readme-orients-not-transcribes` (AP-40): activity inventory counts | `README.md`, `activities/README.md` | **Applied** |
| E-4 | Low — confirmed | `alternate-ops-as-protocol-sequence` (AP-124) in Protocol 1–3 | `techniques/update-specification.md` | Follow-up |
| C-2 | Low — confirmed | Four resources lack the sibling frontmatter shape (141/142) | `resources/*.md` | Follow-up; outside confirmed scope |

**Finding count:** 15 (2 High confirmed · 1 High downgraded to Medium · 9 Medium confirmed · 3 Low confirmed) · **Critical:** 0

## Notes

Re-derivation evidence for the three High findings:

- **N-2 — confirmed.** Inspected `activities/04-validate-specification.yaml` transition 2 (`to: update-specification`, AND of `has_correctable_issues`, `has_critical_issues`, `correction_iteration < 3`) and `activities/03-update-specification.yaml` (single step, default transition to `validate-specification`) — a transition cycle. Reproduced independently: `maxIterations` is a `kind: loop` field, transitions carry only `to` / `condition` / `isDefault`, and the workflow declares zero loops, so the engine does not bound this cycle. The only thing advancing `{correction_iteration}` is a technique Output description plus the `one-advance-per-correction-pass` rule — both prose; no `action: set` and no condition verifies advancement. Counter-argument weighed and rejected: the cycle would normally exit via `validation_passed` as passes resolve findings, but that is behavioural expectation, not structure, which is exactly AP-79's concern — and G1's stated goal is termination.
- **N-1 — confirmed.** Verified all three rule homes exist verbatim, then searched every activity file for enforcement: activities `01`–`06` contain only `kind: technique` steps with `action: message` and `kind: checkpoint` steps — zero `action: validate`, zero step-level `when` / `condition`, no decision reading a write target. Criticality reproduced independently: an agent ignoring the text overwrites the user's canonical specification irreversibly. AP-79's "backed on a parent the actor always receives" exemption was tested and rejected — the rule is *delivered* on `rules.activity` and `TECHNIQUE.md`, but delivery of text is not structural backing. Mitigation noted: no technique protocol instructs a write to `{target_doc_path}`, so the exposure is latent rather than active — this lowers likelihood, not severity, since the workflow hands the agent both the finished document and the canonical path.
- **C-1 — downgraded High → Medium.** The divergence reproduced (19/19 sibling convention with zero exceptions, plus the `format-conventions.md` artifact-link row), but the adversarial pass did not reproduce *High*. Technique outputs land in the bag through `variables_changed` without a `variables[]` declaration, so the messages would have interpolated correctly; every reader on the current graph follows its own producer, so there is no `unproduced-value-read` (AP-128); and both repo validators passed before the fix. Evidence supports a conformance and legibility defect, not a functional break. The applied fix stands — additive, convention-aligning, zero-risk — but the original High rating was not sustained.

`verify-before-remediation` note: E-2, E-3, and the C-1 fix were applied during the audit passes, ahead of this verification. All three re-derive cleanly here and all three are additive or prose-narrowing with no construct removal, so none required reverting. C-1's over-rating is recorded above rather than silently corrected.
