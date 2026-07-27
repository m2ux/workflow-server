# Schema Expressiveness Findings — `requirements-refinement`

**Mode:** update · **Date:** 2026-07-27
**Pass:** expressiveness
**Target:** `requirements-refinement` v1.2.0

Re-audited post-commit against `workflow/requirements-refinement` @ `37988f9a`. E-1–E-4 are the as-found rows from the pre-commit pass with their dispositions confirmed; E-5 is newly surfaced by the post-update walk.

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| E-1 | Medium | `contract-not-procedure` (AP-111) — Protocol 5's four `Set {x} to true when …` bullets restate the identity criteria the four rewritten Output descriptions now own; two homes for one definition | `techniques/validate-specification.md` Protocol 5 / `## Outputs` | Collapse Protocol 5 to one bullet emitting the four verdict ids per their declared Output criteria — a content removal, so inventory it for Gate 2 (resolves [F-4](03-follow-ups.md)) · **residual, confirmed still present** |
| E-2 | Medium | `no-next-step-narration` (AP-98) — two `confirmed` option descriptions narrated the route `transitions[]` already owns (`continue to analysis`, `proceed to update the specification`) | `activities/01-intake-and-analyze.yaml` option descriptions | **Applied** — narration deleted; the decision stays in the option labels · **re-verified clean** |
| E-3 | Low | `readme-orients-not-transcribes` (AP-40) — both README tiers stated an activity inventory count (`the five …`) that must be edited whenever activity membership changes | `README.md` Structure · `activities/README.md` intro | **Applied** — count removed; the index table remains the authoritative list · **re-verified clean** |
| E-4 | Low | `alternate-ops-as-protocol-sequence` (AP-124) / `rule-as-protocol-step` (AP-121) — Protocol 1 "Determine Mode" produces no outcome, and Protocols 2 and 3 are mutually exclusive apply variants numbered as if sequential; renumbering them would not change behaviour | `techniques/update-specification.md` Protocol 1–3 | Collapse to one "Apply Changes" phase whose bullets are the two mode branches; deferred — touching the correction-cycle Protocol pre-empts the G1 wiring Gate 2 has not settled · **residual, confirmed still present** |
| E-5 | Medium | `no-bind-mechanics-as-prose` (AP-118) + `numbered-protocol-phases` (AP-108) — Protocol 1 bullet 1 instructs capturing `{source_path}` and `{target_doc_path}`, both declared container Inputs and `required: true` workflow variables; the bullet teaches how to obtain an already-bound value, and the phase also carries a second, distinct outcome (basename derivation) | `techniques/intake-sources.md` Protocol 1 | Drop the capture bullet and retitle the phase to the basename derivation — **NOT applied: narrows the technique's declared intake boundary and its Capability sentence, so it needs a design call, not an audit edit** |

**Finding count:** 5 · **3 residual** after this pass (E-1, E-4 held; E-5 newly standing)

## Notes

- E-1's disposition follows [F-4](03-follow-ups.md), which delegated the choice to this pass: inventory the collapse for approval, or accept the residual overlap. Inventorying is chosen — AP-111 is a real duplication and permanently accepting it is the worse outcome.
- Checked and clean: `statement-not-question` (AP-99) on all four gate messages; `link-named-artifacts` (AP-97) with no hard-coded `NN-` prefix on any of the seven artifact links; `outcome-names-value` (AP-32) across all five `outcome[]` arrays; `artifact-not-buried` (AP-12) and `no-hand-authored-artifacts` (AP-31) — every artifact is declared as a `#### artifact` on its producing technique and no activity hand-authors `artifacts[]`; `brace-declared-ids` (AP-52) and `backtick-code-tokens` (AP-63) across all eight technique files. Re-verified post-commit, plus `bound-step-no-description` (AP-17): no `kind: technique` or `kind: action` step carries `description` or `name`, and `no-activity-prose-rules` (AP-69): no activity declares a `rules:` block.
- The cap literal `3` in `04`'s transition condition is **not** `bag-value-as-literal` (AP-127): after `max_correction_iterations` was removed no declared slot carries that meaning, which AP-127 places out of scope. This confirms the A-1 / [F-1](03-follow-ups.md) position.
- One rule was deleted in this pass and is recorded in the anti-pattern satellite rather than here: `one-advance-per-correction-pass` on `update-specification.md`, which restated the `correction_iteration` Output description while constraining only Protocol 4 (`no-one-step-rules`).
- The cross-activity correction cycle (04 → 03) is out of scope for this pass: a `kind: loop` step is activity-scoped and cannot express a cycle spanning two activities, so no formal construct substitutes for the transition back-edge. It is carried in the enforcement satellite.
