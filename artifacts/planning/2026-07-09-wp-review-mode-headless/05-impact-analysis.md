# 05 — Impact Analysis

**Workflow:** `work-package` (v3.20.0) · **Mode:** Update · **Session:** 573RKC
**Change under analysis:** Make review mode headless *after activation* — 5 auto-advance edits + 2 loop gate-outs. Full working spec in [03-requirements-refinement.md](./03-requirements-refinement.md); assumptions in [assumptions-log.md](./assumptions-log.md).

The blast radius was traced against the live workflow source in the `workflows` submodule and against the server-side test/guard suite. Verdict: **bounded, low-risk, no orphaned references, no schema/engine change.** One committed snapshot record changes (documented below); one guard is confirmed unaffected.

---

## 1. File inventory & impact classification

Target workflow: `workflows/work-package/` — `workflow.yaml`, 15 activity files, technique tree, resources, `README.md`, `REVIEW-MODE.md`.

| File | Impact | Change |
|------|--------|--------|
| `activities/02-design-philosophy.yaml` | **Directly modified** | Add `defaultOption: proceed-with-gaps` + `autoAdvanceMs: 30000` to `ticket-completeness`; version bump |
| `activities/04-research.yaml` | **Directly modified** | Add `defaultOption: accept-research` + `autoAdvanceMs: 30000` to `research-convergence`; add `condition: is_review_mode != true` to the `assumption-interview` `forEach` loop; version bump |
| `activities/05-implementation-analysis.yaml` | **Directly modified** | Add `condition: is_review_mode != true` to the `assumption-interview` `forEach` loop; version bump |
| `activities/10-post-impl-review.yaml` | **Directly modified** | Add `defaultOption: rationale-confirmed` + `autoAdvanceMs: 30000` to `file-index-table`; add `defaultOption: issue-recorded` + `autoAdvanceMs: 30000` to `block-interview`; version bump |
| `activities/12-strategic-review.yaml` | **Directly modified** | Add `defaultOption: {recommended_strategic_option}` + `autoAdvanceMs: 30000` to `review-findings`; version bump |
| `workflow.yaml` | **Directly modified** | Version bump 3.20.0 → next; no variable/fragment/rule change |
| `REVIEW-MODE.md` | **Directly modified (docs)** | Add a "headless after activation" section; note `review-summary-approval` stays interactive |
| `README.md` (workflow root) | **Indirectly affected (docs)** | Update if it enumerates review-mode checkpoint behaviour |
| `activities/01-start-work-package.yaml` | **Unaffected** | `review-mode-detection`, `review-pr-reference`, `jira-project-selection` untouched |
| `activities/13-submit-for-review.yaml` | **Unaffected** | `review-summary-approval` stays interactive — see §5 |
| `activities/07-assumptions-review.yaml` | **Unaffected** | Already gates its own interview `is_review_mode != true`; establishes the precedent the 04/05 gate-outs follow — see §3 |
| All other activity files, technique/resource files | **Unaffected** | No reference touched |
| **`src/` (schema, engine, loaders)** | **Unaffected** | No new construct; `defaultOption`+`autoAdvanceMs` already supported |

Scope is exactly the 6 YAML files + 2 doc files named in the requirements manifest. No file outside that set is touched.

---

## 2. Are the auto-advance defaults the correct "recommended" choice in review mode?

Each default was checked against the option's own effect and the review-mode semantics:

| Checkpoint | Default | Effect of default | Correct in review mode? |
|-----------|---------|-------------------|-------------------------|
| `ticket-completeness` | `proceed-with-gaps` | `ticket_refactor_needed=false, ticket_gaps_documented=true` | ✅ Records gaps as findings, does not block — matches "review records rather than acts" |
| `research-convergence` | `accept-research` | *(no effect)* | ✅ Accept converged research; no state mutated |
| `file-index-table` | `rationale-confirmed` | *(no effect)* | ✅ Confirms rationale, no `has_flagged_blocks` set |
| `block-interview` | `issue-recorded` | *(no effect)* | ✅ Records the finding, demands no input; gated `has_flagged_blocks==true` so only fires if a block was flagged |
| `review-findings` | `{recommended_strategic_option}` → `acceptable`\|`fix-findings` | `review_passed=true` (acceptable) / `needs_strategic_fixes=true` (fix-findings) | ✅ **and the effect is inert in review** — see below |

**`review-findings` is the only default with a stateful effect, and it is benign** because in `strategic-review` the review-mode transition is `to: submit-for-review when is_review_mode == true`, placed FIRST and unconditional on any finding variable. Whatever the default sets (`review_passed`, `needs_strategic_fixes`, `strategic_fixes_selective`), the transition to `submit-for-review` fires regardless. The `recommended_strategic_option` values (`fix-findings`, `acceptable`, per `techniques/strategic-findings-analysis.md`) both map to real option ids, so the template resolves to a valid option at runtime.

**Two of the five defaults are NOT `options[0]`** — worth flagging for the drafter so the `defaultOption` line points at the intended id, not position:
- `ticket-completeness`: `proceed-with-gaps` is the **2nd** option (`refactor-ticket` is 1st).
- `review-findings`: `{recommended_strategic_option}` is a template, not a literal option id.
The other three (`accept-research`, `rationale-confirmed`, `issue-recorded`) happen to be `options[0]`.

---

## 3. Gating the assumption-interview loops — downstream variable side effects

Gating the `forEach` loops in 04 and 05 with `condition: is_review_mode != true` means, in review mode, their bodies (`present-assumption` / ref `assumption-interview` checkpoint / `record-response`) never run. Checked every variable those bodies touch:

- **`has_open_assumptions`, `open_assumptions`** — INPUTS to the loop, computed by the `collect`/`interview`/`reconcile` steps that sit OUTSIDE and BEFORE the loop. Those steps still run in review mode. Nothing downstream of the loop in 04 or 05 re-reads them in a way that needs the interview to have executed. Both activities have a single unconditional `isDefault` transition, so no transition depends on interview output.
- **`assumption_resolved_inline`, `assumption_deferred`, `has_deferred_assumptions`** — set only by the interview checkpoint options. Every downstream READ of `has_deferred_assumptions` lives in `07-assumptions-review.yaml` (L86 jira post, L106 `post-summary-review`, L138 github post) and **every one is already gated `is_review_mode != true`**. So these variables remaining at their defaults (`false`) in review mode is the EXISTING, working behaviour — not a new orphan.
- **Precedent confirmed:** `07-assumptions-review::assumption-decision` (the analogous interview checkpoint) is ALREADY gated `is_review_mode != true` (L38–42). Gating the 04/05 loops is the same pattern applied one activity earlier. No new class of behaviour is introduced.

**Fragment-doubling constraint verified** (RR-3): both interview checkpoints are `ref: assumption-interview`; the fragment in `workflow.yaml` (L33–38) already carries `condition: has_open_assumptions == true`; the resolver forbids a second condition on the ref. Gating the enclosing loop is therefore the only correct site — confirmed against the live fragment definition.

**No side effect. No orphaned variable.**

---

## 4. Test / guard / doc impact

### 4a. `scripts/check-review-mode-gating.ts` guard (`tests/review-mode-gating.test.ts`) — PASSES after edits
This guard flags any review-reachable, non-mode-aware checkpoint that auto-advances to a **consequential** default (a `defaultOption` whose option carries an effect). Analysis of each edit against the guard's three-part test:

- `ticket-completeness` — gated `is_review_mode == true`, so `mentionsReview()` is true → **guard skips it** (mode-aware). Not flagged.
- `research-convergence`, `file-index-table`, `block-interview` — their defaults carry **no effect** → `hasConsequentialDefault()` is false → **not flagged**.
- `review-findings` — the default is the literal string `{recommended_strategic_option}`, which matches no option id, so `hasConsequentialDefault()` returns false statically → **not flagged**. It is additionally already in `scripts/review-mode-gating-baseline.json` (as a benign entry; it is currently a "fixed"/not-present baseline row because it has no `defaultOption` today).

**Empirical:** the guard currently reports `OK — 7 total, 8 baselined, 0 NEW, 1 fixed`. After the edits it will still report **0 NEW** (verified by static reasoning against the guard's exact predicates). No baseline update is required for the guard to pass, though the drafter MAY optionally shrink the baseline by dropping the now-unused `strategic-review::review-findings` row.

### 4b. E2E walk snapshot (`tests/e2e/snapshot.test.ts`) — ONE record changes in `[review-mode]`
The walker's default policy picks `defaultOption` when it matches an option id, else `options[0]` (`tests/e2e/policies.ts` L10–12).

- **`[review-mode]` snapshot:** `ticket-completeness` currently records `option: refactor-ticket` (= options[0], no defaultOption today). After the edit it records `option: proceed-with-gaps`, `setVariable: { ticket_refactor_needed: false, ticket_gaps_documented: true }`. **This one record changes — re-snapshot required.**
- `file-index-table` (review-mode): records `rationale-confirmed` today = the new default → **unchanged**.
- `review-findings` (review-mode + create paths): template default doesn't match an option id → walker falls back to `options[0]` = `acceptable` → **unchanged**.
- `research-convergence`: does not appear in ANY snapshot (checkpoint sits inside a `doWhile` gated `has_reconcilable_research==false`, never reached by the walker) → **no impact**.
- `block-interview`: gated `has_flagged_blocks==true`, not fired in the walk → **no impact**.
- The two gated-out interview loops: their checkpoints do not appear in the `[review-mode]` snapshot (research is skip-optional'd out; implementation-analysis's interview produces no record with empty `open_assumptions`) → **no snapshot impact**.

**⚠️ Pre-existing drift (NOT caused by this change):** the snapshot suite ALREADY fails on the current tree — `[default]`, `[elicitation-only]`, `[full-workflow]`, `[research-only]`, `[skip-optional]` are stale from prior work; 5 obsolete snapshots. `[review-mode]` currently PASSES. The drafter/committer must regenerate baselines (`vitest -u`) as part of this work and should not attribute the pre-existing create-mode failures to these edits. The only NEW review-mode delta from this change is the single `ticket-completeness` record.

### 4c. `REVIEW-MODE.md`
Directly in scope (documented in §1). The "Activity Overrides Summary" table and the flow narrative should gain the headless-after-activation behaviour and the explicit `review-summary-approval`-stays-interactive carve-out. Documentation change, not a wiring change.

### 4d. Other guards
No fragment-resolver, loader, or condition-schema behaviour changes (no fragment, variable, or transition added/removed). `fragment-resolver.test.ts` and `workflow-loader.test.ts` are unaffected.

---

## 5. Transition / condition dependencies on the affected checkpoints — none broken

Traced every transition and condition that could depend on these checkpoints firing or on the variables they set:

- **`ticket-completeness`** → sets `ticket_refactor_needed` / `ticket_gaps_documented`. No transition in `02-design-philosophy` reads them (single `isDefault → codebase-comprehension`). Auto-advancing changes nothing structural.
- **`research-convergence`** → `accept-research` sets nothing; `request-more` sets `has_reconcilable_research=true` (re-enters the loop). Auto-advancing to `accept-research` simply lets the converged loop exit — the intended review-mode behaviour.
- **`file-index-table` / `block-interview`** → gate `has_flagged_blocks` / `has_critical_blocker`. In review mode the defaults never set these, so the `blocker-gate` decision (`has_critical_blocker==true → implement`) stays false and the activity proceeds to `validate` as intended. The default choices deliberately avoid re-routing to `implement` (which is skipped in review mode) — correct.
- **`review-findings`** → covered in §2: the review-mode `to: submit-for-review` transition is unconditional on findings, so the default's effect is inert.

**No transition or condition elsewhere depends on any of these checkpoints firing interactively.**

---

## 6. Content-removal flags (preservation check)

**No workflow content is removed.** Every edit is ADDITIVE: five checkpoints gain `defaultOption`/`autoAdvanceMs` keys (existing options, messages, and effects are untouched); two loops gain a `condition` key. No option is deleted, no message rewritten, no step removed, no variable dropped. The only "removal" is optional and doc/baseline hygiene: the drafter MAY drop the now-unused `strategic-review::review-findings` row from the gating baseline. `review-summary-approval` (13-submit-for-review) is explicitly **preserved unchanged** — the "corrections must persist / single outward-facing gate" item (RR-6) is respected: it retains no `defaultOption`, so it stays interactive and remains the sole review-mode prompt guarding the post-to-PR side effect.

---

## Summary

| Dimension | Verdict |
|-----------|---------|
| Files touched | 6 YAML + 2 docs, exactly as scoped; no `src/` change |
| Auto-advance defaults correct in review mode | Yes for all 5; `review-findings` effect is inert due to unconditional review transition |
| Gate-out side effects on downstream variables | None — mirrors already-gated `07::assumption-decision`; all `has_deferred_assumptions` reads already review-gated |
| Broken transitions / orphaned refs | None |
| Guard (`review-mode-gating`) | Passes, 0 NEW; no baseline change required |
| E2E snapshot | 1 record changes (`ticket-completeness` in `[review-mode]`); re-snapshot needed. ⚠️ create-mode snapshots already stale from prior work — regenerate all |
| `REVIEW-MODE.md` / `README.md` | Must update (in scope) |
| `review-summary-approval` stays interactive (RR-6) | Respected — untouched, no default |
| Content removed | None — all edits additive |

---

## Directives for scope-and-draft (carried forward, confirmed at `impact-confirmed`)

1. **`review-findings` auto-advance is effectively INERT.** The `strategic-review → submit-for-review when is_review_mode == true` transition fires first regardless of any finding variable, so the auto-resolved default's effect never changes the review-mode path. **Still add `defaultOption: {recommended_strategic_option}` + `autoAdvanceMs: 30000`** for correctness and consistency with the other four — but record that it rarely triggers a behaviour change.
2. **`defaultOption` must name the option `id`** — the exact option id string, or the exact template string (`{recommended_strategic_option}`) — **never rely on option position.** Concrete targets: `ticket-completeness` → `proceed-with-gaps` (the 2nd option, not the 1st); `research-convergence` → `accept-research`; `file-index-table` → `rationale-confirmed`; `block-interview` → `issue-recorded`; `review-findings` → `{recommended_strategic_option}`.
3. **All E2E baselines need regeneration at commit time** (`vitest -u` for `tests/e2e/snapshot.test.ts`). This absorbs both the one intended `[review-mode]` `ticket-completeness` delta AND the pre-existing create-mode drift — the create-mode drift is unrelated to this change and must not be attributed to it.
