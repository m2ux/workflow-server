# Impact Analysis — work-package `review-findings` checkpoint fix

**Workflow:** work-package (update mode)
**Change scope:** ONE checkpoint (`review-findings` in `activities/12-strategic-review.yaml`) + ONE technique output (`techniques/strategic-findings-analysis.md`) + TWO new variable declarations (`workflow.yaml`).
**Date:** 2026-07-08
**Mode of this session:** `is_update_mode = true`, `is_review_mode = false`.

---

## 1. File inventory & impact classification

| File | Impact | Justification |
|------|--------|---------------|
| `activities/12-strategic-review.yaml` | **Directly modified** | `review-findings` checkpoint: add `condition`, set `blocking: true`, remove `autoAdvanceMs`/`defaultOption`, edit message text, add `selective-fixes` option, differentiate `defer-findings` effect. |
| `techniques/strategic-findings-analysis.md` | **Directly modified** | Add `review_passed` (boolean) output. |
| `workflow.yaml` | **Directly modified** | Declare `strategic_fixes_selective` + `strategic_findings_deferred` (both boolean, default `false`). `review_passed` declaration (`:133–136`) UNCHANGED. |
| `activities/README.md` | **Indirectly affected** | Mermaid diagram (`:397–399`) depicts the `review-findings` checkpoint edges/labels; option-set change should be reflected. See §5. |
| `README.md` (root) | Unaffected | No reference to the checkpoint option ids, `autoAdvanceMs`, or the two new variables (verified by grep). |
| `REVIEW-MODE.md` | Unaffected | No reference to these options/variables. |
| All other `activities/*.yaml` (01–11, 13, 14, 15) | Unaffected | None reads `review_passed`, `needs_strategic_fixes`, `strategic_findings_summary`, `recommended_strategic_option`, or references the `review-findings` options. Their `autoAdvanceMs`/`defaultOption` usages are on unrelated checkpoints. |
| All other techniques/, resources/ | Unaffected | No reference to the touched variables or options. |

---

## 2. Readers & writers of every touched variable

Verified by full-corpus grep across `workflows/work-package/`.

### `review_passed`
- **Declared:** `workflow.yaml:133–136`, boolean, `defaultValue: false` (UNCHANGED).
- **Writers (pre-change):** `review-findings` options `acceptable` (→ true) and `defer-findings` (→ true).
- **Writers (post-change):** SAME two options **PLUS** a new producer — `strategic-findings-analysis` technique emits `review_passed: true` on the finding-free path (Option B). Additive; no writer removed.
- **Readers:** exactly ONE — transition `:89–94` (`to: submit-for-review when review_passed == true`). No other activity/technique/condition reads it. **Entirely local to `strategic-review`.**

### `needs_strategic_fixes`
- **Declared:** `workflow.yaml:258–261`, boolean, default `false`.
- **Writers:** `fix-findings` option; post-change ALSO `selective-fixes` option.
- **Readers:** **NONE.** Write-only variable — no transition, condition, or step reads it. Routing to the fix path is achieved purely by the DEFAULT transition to `plan-prepare` (which fires whenever `review_passed != true` and not review mode). Setting `needs_strategic_fixes`/`strategic_fixes_selective` is a structural record only; it does not itself drive routing. (Not a defect introduced here — pre-existing pattern.)

### `strategic_findings_summary`
- **Declared:** `workflow.yaml:363–365`.
- **Writer:** `strategic-findings-analysis` technique.
- **Readers:** the checkpoint `message` (`:54`) and — post-change — the new checkpoint `condition` (`!= ""`). No transition or other activity reads it. The downstream selective-fix path is intended to read it (per A2), but no current step does.

### `recommended_strategic_option`
- **Declared:** `workflow.yaml:314–316`.
- **Writer:** `strategic-findings-analysis` technique.
- **Readers:** the checkpoint `message` (`:56`) only. Not read by any transition. (`defaultOption` never bound to it — schema takes a static id — so its removal changes nothing here.)

### `strategic_fixes_selective` (NEW) / `strategic_findings_deferred` (NEW)
- **Name-collision check:** grep found ZERO pre-existing references in the entire workflow → no collision.
- **Writers:** `selective-fixes` and `defer-findings` options respectively.
- **Readers:** none yet (structural record for a future downstream reader, per A2/A4).
- **Gating:** both declare a default → per `check:variable-model` `exists-on-defaulted` rule they MUST NOT be gated with `exists`/`notExists`. The design gates neither. ✅

---

## 3. Routing correctness — all four path combinations

Transitions of `strategic-review` (order matters; first matching wins):
1. `to: submit-for-review` if `is_review_mode == true`
2. `to: submit-for-review` if `review_passed == true`
3. `to: plan-prepare` (default) — the re-loop (→ plan-prepare → … → validate → strategic-review)

| Path | Mechanism | Result | Correct? |
|------|-----------|--------|----------|
| **Finding-free, non-review (update/create)** | `strategic_findings_summary == ""` → checkpoint `condition` false → orchestrator dismisses via `respond_checkpoint { condition_not_met }` (NO effect fires). BUT technique already landed `review_passed: true` before the checkpoint. | Transition (2) fires → **submit-for-review**. | ✅ Airtight — no fall-through to plan-prepare. |
| **Findings-present, non-review** | `condition` true → checkpoint presented, `blocking: true`. User picks: `acceptable`/`defer-findings` set `review_passed: true` → (2) → submit-for-review; `fix-findings`/`selective-fixes` set `needs_strategic_fixes` (review_passed stays false) → (3) → plan-prepare; `more-review` sets nothing → (3) → plan-prepare. | Correct per option. | ✅ |
| **Finding-free, review mode** | Transition (1) fires unconditionally regardless of checkpoint. Even if `condition_not_met` dismisses the checkpoint, `is_review_mode == true` routes first. | **submit-for-review**. | ✅ |
| **Findings-present, review mode** | (1) fires unconditionally → submit-for-review. Options set variables but routing is (1). | **submit-for-review**. | ✅ Intended review-mode behaviour (surface findings, don't loop to fix). |

**Key verification (the flagged bug):** On `condition_not_met` dismissal the server applies NO `setVariable` (confirmed in `src/tools/workflow-tools.ts:821–828` — the `condition_not_met` branch leaves `effect` undefined). Therefore `review_passed` would remain at its `false` default UNLESS the technique sets it. **Option B (technique emits `review_passed=true` on the finding-free path) is exactly what closes the fall-through.** Without Option B the finding-free path would hit transition (3) and re-loop. With it, the path is airtight.

---

## 4. Guard / check-suite impact (`check:variable-model`)

`scripts/check-variable-model.ts` enforces four rules. Against the proposed edits:

- **`setvariable-undeclared`** — `selective-fixes` sets `strategic_fixes_selective`; `defer-findings` sets `strategic_findings_deferred`. Both MUST be declared in `workflow.yaml` `variables[]`. **The design declares them → passes. This is a REQUIRED edit, not optional:** omitting either declaration is a hard-zero guard failure.
- **`setvariable-type-mismatch`** — all new/changed effects set boolean `true` on boolean variables → passes.
- **`default-type-mismatch`** — both new declarations: boolean type + `false` default → passes.
- **`exists-on-defaulted`** — both new vars have defaults; design does not gate them with exists/notExists → passes.

The checkpoint `condition` uses `operator: "!="` (a value comparison, not `exists`) on `strategic_findings_summary`, which itself has no `defaultValue` declared — no `exists-on-defaulted` concern either way.

No other guard is triggered: the checkpoint is INLINE (not a `fragments.checkpoints` ref), so `check:fragments` is unaffected. Removing `autoAdvanceMs`/`defaultOption` violates no guard (no guard requires them).

---

## 5. Newly-discovered item requiring an additional edit

**`activities/README.md` mermaid diagram is stale after the change.** Lines 397–399 currently read:
```
analyze --> cpFindings{"review-findings checkpoint"}
cpFindings -->|"review mode or passed"| exitSubmit(["submit-for-review"])
cpFindings -->|"fix / more review"| exitPlan(["plan-prepare"])
```
After the change the option set grows (`selective-fixes` added; `defer-findings` now behaves like accept/proceed, routing to submit-for-review, not to plan-prepare). The two edge labels no longer describe the option set accurately:
- `defer-findings` sets `review_passed: true` → routes to **submit-for-review**, so it belongs on the "passed" edge, not implicitly on the fix edge.
- `selective-fixes` sets `needs_strategic_fixes` (review_passed stays false) → routes to **plan-prepare**, belonging on the fix edge.

**Recommended additional edit (for scope-and-draft):** update the two mermaid edge labels so the fix edge reads `fix / selective / more review` and the pass edge covers `review mode / passed / defer`. This keeps the diagram truthful. Classified indirectly-affected, low risk (documentation only, no behavioural impact). This is the ONLY file beyond the three named in the design intent that needs touching.

Activity `version` bumps (12-strategic-review `2.6.0`, technique `1.0.0`, workflow.yaml) are drafting-time housekeeping, handled in scope-and-draft.

---

## 6. Content being removed (for preservation confirmation)

| Removed content | File | Intentional? |
|-----------------|------|--------------|
| `blocking: false` → `blocking: true` (behaviour change, not deletion) | 12-strategic-review.yaml:57 | Yes — A3. |
| `defaultOption: acceptable` (line 58) | 12-strategic-review.yaml | Yes — A3; blocking decision, no default. |
| `autoAdvanceMs: 30000` (line 59) | 12-strategic-review.yaml | Yes — A3; condition handles the trivial case, real decisions must not auto-accept. |
| `. Auto-advancing in 30s.` text in message (line 56) | 12-strategic-review.yaml | Yes — A3; no longer auto-advances. |
| `defer-findings` option description "Note findings for future but proceed now" replaced with differentiated effect (effect gains `strategic_findings_deferred: true`) | 12-strategic-review.yaml:73–78 | Yes — A4; option RETAINED, effect differentiated, not removed. |

No technique/resource file, transition, or reference is deleted. No orphaned references result (the two removed checkpoint fields are read by nothing; `defaultOption`'s only server reader is `auto_advance`, which is no longer used for this checkpoint).

---

## 7. Final variable changes (for scope-and-draft)

| Variable | Change | Type | Default |
|----------|--------|------|---------|
| `review_passed` | UNCHANGED declaration; gains a NEW producer (technique output) | boolean | false (unchanged) |
| `strategic_fixes_selective` | **NEW declaration** in workflow.yaml | boolean | false |
| `strategic_findings_deferred` | **NEW declaration** in workflow.yaml | boolean | false |

Technique `strategic-findings-analysis`: add `review_passed` (boolean) to `## Outputs` — `true` on finding-free path, unset when significant findings present.

---

## 8. Blast-radius summary

- **Blast radius is bounded and small.** `review_passed` is read by exactly one transition, entirely local to `strategic-review`. `needs_strategic_fixes`/`strategic_fixes_selective`/`strategic_findings_deferred` are write-only structural records read by nothing (routing is via the default transition). `strategic_findings_summary`/`recommended_strategic_option` are consumed only by the checkpoint message + (new) condition — no other consumer anywhere.
- **No broken references, no orphaned techniques/resources, no transition-chain breakage.** All three transitions remain valid; targets (`submit-for-review`, `plan-prepare`) unchanged.
- **Routing is correct on all four path combinations** given Option B; the finding-free `condition_not_met` dismissal is airtight (technique sets `review_passed` before the checkpoint, so no plan-prepare re-loop).
- **One additional edit surfaced beyond the design intent:** `activities/README.md` mermaid edge labels (documentation, low risk).
- **`check:variable-model` requires the two new declarations** — already in the design intent; flagged as mandatory to avoid a `setvariable-undeclared` hard-zero failure.
- **Risk level: LOW.** No new critical finding. The design as specified is complete and correct.
