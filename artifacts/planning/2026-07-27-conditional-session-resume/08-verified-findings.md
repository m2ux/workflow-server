# Verified Findings — `meta`

**Mode:** update · **Date:** 2026-07-27
**Pass:** verified
**Target:** `meta` v5.9.0

## Findings

| ID | Severity | Finding | Location | Fix |
|----|----------|---------|----------|-----|
| F-1 | Critical (confirmed) | Definedness gate written as a `null` comparison instead of `exists` / `notExists`; on the search-skipped path the gate has no defined outcome and the engine's reference semantics resolve it the harmful way | `activities/00-discover-session.yaml` L53, L85 | Structured `condition` with `operator: exists` on `record-match`, `notExists` on `record-no-match` |
| C-1 | Medium (confirmed) | Activity `description` and `outcome[1]` still assert an unconditional saved-session search | `activities/00-discover-session.yaml` L4, L95 | State the precondition, matching the already-updated READMEs |
| C-2 | Medium (confirmed) | Reference lexicon backlinks its consuming technique and narrates gate/routing | `resources/resume-intent-lexicon.md` L8 | Describe the file by what it is; drop the caller link and routing sentence |
| R-1 | Medium (confirmed) | Activity rule restates the gates, checkpoint condition, and default transition clause for clause | `activities/00-discover-session.yaml` L7 | Delete the rule and the now-empty `rules:` key |
| C-3 | Low | Technique `## Capability` names its consumer and gate | `techniques/workflow-engine/detect-resume-intent.md` L8 | Reduce to the value produced |
| C-4 | Low | Variable `description` carries a consumer/gate tail | `workflow.yaml` L53 | Cut the "— gates the saved-session search…" tail |
| C-5 | Low | Protocol step 2 restates a negative case the cited lexicon owns | `techniques/workflow-engine/detect-resume-intent.md` L25 | Drop the tail; step 1's citation covers it |
| C-6 | Low | Folder-tree comment still describes the scan as unconditional | `README.md` L126 | Qualify the comment |

**Finding count:** 8 — 1 Critical, 3 Medium, 4 Low

Source passes: [expressiveness](08-expressiveness-findings.md) · [conformance](08-conformance-findings.md) · [rule hygiene](08-rule-hygiene-findings.md). The enforcement pass returned 0.

## Resolution

All 8 fixed in the audit fix cycle (1 iteration). Re-audit: expressiveness 0, conformance 0, rule hygiene 0, enforcement 0.

| ID | File edited | Change applied |
|----|-------------|----------------|
| F-1 | `activities/00-discover-session.yaml` | `record-match` / `record-no-match` `when` strings replaced by structured `condition` blocks on `matched_session` with `operator: exists` / `notExists` |
| C-1 | `activities/00-discover-session.yaml` | `description` and `outcome[1]` now state the resume-intent precondition |
| C-2 | `resources/resume-intent-lexicon.md` | Intro reduced to what the file is; caller link and routing sentence removed |
| R-1 | `activities/00-discover-session.yaml` | `rules[0]` and the `rules:` key deleted |
| C-3 | `techniques/workflow-engine/detect-resume-intent.md` | Capability reduced to the value produced |
| C-4 | `workflow.yaml` | `resume_intent_requested.description` gate tail cut |
| C-5 | `techniques/workflow-engine/detect-resume-intent.md` | Protocol step 2 lexicon restatement dropped |
| C-6 | `README.md` | Folder-tree comment qualified with the precondition |

**Post-fix validation.** `validate-workflow-yaml.ts` — 6 files pass, 0 fail, no unanchored protocol references. `check-all-refs.ts` — 0 unresolved. `check-binding-fidelity.ts` — 2 NEW violations, unchanged by the fixes and both already registered as expected in [follow-ups F-1](11-follow-ups.md): `dead-output resume_intent_requested` and `orphan-input user_request` on `detect-resume-intent`.

**No collateral removal.** Every edit is the smallest change the named finding calls for. The only deletion beyond a phrase is R-1's `rules:` key, which the finding names.

## Notes

**F-1 adversarial re-derivation** (Critical treated under the High protocol; construct inspected from the file alone).

- *Refutation attempted 1 — the gate is agent-evaluated, so engine semantics do not literally apply.* `when` is documented as an inline expression the executing agent evaluates; an agent may well read an absent `matched_session` as "no match" and skip `record-match`. **Not fatal to the finding:** the schema documents no semantics for a `null` comparison against an absent variable (its examples are `var == true|false` only), and the single reference implementation in the repo — `src/schema/condition.schema.ts` — resolves the equivalent structured condition as `undefined !== null` → **true**. The gate's outcome on the primary new path is therefore agent-dependent, with the authoritative semantics landing on the harmful branch.
- *Refutation attempted 2 — the consequence may be benign.* It is not. `record-match` sets `has_saved_state: true`, which is precisely the `resume-session` checkpoint's `condition`, and binds `saved_planning_slug` to an unresolvable `{matched_session.planning_slug}`. The result is the resume prompt appearing on exactly the fresh-start requests this change exists to fast-path.
- *Refutation attempted 3 — an upstream guard may set the variable.* None exists. `matched_session` is not declared in `meta/workflow.yaml` `variables[]`, so it is never seeded; it exists only as `match-saved-session`'s output, and that step is gated off with the other two.
- **Verdict: reproduced, held at Critical, with the claim narrowed.** The defect is an undefined gate on the dominant new path, not a guaranteed misfire. `notExists` is specified as `value === undefined || value === null`, so the formal construct closes the ambiguity as well as matching convention.

**Medium spot-confirmations.** C-1 — both L4 and L95 read as unconditional; class correct. C-2 — L8 carries the `detect-resume-intent` link plus the "reaches session initialization directly" routing clause; class correct. R-1 — the rule at L7 is present and each clause maps to declared structure (gates L42/L46/L50, checkpoint condition L63-67, default transition L91-92); class correct.

**Lows carried unverified**, per this pass's scope.
