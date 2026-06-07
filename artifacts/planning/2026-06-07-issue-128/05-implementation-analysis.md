# Implementation Analysis — Canonical Naming Convention for Technique Inputs/Outputs and Rules

**Date:** 2026-06-07
**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)
**PR:** [#129](https://github.com/m2ux/workflow-server/pull/129)
**Status:** Complete
**Baseline commit:** `reference_path` HEAD `42eba95a` (workflows worktree `11790139`)

> **Nature of this analysis.** This work package adds a *convention* (a naming-structure tier) and migrates a definition corpus into conformance. There is no runtime feature to profile; the "implementation" under analysis is the **current conformance state of the corpus** plus the **three extension points** the convention's artifacts plug into (anti-patterns catalog, spec, `workflow-design` audit). Baselines are therefore *conformance counts and deviation populations* measured by grep, not latency/throughput — these are the metrics the migration's success is validated against. The architecture/binding model is established in the [comprehension artifact](../../comprehension/identifier-naming-convention.md); this analysis quantifies the *current state* against the [success criteria](02-design-philosophy.md#success-criteria) and does not re-survey it.

---

## Implementation Review

### Existing Location

The convention and its migration target four coupled surfaces. The first three are *artifact* surfaces (where the convention is written/enforced); the last three rows are the *corpus* surfaces (where identifiers are migrated).

| Component | Path | Role in this WP |
|-----------|------|-----------------|
| Anti-patterns catalog | `workflows/workflow-design/resources/anti-patterns.md` | Home of the convention — new AP-60 (or AP-42/55 extension). Highest entry today is **AP-59**. |
| Spec | `docs/technique-protocol-specification.md` | §3.2 (Inputs/Output), §3.4 (Rules), §8 (Authoring rules) — where the convention is stated authoritatively. |
| Audit technique | `workflows/workflow-design/techniques/workflow-design.md` | Step 8 "Audit Anti Pattern Scan" (line 74) — one bullet per AP (AP-55 at line 83, AP-57 at line 85, AP-59 at line 80). The new heuristic is one more bullet of the same shape. |
| Technique I/O ids (corpus surface 1) | `workflows/**/techniques/*.md` — `### <id>` under `## Inputs`/`## Output` | Migrated to convention; bound by `{designator}` reads in protocols (inheritance §5). |
| Workflow-state variables (corpus surface 2) | `workflows/**/workflow.toon` `variables[]` | Migrated; bound by exact-string match across activity `set`, checkpoint `setVariable`, condition/transition `variable`, and protocol reads. |
| Rule names (corpus surface 3) | `### <rule-name>` under `## Rules` | Migrated; cited by dotted address (AP-50) / group-expansion. |

### Usage Patterns

The convention is **authoring-time + audit-time**, never runtime. The loader (`TechniqueSchema`, zod) validates *structure*, never *naming grammar*. Conformance is enforced only when the `workflow-design` audit walk (step 8) is run by an agent/human — there is no compile-time or load-time guard (comprehension Design Rationale). This is load-bearing for the migration: a botched rename produces a **silent transition mis-fire**, not an error.

### Dependencies

**Depends on:** the already-landed case/reference tier — AP-49/50/54/55/57/58/59 (confirmed present, DP-1). The naming-structure tier sits strictly on top and governs *id grammar*, not casing/backticking/reference syntax.

**Depended on by:** every author of a future technique/workflow definition (predictability of id shape); the migration's reference-integrity depends on the exact-string-match binding (`getVariableValue`, `src/schema/condition.schema.ts:49` — no normalization/alias layer, Q1).

### Architecture

A **layered convention stack** (comprehension Design Patterns): Tier 1 case → Tier 2 representation → Tier 3 reference syntax → **Tier 4 (this WP) naming structure**. The four sub-rules of Tier 4: affirmative-predicate boolean, plural collection / singular map, qualified-noun-phrase (head-noun-last), positive-assertion rule slug — validated and refined in [research](04-kb-research.md).

**Known technical debt (the migration target):** identifier-grammar drift — the same value shape named inconsistently (`squash_merge_available` vs `is_…`), plus one concrete binding defect (`{lens-name}` kebab token vs `lens_name` snake symbol).

---

## Effectiveness Evaluation

### What's Working Well ✅

| Capability | Evidence | Confidence |
|------------|----------|------------|
| Case/reference tier (substrate) holds | AP-49–59 present in `anti-patterns.md`; all symbols snake, all names kebab (DP-1, AP-55 audit bullet at `workflow-design.md:83`) | HIGH |
| Collections are largely already plural | Of 29 `type: array` declarations, the dominant set is plural item nouns — `open_assumptions`, `work_packages`, `analysis_units`, `selected_lenses`, `package_plans`, `completed_packages`, `audit_scopes` — no `_list`/`_array`/`_collection` suffix anywhere | HIGH |
| Booleans are largely already affirmative | 30 of 88 unique boolean names carry an `is_`/`has_`/`can_`/`should_`/`needs_` prefix; most of the remaining 58 are affirmative past-participle result flags (`worktree_created`, `review_passed`, `validation_passed`) which research confirmed are conformant as-is (R-1) | HIGH |
| Audit extension point exists and is uniform | Step 8 of `workflow-design.md` is a flat per-AP bullet list; adding AP-60's heuristic is additive, no new machinery (DP-3) | HIGH |
| Catalog placement is clean | Highest existing entry is AP-59; AP-60 is the next free, coherent slot (comprehension Q9) | HIGH |

### What's Not Working ❌

| Issue | Evidence | Impact |
|-------|----------|--------|
| Boolean id grammar drifts | Two analogous values named with/without prefix across techniques (`squash_merge_available` vs the `is_`-prefixed family); reviewer cannot infer "this is a flag" from shape | MEDIUM |
| Rule-slug grammar is heterogeneous | 22 negation-shaped rule slugs (`no-cargo-here`, `never-resume`, `do-not-mask-flaky`, …) plus bare-noun-phrase slugs vs the positive-assertion ideal (`evidence-required`, `index-freshness-first`) | MEDIUM |
| One concrete binding defect | `{lens-name}` (kebab) at `prism/activities/01-structural-pass.toon:14,118` does not bind to the `lens_name` (snake) symbol declared at `portfolio-analysis.md:71` / referenced `orchestrate-prism.md:80` — a live AP-55 case defect (Q10) | LOW (isolated) but real |
| No mechanical guard for naming grammar | Loader validates structure only; nothing flags a non-conforming id until the audit is manually run — convention will decay invisibly without the heuristic (comprehension pedagogy/rejected-paths lenses) | MEDIUM |

### Workarounds in Place

None. The corpus runs correctly with the non-conforming names — the cost is authoring friction and review noise, not failure. (The `{lens-name}` defect is the one exception: it silently fails to interpolate the symbol, but in a low-traffic prism artifact path.)

---

## Baseline Metrics

All measured at `reference_path` HEAD `42eba95a`. Methods are reproducible grep/find invocations against `workflows/`.

| Metric | Current Value | Measurement Method | Date |
|--------|--------------|-------------------|------|
| Technique `.md` files | 206 | `find workflows -path '*/techniques/*.md' \| wc -l` | 2026-06-07 |
| `.toon` files (workflow + activity) | 103 | `find workflows -name '*.toon' \| wc -l` | 2026-06-07 |
| Boolean state-var declarations (`type: boolean`) | 112 | `grep -rh 'type: boolean' workflows --include='*.toon' \| wc -l` | 2026-06-07 |
| Unique boolean variable names | 88 | dedupe of `name:` lines preceding `type: boolean` | 2026-06-07 |
| — of which prefix-conformant (`is_/has_/can_/should_/needs_`) | 30 | grep filter on the unique set | 2026-06-07 |
| — of which unprefixed | 58 | unique set minus prefixed (mostly affirmative result flags, conformant per R-1) | 2026-06-07 |
| Array state-var declarations (`type: array`) | 29 | `grep -rh 'type: array' workflows --include='*.toon' \| wc -l` | 2026-06-07 |
| Boolean *technique-I/O* ids deviating (surface 1) | 2 | `### squash_merge_available`, `### worktree_created` in `manage-git/*.md` | 2026-06-07 |
| Singular-shaped `type: array` candidates | 4 | `dimension_plan`, `priority_order`, `scope_manifest`, `prism_name` (composite-vs-collection judgement) | 2026-06-07 |
| Techniques carrying `## Rules` | 74 | `grep -rl '## Rules' workflows --include='*.md' \| wc -l` | 2026-06-07 |
| Unique kebab `### ` rule-slug headings | 275 | `grep -rhoE '^### [a-z][a-z0-9-]+$' … \| sort -u \| wc -l` (superset; includes non-rule kebab headings) | 2026-06-07 |
| Negation-shaped rule slugs (deviation candidates) | 22 | `grep -rhoE '^### (no-\|not-\|do-not-\|never-)…' \| sort -u \| wc -l` | 2026-06-07 |
| Concrete binding defects | 1 | `{lens-name}` kebab token vs `lens_name` snake symbol (2 occurrences) | 2026-06-07 |
| Highest existing anti-pattern entry | AP-59 | `grep -roE 'AP-[0-9]+' anti-patterns.md \| sort -t- -k2 -n \| tail` | 2026-06-07 |

### Key Findings

- **The migration is broad, not deep.** ~300–450 id declarations across three surfaces (issue's "~457"), but the *genuine deviation* population is far smaller than the raw count: only **2** boolean technique-I/O deviations, ~22 rule-slug candidates, ~4 singular-array judgement cases, and 1 binding defect. The bulk of the 88 booleans and 29 arrays are **already conformant** — the convention codifies the dominant shape, it does not overturn it.
- **The boolean state-var layer is the highest blast-radius population**, not technique I/O: each non-conforming boolean rename is a reliably 5–6-file, 3-surface coordinated edit (Q2). But the *count* of true deviations there is moderated by R-1 — past-participle result flags are conformant, so the migration must not mechanically re-prefix them.
- **`planning_folder_path` is the single highest-risk rename** (most-referenced id, hoisted, `_path`-suffixed) — flagged for most-care or deferral (comprehension rejected-paths lens).
- **No runtime/test guard exists** for naming grammar — verification is mechanical per-surface grep-parity (old→0, new==old) plus the partial e2e-walker guard (Q5). The audit heuristic is the *sole* ongoing enforcement.

---

## Gap Analysis

| ID | Gap | Current State | Desired State | Impact | Priority |
|----|-----|---------------|---------------|--------|----------|
| G1 | Naming-structure convention not written down | Tier 4 unwritten; AP-59 is the top entry | AP-60 (or AP-42/55 extension) covers all four sub-rules, self-consistent with the AP family | Authoring drift continues | HIGH |
| G2 | Spec silent on id grammar | §3.2/§3.4/§8 cover case/reference, not grammar | A spec section states the naming-structure convention, cross-referenced from the anti-pattern | No authoritative source for the rule | HIGH |
| G3 | No mechanical audit for naming grammar | Loader checks structure only; step-8 walk has no naming-grammar bullet | A `workflow-design` step-8 bullet flags non-affirmative booleans, singular collections, direction-encoded I/O, representation-suffixed ids, non-assertive rule slugs | Convention unenforceable, decays invisibly | HIGH |
| G4 | Corpus has non-conforming ids | 2 boolean I/O deviations, ~22 negation rule slugs, ~4 singular-array judgement cases, 1 `{lens-name}` binding defect | All migrated; references/inheritance intact; old-name grep count → 0 | Review noise; one live binding defect | HIGH |
| G5 | Renames are exact-string-fragile | No normalization/alias layer; partial rename = silent wrong-branch | Each rename swept across all binding sites; grep-parity verified | Silent transition mis-fire if missed | MEDIUM |
| G6 | Audit must catch shape-vs-meaning drift, not just shape | A shape-conformant boolean whose meaning inverted (`needs_cleanup` true when done) passes a shape check | Heuristic guidance notes shape-conformant ≠ semantically-correct | Slowest-discovered defect class (pedagogy lens) | LOW |

---

## Opportunities for Improvement

### Quick Wins (Low Effort, High Impact)
1. **Fold the `{lens-name}` → `{lens_name}` defect into the migration.** A 2-line case fix that doubles as a worked instance the audit heuristic must catch. Expected impact: closes one live binding defect. Effort: minutes.
2. **Adopt AP-60 as the home.** Code analysis favors a single coherent new entry over scattering extensions across AP-42/55 (Q9). Expected impact: clean, citable unit. Effort: one catalog entry + cross-ref.

### Structural Improvements (Higher Effort)
1. **Sequence the boolean state-var migration by blast radius**, treating `planning_folder_path` and other high-reference hoisted ids with the most care (or deferring them if scope allows). Expected impact: lowest residual-defect risk on the highest-cost renames.
2. **Author the audit heuristic to test for *affirmative*, not *prefixed*** (R-1) — so result flags aren't mechanically re-prefixed — and to flag negation/bare-noun rule slugs. Expected impact: precise enforcement that matches the validated convention.

### Cleanup
1. **Rule-slug positive-assertion pass over the 22 negation-shaped slugs** — judgement-bounded (`no-cargo-here` → ? risks losing clarity); push only where the positive form reads at least as clearly.

---

## Success Criteria (with measurement methodology)

Mapped to the [design-philosophy success criteria](02-design-philosophy.md#success-criteria), now with baseline-anchored measurement.

### Functional / Convention Targets
- [ ] **Convention defined (addresses G1):** AP-60 (or AP-42/55 extension) covers boolean affirmative-predicate, collection plural / map singular, qualified-noun-phrase head-noun-last, rule positive-assertion. *Measure:* entry present, self-consistent with AP-42/52/55/57; cross-referenced from spec. Baseline: absent (top entry AP-59).
- [ ] **Spec captures convention (addresses G2):** a section in `docs/technique-protocol-specification.md` (§3.2/§3.4/§8) states the convention. *Measure:* section present, cross-referenced from the anti-pattern. Baseline: absent.
- [ ] **Audit heuristic exists (addresses G3):** `workflow-design.md` step 8 gains a bullet flagging non-affirmative booleans, singular collections, direction-encoded I/O, representation-suffixed ids, non-assertive rule slugs. *Measure:* bullet present and mechanically applicable (same shape as AP-55/57/59 bullets). Baseline: 0 naming-grammar bullets.

### Corpus-Conformance Targets
- [ ] **Corpus conforms (addresses G4):** non-conforming ids migrated; references/inheritance intact. *Measure (grep-parity, per surface):* for each renamed id, old-name count → **0** and new-name count == prior old-name count. Specific baselines to drive to zero: 2 boolean I/O deviations, the `{lens-name}` defect (2 occurrences), and the agreed rule-slug / singular-array subset. *Note:* affirmative past-participle result flags are **out of scope** for rewrite (R-1) — do not count them as deviations.
- [ ] **No silent binding break (addresses G5):** *Measure:* per-surface grep-parity above + `npx tsx scripts/validate-workflow-toon.ts` (structure) + the e2e walker for paths it traverses. The walker is a partial guard (Q5); grep-parity is primary.

### Regression Targets
- [ ] **No regressions:** `npm run typecheck` and `npm test` green; workflow definitions still validate. *Measure:* CI green. *Caveat:* these cover `src/`, not TOON binding semantics — they will NOT catch a botched rename; grep-parity is the real guard.

### Measurement Strategy (validation)
- **Per-surface grep-parity script** for every renamed id: capture old-name occurrence count pre-migration, assert 0 post-migration, assert new-name count equals the captured old count. Surfaces: technique I/O (`### id` + `{id}` reads), state vars (`workflow.toon variables[]` + activity `set`/`setVariable` + condition/transition `variable` + protocol reads), rule slugs (`### slug` + dotted citations + `<group>-*` expansions).
- **Target-name non-collision pre-check** before each rename (Q4): confirm the prefixed/pluralized target name is not already in use.
- **`{token}` sweep** for any renamed *scalar* id that is also an artifact-name template token — add `{<old>}` to the grep set (Q3).

---

## Sources of Evidence

| Source | Type | What It Showed |
|--------|------|----------------|
| `grep -rh 'type: boolean' workflows` | Corpus census | 112 boolean decls, 88 unique names, 30 prefixed / 58 unprefixed |
| `grep -rh 'type: array' workflows` | Corpus census | 29 array decls; mostly plural; 4 singular-shaped judgement cases |
| `### squash_merge_available` / `### worktree_created` | Technique I/O | 2 boolean I/O deviations (surface 1) |
| `### no-*` / `### never-*` headings | Rule-slug census | 22 negation-shaped slug deviation candidates |
| `prism/activities/01-structural-pass.toon:14,118` | Binding defect | `{lens-name}` kebab vs `lens_name` snake — 1 live defect |
| `anti-patterns.md` (`AP-59` top) + `workflow-design.md:74-85` | Extension points | AP-60 next free; step-8 per-AP bullet list confirmed |
| [comprehension artifact](../../comprehension/identifier-naming-convention.md) | Architecture/binding model | Exact-string binding (Q1), 5–6-file blast radius (Q2), inheritance (Q6), verification gap (Q5) |
| [04-kb-research.md](04-kb-research.md) | Convention grammar | Affirmative-predicate (not must-prefix), plural-collection/singular-map, head-noun-last, positive-assertion slugs |

---

**Status:** Ready for plan-prepare activity.
