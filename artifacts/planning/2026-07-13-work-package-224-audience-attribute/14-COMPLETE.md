# Audience Attribute on Technique Output Declarations — Complete

> Enhancement · branch `feat/224-v4-audience-attribute` · PR [#227](https://github.com/m2ux/workflow-server/pull/227) · 2026-07-14

## Summary

Added an optional `audience` attribute (`human | agent`) to technique output / `#### artifact` declarations, threaded end-to-end — protocol spec, Zod + JSON schema, loader parse, `get_activity` artifacts-contract carry-through — and guarded by a standalone corpus lint (`scripts/check-audience.ts`). The change is purely additive and backward-compatible: declarations without `audience` load and validate unchanged, so nothing a reader sees today changes. This is PR #1 of epic [#224](https://github.com/m2ux/workflow-server/issues/224) (cluster 2 / backlog item V4) and the RC4 enabler that lets later work convert agent-only artifacts to compact structured JSON. See the [implementation plan](06-work-package-plan.md) for the seven-task breakdown.

## Results

- Validation: all checks green — build, full Vitest suite, and the new `check:audience` corpus guard pass. No standalone validation report was produced on this path; the reviewed-clean state is recorded across the [code review](09-code-review.md) (5/5, 0 findings at any severity), [test-suite review](10-test-suite-review.md), and [strategic review](12-strategic-review-1.md) (scope-fit clean, minimality all-yes). Both branch commits are GPG-signed.
- Success criteria: all 7 met ([plan §Success Criteria](06-work-package-plan.md#success-criteria) → [design philosophy §Success Criteria](02-design-philosophy.md#success-criteria)). No divergences.
- Files changed: 13 files, +522/−23 — see [change-block index](10-change-block-index.md).
- Design decisions: recorded in the [plan](06-work-package-plan.md#proposed-approach) (additive-field approach mirroring `destination`/`action`; standalone lint rather than extending `check-binding-fidelity.ts`) and the [assumptions log](01-assumptions-log.md). No implementation-time decisions were made that are recorded nowhere else.

## Known Limitations

- **Zero corpus adoption at ship time** — no technique in the workflows corpus declares `audience` yet, so `scripts/audience-baseline.json` is an empty-array snapshot. The attribute is a foundation; adoption follows in later increments.
- **Guard checks the declared artifact name, not the on-disk content** — `check-audience.ts` asserts an `agent`-audience artifact's declared name follows the JSON-format convention. It cannot validate the actual file's shape or that a writer honoured the convention; instance-content validation is out of scope.
- **Per-artifact JSON field schemas are deferred to V5** — V4 states *who reads* an artifact and *that* an agent artifact is JSON. It does not fix the payload shape of any specific agent artifact (assumptions-log, findings-classification, etc.) nor enforce content format at write time; that is V5's shape-ownership scope. See the [architecture summary §Deferred (V5)](10-architecture-summary.md#deferred-v5).
- **No runtime behaviour change on its own** — the field is an informational contract annotation plus a name-only corpus guard. It unblocks downstream verbosity reduction but changes no workflow behaviour and no user-visible output until later work adopts it.

## Lessons Learned

- The additive-field precedent (`destination`, `action`, `inherited_*`, `bundleTechniques`) made scoping unambiguous: mirroring the established output-field pattern kept the diff minimal (one optional property, one hand-edited JSON-schema entry, one reserved-key parse, one carry-through) and let the lean audit close with "Lean already. Ship." on the first pass.
- Keeping the audience convention in its own guard (`check-audience.ts`) rather than extending `check-binding-fidelity.ts` held the one-guard-per-concern line and avoided muddying the binding-fidelity baseline — the alternatives table captured this trade-off up front so it was not re-litigated downstream.

## Workflow Retrospective

[messages: session-level checkpoint confirmations only, 0 substantive non-checkpoint interactions · session quality: Smooth]

### Observations

- [checkpoint anomaly] All 8 checkpoints were answered with the recommended/expected option on the first pass (skip-optional, audit-accepted, confirmed, rationale-confirmed, proceed, acceptable, certify, approved) — no corrections, re-plans, or rework flags. A clean glide-path with no non-checkpoint friction to mine.
- [variable-alignment note] Three distinct "complexity" signals coexist without an obvious binding: design-philosophy classifies the change **Moderate**, the classification checkpoint set `path_gating_complexity: simple`, and the `complete` activity's ADR steps gate on `problem_complexity` (which stayed unset, correctly skipping the ADR — corroborated by the design-philosophy Notes). The naming proximity of the three risks a future reader mistaking `path_gating_complexity` for the ADR gate.

### Recommendations

1. **Low:** the two ADR steps in `complete` gate on `problem_complexity` while the confirmed classification value lives in `path_gating_complexity` → either bind the ADR gate to the value the classification checkpoint actually sets, or document the distinction where the gate is authored, so the "no ADR on a Moderate change" outcome is legible rather than incidental.

**Key takeaway:** A smooth, first-pass session; the only workflow signal is the loosely-related trio of complexity variables around the ADR gate.
**Action required:** no
