# Canonical Naming Convention for Technique Inputs/Outputs and Rules - Implementation Plan

**Date:** 2026-06-07  
**Priority:** MEDIUM  
**Status:** Ready  
**Estimated Effort:** 2-4h agentic + 1h review

---

## Overview

### Problem Statement

The workflow corpus declares named identifiers for technique **inputs**, **outputs**, and **rules** across many small definition files. A prior round of work standardized their **case** and **reference syntax** (AP-49/50/54/55/57/58/59) but deliberately stopped short of agreeing how identifiers should be **grammatically structured**. The result: identifiers are stylistically tidy but structurally inconsistent — a boolean is `squash_merge_available` in one technique and `is_…`-prefixed elsewhere, a reviewer cannot infer a symbol's kind (flag, scalar, collection) from its shape, and there is no mechanical guard against drift. This work settles the missing naming-structure convention, writes it into the catalog and spec, supplies an audit heuristic so it is mechanically checkable, and migrates the genuinely-deviating identifiers into conformance.

### Scope

**In Scope:**
- A naming-structure convention entry in the anti-patterns catalog (placement — AP-60 vs. AP-42/52/55/57 extension — decided in Proposed Approach below).
- A spec section in `docs/technique-protocol-specification.md` (§3.2 / §3.4 / §8) stating the convention.
- An audit heuristic bullet in the `workflow-design` technique (step 8) — the SOLE mechanical enforcement.
- Corpus migration of the genuinely-deviating identifiers: 2 boolean technique-I/O ids, the `{lens-name}` binding defect, and a judgement-bounded subset of the 22 negation-shaped rule slugs.

**Out of Scope (with reasons):**
- Case / backticking / reference-syntax (already landed; this layers on top — DP-1).
- Server source (`src/`, `schemas/`) and runtime behavior (boundary; definition-corpus + docs only).
- The 56 affirmative past-participle result flags (`worktree_created`, `review_passed`, `validation_passed`, the `*_confirmed` cluster) — conformant per R-1; mechanically re-prefixing them would *harm* readability and contradict the canonical guideline. NOT counted as deviations.
- Enum/mode values (`pipeline_mode`, `analysis_type`) — `_mode`/`_type` are legitimate *kind* suffixes, exempt from the boolean rule (R-3 / edge case 3).
- The 275 kebab `### ` headings as a whole — that is a *superset* (includes protocol-phase/section headings), not the rule-slug denominator (IA-2).
- `planning_folder_path` and other high-fan-out hoisted state-var renames — DEFERRED (see Design Decisions). This plan does not rename them.

---

## Research & Analysis

*See companion planning artifacts for full details:*
- **Knowledge Base & Web Research:** [04-kb-research.md](04-kb-research.md)
- **Implementation Analysis:** [05-implementation-analysis.md](05-implementation-analysis.md)
- **Design Philosophy:** [02-design-philosophy.md](02-design-philosophy.md)
- **Assumptions Log:** [assumptions-log.md](assumptions-log.md)

### Key Findings Summary

**From Research (validated convention grammar):**
- **Booleans = affirmative predicate, prefix value-gated** — NOT "every boolean carries `is_`/`has_`/`can_`/`should_`". Microsoft FDG (verbatim): prefix is "optional … only where it adds value"; the affirmative-phrase is the hard rule. Past-participle result flags are already conformant. The heuristic tests for *affirmative*, not *prefixed* (R-1).
- **Collections plural, maps singular** — shape (not container) decides: iterated-collectively ⇒ plural item noun (no `_list`/`_array`/`_collection` suffix — the *same* rule as AP-42/57); addressed-by-key ⇒ singular (`domain_to_range`) (R-2).
- **Qualified noun phrase, head noun last, one concept = one name** — adjectival/role qualifiers precede the head noun; the rightmost token is the thing the value IS; enforced corpus-wide via the AP-52 hoist/inheritance mechanism (R-5 / edge case 3).
- **Rule slugs = positive declarative assertions** — name the invariant that must hold, not a negation or a process narration; grouped-key + qualifier (AP-26) stays positive (edge case 4).

**From Implementation Analysis (baselines @ HEAD `42eba95a`):**
- **The migration is broad, not deep.** Of 88 unique booleans and 29 arrays, the genuine deviation population is small: **2** boolean technique-I/O ids, **1** binding defect, and a **judgement-bounded subset of 22** negation-shaped rule slugs. The bulk are already conformant — the convention *codifies the dominant shape*.
- **No mechanical guard exists** (G3) — loader (`TechniqueSchema`, zod) validates structure only; `getVariableValue` resolves by exact-string match with no alias layer. A botched rename is a **silent transition mis-fire**, not an error (IA-4). Verification is therefore **per-surface grep-parity**, NOT typecheck/test.
- **Catalog placement** — AP-59 is the highest entry; AP-60 is the next free slot (IA-5). Research found every finding maps onto / reinforces the AP-42/52/55/57 family (R-5).

---

## Proposed Approach

### Solution Design

Land the convention as a **single new anti-pattern entry, AP-60**, that states all four sub-rules (affirmative-predicate boolean, plural-collection / singular-map, qualified-noun-phrase head-noun-last, positive-assertion rule slug) and **explicitly cross-references the AP-42/52/55/57 family** it composes with (so the plural-collection rule is framed as the *same* no-representation-suffix rule as AP-42, not a competing one). Mirror the convention into the spec at the natural homes (§3.2 Inputs/Output, §3.4 Rules, §8 Authoring rules), cross-referenced from AP-60. Add one audit-heuristic bullet to `workflow-design` step 8, of the same shape as the existing AP-55/57/59 bullets, testing for *affirmative* (not prefixed) booleans, singular iterated collections, direction-encoded I/O, representation-suffixed ids, and non-assertive rule slugs. Then migrate only the genuinely-deviating identifiers, each as an independently grep-parity-verifiable unit, sequenced low-blast-radius first.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| **AP-60 single new entry** (cross-referencing AP-42/52/55/57) | One coherent, citable unit; next free slot; clean audit-bullet pairing | Slight duplication of the "no representation suffix" idea already in AP-42 (mitigated by explicit cross-ref) | **Selected** |
| Extend AP-42 and/or AP-55 in place | No new entry number; physically co-locates the composing rules | Scatters four sub-rules across two entries; harder to cite as "the naming-structure convention"; muddies AP-42's tight representation-suffix focus | Rejected |
| Migrate the full 275-heading census | Maximal uniformity | Wildly over-scoped — 275 is a superset incl. non-rule headings; would rewrite conformant ids and risk silent mis-fires | Rejected |
| Mechanically re-prefix all 58 unprefixed booleans to `is_`/`has_` | Superficially uniform | Contradicts the validated rule (R-1); harms readability of result flags; FDG "only where it adds value" | Rejected |
| Rename `planning_folder_path` now | Removes a `_path` representation suffix | Highest blast radius (hoisted, read across nearly every activity); high silent-mis-fire risk for low convention payoff; deferrable | Rejected (deferred) |

### Assumptions

All planning-phase assumptions are recorded and reconciled in [assumptions-log.md](assumptions-log.md) (PL-1…PL-5 below). The approach rests on the already-Validated DP/R/IA assumptions:
- The case/reference substrate is landed; this layers on top (DP-1).
- Identifiers are `### <id>` definition-file headings, not `src/` symbols (DP-2).
- The genuine boolean-I/O deviation set is exactly `squash_merge_available` and `worktree_created`; result flags are conformant and excluded (IA-1 / R-1).
- Naming grammar is enforced only at audit-time; a partial rename silently mis-fires — so per-surface grep-parity is the real guard (IA-4).
- A boolean state-var rename is a 5–6-file, 3-surface coordinated edit; `planning_folder_path` is the highest-blast-radius id (IA-6).

---

## Implementation Tasks

> **Sequencing rationale.** Artifacts that *define* the convention land first (T1→T2→T3) so the migration tasks (T4→T6) have an authority to cite and an audit to satisfy. Migration tasks are ordered **lowest blast radius first**: the isolated 2-occurrence `{lens-name}` fix (T4), then the bounded 2-id boolean-I/O rename (T5), then the judgement-bounded rule-slug pass (T6). High-fan-out state-var renames (`planning_folder_path`) are out of scope (deferred). Each task is independently grep-parity-verifiable.

### Task 1: Add AP-60 naming-structure convention to the anti-patterns catalog (30-45 min)
**Goal:** Write a single new anti-pattern entry AP-60 stating the four sub-rules and cross-referencing the AP-42/52/55/57 family it composes with.
**Deliverables:**
- `workflows/workflow-design/resources/anti-patterns.md` — new AP-60 entry covering: (1) boolean = affirmative predicate (prefix value-gated; past-participle result flags conformant; flag `flag`/`status`/`check`/negated stems); (2) collection = plural item noun / map = singular (no `_list`/`_array`/`_collection`; defers to AP-42); (3) I/O id = qualified noun phrase, head noun last, one-concept-one-name (enum/mode `_mode`/`_type` exempt); (4) rule slug = positive declarative assertion. Include a forward cross-reference to the spec section (T2) and explicit "composes with AP-42/52/55/57" framing.
**Dependencies:** none (first task).
**Verify:** AP-60 present; self-consistent with the AP family; the four sub-rules each match a research finding (R-1, R-2, R-5, edge case 4).

### Task 2: State the convention in the technique-protocol specification (20-30 min)
**Goal:** Mirror the convention into the authoritative spec, cross-referenced from AP-60.
**Deliverables:**
- `docs/technique-protocol-specification.md` — naming-structure guidance added at §3.2 (Inputs/Output: affirmative-predicate boolean, plural-collection/singular-map, qualified-noun-phrase head-noun-last) and §3.4 (Rules: positive-assertion slug), with the cross-cutting statement in §8 (Authoring rules). Cross-reference AP-60.
**Dependencies:** T1 (cross-references AP-60).
**Verify:** Section present at the natural homes; AP-60 ↔ spec cross-references resolve both directions.

### Task 3: Add the naming-grammar audit heuristic to the `workflow-design` technique (20-30 min)
**Goal:** Add the SOLE mechanical enforcement — one step-8 audit bullet of the same shape as the existing AP-55/57/59 bullets.
**Deliverables:**
- `workflows/workflow-design/techniques/workflow-design.md` — a step-8 ("Audit Anti Pattern Scan") bullet that flags: a **non-affirmative** boolean (negated stem, `flag`/`status`/`check`, ambiguous noun) — NOT merely an unprefixed one; a **singular id whose value is an iterated collection** and a representation-suffixed collection; a **direction-encoded I/O** id; a **representation-suffixed** id; a **non-assertive rule slug** (bare negation, process-narration, or names a prohibited state). Note the shape-vs-meaning caveat (G6): a shape-conformant boolean whose meaning inverted still passes a shape check.
**Dependencies:** T1 (audits against AP-60).
**Verify:** Bullet present, same shape as the AP-55/57/59 bullets, tests for *affirmative* not *prefixed* (R-1).

### Task 4: Fix the `{lens-name}` → `{lens_name}` binding defect (5-10 min)
**Goal:** Close the one live binding defect — a worked instance the AP-60 heuristic must catch.
**Deliverables:**
- `workflows/prism/activities/01-structural-pass.toon` — change `{lens-name}` to `{lens_name}` at the 2 occurrences (lines 14, 118) so the token binds to the `lens_name` symbol declared at `prism/techniques/portfolio-analysis.md:71` and referenced `prism/techniques/orchestrate-prism.md:80`.
**Dependencies:** none functionally; sequenced after the defining artifacts so it can cite AP-60.
**Verify (grep-parity):** `{lens-name}` count → 0 in the prism path; `{lens_name}` occurrences now bind to the declared snake symbol; no other `{lens-name}` introduced.

### Task 5: Rename the two boolean technique-I/O ids to affirmative-predicate form (30-45 min)
**Goal:** Migrate `squash_merge_available` and `worktree_created` — the genuine boolean-I/O deviations (surface 1) — to affirmative-predicate names, sweeping every binding site. (`worktree_created` is a past-participle result flag and conformant *as a state var* per R-1; it is in scope here only as a technique **I/O id** if and where its `### ` declaration reads as non-affirmative — confirm against the heuristic before renaming, and treat as no-op if it already reads affirmatively.)
**Deliverables:**
- `workflows/work-package/techniques/manage-git/detect-merge-strategy.md` (and the other `manage-git/*.md` declaring these `### ` ids) — renamed `### ` declaration(s).
- All binding sites swept: `work-package/workflow.toon`, `work-package/activities/01-start-work-package.toon`, `work-package/activities/12-submit-for-review.toon`, `work-package/activities/13-complete.toon` (`set`/`setVariable`/condition/transition/protocol reads), and the `{designator}` reads in protocols. Update `work-package/README.md` / `work-package/activities/README.md` prose references.
**Dependencies:** T1, T3 (renames toward the AP-60 target shape; satisfies the heuristic).
**Verify (grep-parity, per id):** old-name count → 0 across all surfaces; new-name count == captured prior old-name count; target-name non-collision pre-check confirmed; `{old}` token sweep clean for any scalar that is also a template token.

### Task 6: Positive-assertion pass over the judgement-bounded rule-slug subset (30-45 min)
**Goal:** Convert negation-shaped rule slugs to positive declarative assertions **only where the positive form reads at least as clearly** — a judgement-bounded pass, NOT a mechanical 22-for-22 rewrite.
**Deliverables:**
- `workflows/**/techniques/*.md` (and group/root `TECHNIQUE.md`) — for each converted slug: rename the `### <slug>` heading and every dotted-address citation (`[workflow.]technique.rule-name`) and `<group>-*` group-expansion reference. Slugs where the negation carries irreplaceable clarity (e.g. `no-cargo-here`, `do-not-mask-flaky`, `never-resume`) are left as-is with a one-line rationale in this plan's task notes / the assumptions log; the AP-60 entry should acknowledge that a positive form is preferred *where it does not lose clarity*.
**Dependencies:** T1, T3 (targets the AP-60 rule-slug sub-rule; satisfies the heuristic).
**Verify (grep-parity, per converted slug):** old-slug count → 0 (heading + citations + group expansions); new-slug count == captured prior old count; the held-back slugs are explicitly listed so the residual is intentional, not missed.

---

## Success Criteria

*Based on the [design-philosophy success criteria](02-design-philosophy.md#success-criteria) and the [analysis baselines](05-implementation-analysis.md#baseline-metrics).*

### Functional / Convention Requirements
- [ ] **Convention defined (G1):** AP-60 covers all four sub-rules, self-consistent with and cross-referencing AP-42/52/55/57. *Baseline:* absent (top entry AP-59).
- [ ] **Spec captures convention (G2):** §3.2/§3.4/§8 state the convention, cross-referenced from AP-60. *Baseline:* absent.
- [ ] **Audit heuristic exists (G3):** one `workflow-design` step-8 bullet, same shape as AP-55/57/59, testing for *affirmative* not *prefixed*. *Baseline:* 0 naming-grammar bullets.

### Corpus-Conformance Requirements
- [ ] **Binding defect closed (G4):** `{lens-name}` → 0 in the prism path; binds to `lens_name`.
- [ ] **Boolean I/O migrated (G4):** the 2 deviating I/O ids renamed; old-name count → 0 across all surfaces; references/inheritance intact.
- [ ] **Rule slugs migrated (G4):** the agreed positive-assertion subset converted; held-back slugs explicitly listed; old-slug counts → 0 for converted ones.
- [ ] **No silent binding break (G5):** per-surface grep-parity holds for every renamed id (old → 0, new == prior old); `npx tsx scripts/validate-workflow-toon.ts` structure-validates; e2e walker passes the paths it traverses.

### Measurement Strategy
**How we validate (per the analysis's validation strategy):**
- **Per-surface grep-parity** for every renamed id: capture old-name occurrence count pre-migration, assert 0 post-migration, assert new-name count equals the captured old count. Surfaces: technique I/O (`### id` + `{id}` reads), state vars (`workflow.toon variables[]` + activity `set`/`setVariable` + condition/transition `variable` + protocol reads), rule slugs (`### slug` + dotted citations + `<group>-*` expansions).
- **Target-name non-collision pre-check** before each rename.
- **`{token}` sweep** for any renamed scalar id that is also an artifact-name template token.
- Convention/spec/heuristic targets are checked by presence + cross-reference resolution + shape-match against the existing AP family.

---

## Testing Strategy

> This is a definition-corpus + documentation change with **no runtime feature** and **no automated naming-grammar guard**. There are no new unit/integration/e2e tests to author. Validation is mechanical grep-parity per renamed id plus the existing structure validator and e2e walker — see Measurement Strategy and the companion [test plan](test-plan.md). `npm run typecheck` / `npm test` cover `src/` only and will NOT catch a botched TOON rename; grep-parity is the real guard.

### Verification (not new tests)
- **Grep-parity per renamed id** — old → 0, new == prior old, across all binding surfaces (the primary guard).
- **Structure validation** — `npx tsx scripts/validate-workflow-toon.ts` confirms definitions still parse/validate.
- **E2E walker** — exercises the activity paths it traverses (partial guard, per analysis Q5).
- **Regression** — `npm run typecheck` / `npm test` green (covers `src/`, advisory for this corpus change).

---

## Dependencies & Risks

### Requires (Blockers)
- [x] Case/reference substrate landed (AP-49/50/54/55/57/58/59) — confirmed present (DP-1).
- [x] Reference graph and binding model understood — captured in the analysis (IA-4, IA-6).

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Partial rename → silent transition mis-fire (no load/test guard) | HIGH | MEDIUM | Per-surface grep-parity (old → 0, new == prior old) on every rename; `{token}` sweep; non-collision pre-check (G5) |
| Over-scoping the rule-slug pass (mechanical 22-for-22) | MEDIUM | MEDIUM | Judgement-bounded — convert only where the positive form reads at least as clearly; explicitly list held-back slugs (T6) |
| Mechanically re-prefixing conformant result flags | MEDIUM | LOW | Heuristic and migration test for *affirmative* not *prefixed*; result flags out of scope (R-1, IA-1) |
| `planning_folder_path` / high-fan-out renames slipping into scope | MEDIUM | LOW | Explicitly deferred and out of scope; no high-fan-out state-var rename in this plan |
| AP-60 framed as contradicting AP-42/57 | LOW | LOW | AP-60 explicitly states "composes with"; plural-collection framed as the *same* no-representation-suffix rule (R-5) |

---

**Status:** Ready for implementation
