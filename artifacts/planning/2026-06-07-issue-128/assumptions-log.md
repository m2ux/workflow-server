# Assumptions Log

**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules  
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128) - Adopt a canonical naming convention for technique inputs/outputs and rules  
**Created:** 2026-06-07  
**Last Updated:** 2026-06-07

---

## Summary

| Phase/Task | Assumptions | Confirmed | Corrected | Deferred |
|------------|-------------|-----------|-----------|----------|
| Design Philosophy | 6 | — | 1 | — |
| Research | 6 | — | — | — |
| Implementation Analysis | 6 | — | — | — |
| **Total** | **18** | **—** | **1** | **—** |

> "Confirmed/Corrected/Deferred" track the user-review outcome. **Design Philosophy:** after reconciliation, 5 of the 6 are resolved by code analysis (4 Validated, 1 Partially Validated) and 1 (DP-7, path selection) was resolved by the user at the `workflow-path-selected` checkpoint — the user chose **research-only**, correcting the agent's skip-optional recommendation. **Research:** all 6 research-phase assumptions (R-1…R-6) classify as code-analyzable and were resolved through targeted corpus analysis in reconciliation (6 Validated) — no open stakeholder-dependent assumptions remain, so the research-assumption interview is non-interactive. **Implementation Analysis:** all 6 analysis-phase assumptions (IA-1…IA-6) classify as code-analyzable (they assert facts about the corpus census, baseline counts, deviation populations, and the binding model) and were resolved through targeted corpus analysis in a single reconciliation pass (6 Validated) — no open stakeholder-dependent assumptions remain, so the analysis-assumption interview is non-interactive.

**Reconciliation scorecard:**

```
Design Philosophy      — Total: 6 | Validated: 4 | Invalidated: 0 | Partially Validated: 1 | Resolved-by-user: 1 | Open: 0
Research               — Total: 6 | Validated: 6 | Invalidated: 0 | Partially Validated: 0 | Open: 0
Implementation Analysis — Total: 6 | Validated: 6 | Invalidated: 0 | Partially Validated: 0 | Open: 0
Convergence iterations: 1 (each phase) | Newly surfaced: 0
```

---

# Pre-Implementation Phases

## Design Philosophy

**Date:** 2026-06-07

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| DP-1 | Problem Interpretation | M | The case/reference convention layer (AP-49/50/54/55/58/59) is already landed in the corpus, so this work strictly layers naming-structure *on top* and does not re-open casing/backticking. | Issue states the prior passes "are already landed"; classification as inventive-improvement depends on the substrate existing. |
| DP-2 | Problem Interpretation | M | "Inputs/outputs and rules" are declared as `### <id>` headings in technique definition files (TOON/markdown), not as code symbols in `src/`, so the work targets the definition corpus and docs, not server source. | Issue scope names inputs/outputs/rules and the spec; boundaries exclude `src/`. |
| DP-3 | Complexity Assessment | M | The deliverable spans four coordinated artifacts (anti-pattern, spec section, audit heuristic in `workflow-design`, corpus migration) — more than a simple change but with no architectural contradictions — hence moderate. | Issue's "Deliverable" list enumerates exactly these four; none introduces competing-parameter trade-offs. |
| DP-4 | Complexity Assessment | M | A real corpus of non-conforming identifiers exists to migrate (e.g. booleans without affirmative prefixes), making the migration non-trivial in breadth. | Issue cites `squash_merge_available` as a concrete example; if such ids did not exist the migration would be empty and complexity simple. |
| DP-5 | Workflow Path | M | No further requirements elicitation or fresh external research is needed: requirements are itemized in the issue and the external research is already gathered there. | Issue lists explicit deliverables and a "Research already gathered" section; remaining unknowns are codebase-internal. |
| DP-6 | Workflow Path | L | Codebase comprehension is required before planning regardless of path, to scope the migration and confirm renames preserve declare-once/inheritance and existing references. | `needs_comprehension` is unconditionally set by the activity; the migration's safety depends on knowing the reference graph. |

**Categories:** Problem Interpretation, Complexity Assessment, Workflow Path

---

### Deep-Dive 1: Assumption Reconciliation

**Date:** 2026-06-07  
**Iteration:** 1 (converged)

Reconciliation classified each assumption by resolvability and resolved the code-analyzable ones through targeted analysis of the `workflows/` corpus and `docs/technique-protocol-specification.md`. No comprehension artifact exists yet, so findings are recorded here.

#### DP-1: Case/reference conventions already landed
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** AP-49/50/54/55/58/59 (the case and reference-syntax conventions) are present in the corpus, so naming-structure layers on top.  
**Evidence:** `workflows/workflow-design/resources/anti-patterns.md` contains entries 46 (AP-46), 49–59 inclusive — verified by grep: lines 93 (AP-46/42 cross-ref), 99 (AP-49), 103 (AP-51), 105 (AP-52), 107 (AP-53), 109 (AP-54), 117 (AP-58), 119 (AP-59). AP-50 and AP-55 are walked in `workflows/workflow-design/techniques/workflow-design.md:83,86`. The catalog self-describes as "currently 59 entries across 8 categories" (`workflow-design.md:76`).  
**Risk if wrong:** Would re-open casing/backticking scope; refuted — the substrate is present and stable.

#### DP-2: Identifiers are definition-file headings, not code symbols
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Inputs/outputs/rules are declared as `### <id>` in technique definition files; the work targets definitions + docs, not `src/`.  
**Evidence:** `workflows/work-package/techniques/manage-git/detect-merge-strategy.md:18` declares `### squash_merge_available`; the spec models exactly this shape — `docs/technique-protocol-specification.md` §3.2 (`### <input-id>` / `### <output-id>`) and §3.4 (`### <rule-name>`). No `src/` file participates in identifier declaration.  
**Risk if wrong:** Would mis-scope the migration toward TypeScript; refuted.

#### DP-3: Four-artifact deliverable, no architectural contradictions → moderate
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The deliverable spans an anti-pattern, a spec section, an audit heuristic in `workflow-design`, and a corpus migration; the audit heuristic slots into an existing mechanism.  
**Evidence:** The `workflow-design` technique already performs a per-anti-pattern audit walk — `workflows/workflow-design/techniques/workflow-design.md:76` ("Walk every anti-pattern …") with one bullet per AP (lines 77–93). The new heuristic is an additional bullet of the same shape; the spec has natural homes at §3.2/§3.4/§8 (`docs/technique-protocol-specification.md`). No contradiction or competing-parameter trade-off appears in any of the four artifacts.  
**Risk if wrong:** Would push complexity up if the audit required new machinery; refuted — the extension point exists.

#### DP-4: A real corpus of non-conforming identifiers exists
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Boolean ids lacking affirmative-predicate prefixes (and similar deviations) exist to migrate.  
**Evidence:** `### squash_merge_available` (`detect-merge-strategy.md:18`) and `### worktree_created` (declared in multiple manage-git techniques) are boolean ids with no `is_`/`has_`/`can_`/`should_` prefix. `squash_merge_available` is referenced across `work-package/workflow.toon:296`, `activities/01-start-work-package.toon:87`, and `activities/12-submit-for-review.toon:156` — so a rename must track several `{designator}` references and activity `set`-action targets.  
**Risk if wrong:** Empty migration would make the work simple; refuted — deviations are real and referenced.

#### DP-5: No further elicitation/research needed
**Status:** Partially Validated  
**Resolvability:** Partially code-analyzable; the residual is a stakeholder/judgement matter, see DP-7 below.  
**Assumption:** Requirements are clear in the issue and external research is already gathered, so neither elicitation nor fresh research is needed.  
**Evidence:** The issue body enumerates four explicit deliverables and a "Research already gathered" section (Framework Design Guidelines, collection pluralization, DDD ubiquitous language, OPA/Rego style). Code analysis confirms the *internal* unknowns (deviating-id inventory, reference graph) are codebase-resolvable, not elicitation-dependent (see DP-4). What code analysis cannot settle is whether the gathered research is *sufficient* and whether "skip optional" vs "research-only" is the right path — that is the path-selection judgement reserved for the user at the `workflow-path-selected` checkpoint (DP-7).  
**Risk if wrong:** A path chosen without enough research could under-specify the convention; mitigated by the upcoming user checkpoint.

#### DP-6: Comprehension required before planning
**Status:** Validated  
**Resolvability:** Code-analyzable (a workflow-structure fact)  
**Assumption:** Codebase comprehension is mandatory before planning regardless of path.  
**Evidence:** The `design-philosophy` activity sets `needs_comprehension = true` unconditionally (activity definition, `determine-path` step action). The migration's safety concretely depends on the reference graph established in DP-4 (multiple references per renamed id), confirming comprehension is load-bearing here, not ceremonial.  
**Risk if wrong:** None material — comprehension is mandated by the workflow.

### Open Questions (carried to user review)

#### DP-7: Workflow path selection (resolved — stakeholder judgement)
**Status:** Resolved (user decision at checkpoint)  
**Resolvability:** NOT code-analyzable  
**Assumption (agent's original position):** Skip optional activities — neither further elicitation nor fresh research is needed, because the requirements are itemized in the issue and the external research is already gathered there.  
**Decision space:** (a) Skip optional activities; (b) Research-only (validate/extend the convention against current external naming-guideline sources before committing); (c) Elicitation-only / full workflow (treated as unlikely — requirements are explicit).  
**Trade-off (research-only vs skip-optional):** Research-only spends effort re-validating already-gathered guidance and may surface edge rules (e.g. predicate-prefix choice for non-availability booleans, plural-vs-singular for map/record-shaped values) — lower risk of an under-specified convention, higher time cost. Skip-optional is faster and leans on the issue's existing research, accepting the small risk that a convention edge case is settled during planning rather than up front.  
**Why not code-resolvable:** Whether the gathered research is *sufficient*, and how much up-front rigor the convention warrants, is a stakeholder/judgement call — code analysis cannot decide it.  
**Reversibility:** Easily-reversible — the path is path-gating but low-cost to revisit.  
**Resolution:** The user selected **research-only** at the `workflow-path-selected` checkpoint, overriding the agent's skip-optional recommendation. Research WILL run to validate/extend the convention against external naming-guideline sources before it is committed. Effects applied: `complexity: moderate`, `needs_elicitation: false`, `needs_research: true`, `skip_optional_activities: false`. Elicitation remains skipped (requirements are explicit); comprehension remains mandatory (`needs_comprehension: true`).

---

### User Response

**Review Status:** ✅ Resolved — DP-7 was resolved by the user at the `workflow-path-selected` checkpoint: the user selected **research-only**, correcting the agent's skip-optional recommendation. DP-1 through DP-6 are resolved by code analysis and need no re-confirmation. No open assumptions remain (`has_open_assumptions = false`).

### Outcome

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| DP-1 | Case/reference conventions already landed | ✅ Validated (code) | None — evidence in anti-patterns.md |
| DP-2 | Identifiers are definition-file headings | ✅ Validated (code) | None |
| DP-3 | Four-artifact deliverable, moderate | ✅ Validated (code) | None |
| DP-4 | Real corpus of non-conforming ids exists | ✅ Validated (code) | None |
| DP-5 | No further elicitation/research needed | 🟡 Partially Validated | Residual judgement split out as DP-7 |
| DP-6 | Comprehension required before planning | ✅ Validated (code) | None |
| DP-7 | Skip optional activities (path) | ✏️ Corrected → research-only | User chose research-only at `workflow-path-selected`; `needs_research = true`, `needs_elicitation = false`, `skip_optional_activities = false` |

---

## Research

**Date:** 2026-06-07

Assumptions surfaced during research synthesis (knowledge-base + web research). Categories: Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment. Findings are recorded in [04-kb-research.md](04-kb-research.md).

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| R-1 | Pattern Applicability | M | The boolean convention is "affirmative predicate," **not** "must carry an `is_`/`has_`/`can_`/`should_` prefix"; past-participle result flags (`worktree_created`, `review_passed`, `validation_passed`) are already conformant and must not be mechanically re-prefixed. | Microsoft FDG: prefix is "optional … only where it adds value"; the affirmative-phrase requirement is the hard rule. A copular `is_` before a past participle adds no value. |
| R-2 | Pattern Applicability | M | Collection-vs-map pluralization is decided by **access shape**: iterated-collectively ⇒ plural item noun; addressed-by-key (map/record/lookup) ⇒ singular. | MS FDG (plural collections) + John D. Cook (singular for key-accessed hashes). Shape, not container type, decides. |
| R-3 | Source Relevance | L | The Microsoft FDG page (reprinting 2008 2nd-edition text) is authoritative for the boolean/collection rules despite a newer 3rd edition existing, because those rules are stable and corroborated by 2023–2025 community sources. | The quoted rules are foundational and unchanged across editions; multiple current sources agree. |
| R-4 | Source Relevance | L | The concept-rag knowledge base carries no software identifier-naming-convention content (KB gap), so web sources are the authoritative basis here. | `concept-rag://activities` is a literature/document-corpus RAG; the `identify-best-practices` sub-activity fetch returned *Resource not found*. Research protocol sanctions web-only when the KB lacks relevant content. |
| R-5 | Synthesis Decisions | M | The naming-structure rules **compose with** (do not contradict) the already-landed AP-42/AP-52/AP-55/AP-57 family; the plural-collection rule is the *same* rule as AP-42/57's no-representation-suffix. The AP-60-vs-extension catalog-placement call is deferred to planning. | Every external finding maps onto or reinforces the existing AP family; plural noun *is* the representation marker. Placement is a planning decision, recorded in design philosophy. |
| R-6 | Risk Assessment | M | Reference-integrity risk of renames (declare-once / `{designator}` refs / exact-string binding) is **out of research scope** — it is addressed in comprehension and planning, not here. | The research artifact validates the convention's *grammar*; the migration's safety depends on the reference graph established in comprehension (DP-4/DP-6). |

**Categories:** Pattern Applicability, Source Relevance, Synthesis Decisions, Risk Assessment

---

### Deep-Dive 2: Assumption Reconciliation (Research)

**Date:** 2026-06-07  
**Iteration:** 1 (converged)

Each research-phase assumption was classified by resolvability and the code-analyzable ones resolved through targeted analysis of the `workflows/` corpus, `docs/technique-protocol-specification.md`, and the research artifact's source set. All six classify as code-analyzable (they assert facts about the corpus, the source documents, or the workflow's own structure) and all six resolved to Validated in a single pass. No comprehension artifact was provided to this activity, so findings are recorded here.

#### R-1: Boolean rule is "affirmative predicate," not "must-prefix"
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Past-participle result flags are already conformant; the rule is affirmative-predicate, prefix value-gated.  
**Evidence:** Corpus carries both shapes — affirmative-prefixed (`is_review_mode`, `has_open_assumptions`, `needs_research`) and past-participle result flags (`worktree_created`, `review_passed`, `validation_passed`, the `*_confirmed` cluster) verified live in `workflows/**/*.toon`. Microsoft FDG (fetched verbatim, [04-kb-research.md](04-kb-research.md) Edge case 1): prefix is "optional … only where it adds value"; affirmative phrase is the hard requirement. The audit heuristic must therefore test for *affirmative*, not *prefixed*.  
**Risk if wrong:** Mechanically re-prefixing result flags would harm readability and contradict the canonical guideline; refuted — affirmative-predicate is the correct rule.

#### R-2: Pluralization decided by access shape
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** Iterated collections ⇒ plural; key-accessed maps ⇒ singular.  
**Evidence:** Corpus collection ids are plural item nouns with no representation suffix (`changed_files`, `open_assumptions`, `candidates`) — `workflows/**`. MS FDG (verbatim) mandates plural-phrase collections "instead of … `List` or `Collection`"; John D. Cook mandates singular for key-accessed hashes ([04-kb-research.md](04-kb-research.md) Edge case 2). The two compose; no corpus collection id uses a `_list`/`_array`/`_collection` suffix.  
**Risk if wrong:** Would conflict with AP-42/57; refuted — plural noun *is* the representation marker, same rule.

#### R-3: Microsoft FDG reprint is authoritative
**Status:** Validated  
**Resolvability:** Code-analyzable (source-document fact)  
**Assumption:** The quoted FDG rules are stable across editions and authoritative.  
**Evidence:** The boolean affirmative-phrase and collection-plural rules are reproduced verbatim from the FDG page and corroborated by Dave Warnock, SamanthaMing, John D. Cook, and the DEV grammar-based convention (2013–2025) — [04-kb-research.md](04-kb-research.md) Sources Referenced. Cross-source agreement confirms stability; the edition gap does not affect the cited rules.  
**Risk if wrong:** A superseded rule could mislead; refuted — multiple current sources agree.

#### R-4: KB gap — web sources authoritative
**Status:** Validated  
**Resolvability:** Code-analyzable (tool/resource fact)  
**Assumption:** The concept-rag KB has no identifier-naming content; web sources are the authoritative basis.  
**Evidence:** `concept-rag://activities` indexes literature/document-corpus exploration activities (understand-topic, explore-concept, analyze-document); the `identify-best-practices` sub-activity fetch returned *Resource not found* ([04-kb-research.md](04-kb-research.md) Research Approach). The research-knowledge-base protocol explicitly sanctions web-only with a recorded gap when the KB lacks relevant content.  
**Risk if wrong:** Missing KB guidance would be a coverage gap; refuted and explicitly recorded as a gap, not a silent omission.

#### R-5: Naming-structure rules compose with the AP-42/52/55/57 family
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The new rules reinforce, not contradict, the landed anti-pattern family; placement (AP-60 vs extension) is deferred to planning.  
**Evidence:** `workflows/workflow-design/resources/anti-patterns.md` carries AP-42/52/55/57 (representation suffixes, hoist/one-name, structural direction, path factoring); each research finding maps onto or reinforces one of them ([04-kb-research.md](04-kb-research.md) Synthesis). The plural-collection rule and AP-42's no-representation-suffix are the same rule. Placement is a catalog-organization judgement carried to planning, not a research output.  
**Risk if wrong:** Framing the rule as contradicting AP-42/57 would create a false conflict; refuted — they compose.

#### R-6: Reference-integrity risk is out of research scope
**Status:** Validated  
**Resolvability:** Code-analyzable (scope/workflow-structure fact)  
**Assumption:** Rename-safety (declare-once, `{designator}` refs, exact-string binding) belongs to comprehension/planning, not research.  
**Evidence:** DP-4 already established the reference graph (`squash_merge_available` referenced across `work-package/workflow.toon:296`, `activities/01-start-work-package.toon:87`, `activities/12-submit-for-review.toon:156`); the research artifact's Risks table assigns this risk to "comprehension/plan (not research)" ([04-kb-research.md](04-kb-research.md) Risks). The research activity's output is the validated convention grammar, not the migration mechanics.  
**Risk if wrong:** Treating rename-safety as a research deliverable would mis-scope the activity; refuted — it is a planning concern.

### Open Questions (carried to user review)

None. All six research-phase assumptions classify as code-analyzable and resolved to Validated in a single reconciliation pass. No stakeholder-dependent assumptions surfaced, so `has_open_assumptions` is false for this phase and the research-assumption interview is non-interactive.

---

### User Response (Research)

**Review Status:** ✅ Resolved by code analysis — R-1 through R-6 are all Validated against the corpus and the research source set; none requires user re-confirmation. No open assumptions remain (`has_open_assumptions = false`).

### Outcome (Research)

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| R-1 | Boolean = affirmative predicate, not must-prefix | ✅ Validated (code) | None — both shapes present in corpus; FDG verbatim |
| R-2 | Pluralization by access shape | ✅ Validated (code) | None — corpus collections plural, no suffix |
| R-3 | FDG reprint authoritative | ✅ Validated (code) | None — corroborated across sources |
| R-4 | KB gap; web authoritative | ✅ Validated (code) | None — gap recorded per protocol |
| R-5 | Rules compose with AP-42/52/55/57 | ✅ Validated (code) | None — placement deferred to planning |
| R-6 | Reference-integrity out of research scope | ✅ Validated (code) | None — assigned to comprehension/planning |

---

## Implementation Analysis

**Date:** 2026-06-07

Assumptions surfaced during implementation analysis (corpus conformance census, baseline metrics, gap identification). Categories: Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding. Findings are recorded in [05-implementation-analysis.md](05-implementation-analysis.md).

### Assumptions Surfaced

| ID | Category | Risk | Assumption | Rationale |
|----|----------|------|------------|-----------|
| IA-1 | Baseline Interpretation | M | The genuine boolean *technique-I/O* deviation population (surface 1) is exactly the two ids `squash_merge_available` and `worktree_created`; the other 56 unprefixed booleans are affirmative past-participle result flags that are conformant per R-1 and out of rewrite scope. | The analysis distinguishes "unprefixed" (58) from "non-conforming" and leans on R-1 to exclude result flags; the success-criteria grep-parity targets only the two I/O ids. |
| IA-2 | Baseline Interpretation | M | The 22 negation-shaped rule slugs counted via `grep -rhoE '^### (no-\|not-\|do-not-\|never-)…'` are the deviation candidate set for the rule positive-assertion sub-rule, and the 275 kebab `### ` headings are a superset (includes non-rule headings), not the rule-slug denominator. | The metrics table labels 275 as a "superset" and 22 as "deviation candidates"; the gap table (G4) only commits to migrating an "agreed rule-slug subset," not all 275. |
| IA-3 | Current Behavior | M | There is exactly one live binding defect — `{lens-name}` (kebab) at `prism/activities/01-structural-pass.toon:14,118` failing to bind to the `lens_name` (snake) symbol — and it is the only concrete interpolation failure in the corpus, the rest being authoring-friction (not failure). | The "Concrete binding defects" metric = 1 and the Workarounds section calls it "the one exception"; all other deviations run correctly. |
| IA-4 | Current Behavior | H | Naming-grammar conformance is enforced *only* at audit-time (the `workflow-design` step-8 walk) and never at load/compile/test time — the loader (`TechniqueSchema`, zod) validates structure but not naming grammar, so a botched rename is a silent transition mis-fire, not an error. | The Usage Patterns and "No mechanical guard" rows assert the loader checks structure only; this is the premise behind the G3 gap and the grep-parity verification strategy. |
| IA-5 | Gap Identification | M | The convention's home is most coherently a single new entry AP-60 (next free after AP-59) rather than scattered extensions of AP-42/55; this is the analysis's working position carried from comprehension Q9, with the final placement call deferred to planning. | The "Catalog placement is clean" row and Quick-Win 2 favor AP-60; G1 hedges "(or AP-42/55 extension)" and R-5 defers placement to planning. |
| IA-6 | Dependency Understanding | M | A non-conforming boolean *state-var* rename is reliably a 5–6-file, 3-surface coordinated edit (activity `set`, checkpoint `setVariable`, condition/transition `variable`, protocol reads), and `planning_folder_path` is the single highest-blast-radius rename. | Key Findings cite the 5–6-file blast radius (comprehension Q2) and flag `planning_folder_path` as most-referenced/hoisted; the structural-improvement sequencing depends on this being accurate. |

**Categories:** Current Behavior, Gap Identification, Baseline Interpretation, Dependency Understanding

---

### Deep-Dive 3: Assumption Reconciliation (Implementation Analysis)

**Date:** 2026-06-07  
**Iteration:** 1 (converged)

Each analysis-phase assumption was classified by resolvability and the code-analyzable ones resolved through targeted analysis of the `workflows/` corpus, the loader schemas in `src/`, and the comprehension artifact. All six classify as code-analyzable (they assert facts about census counts, deviation populations, the binding/enforcement model, and the reference graph) and all six resolved to Validated in a single pass. No comprehension artifact was provided as a technique input to this activity, so findings are recorded here.

#### IA-1: Boolean I/O deviation population is exactly two ids
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The genuine boolean technique-I/O deviations (surface 1) are `squash_merge_available` and `worktree_created`; other unprefixed booleans are conformant result flags.  
**Evidence:** `### squash_merge_available` (`manage-git/detect-merge-strategy.md:18`) and `### worktree_created` (declared across the manage-git techniques) are the only `### `-declared boolean I/O ids lacking an affirmative-predicate phrase. The remaining unprefixed booleans in the state-var census (`review_passed`, `validation_passed`, the `*_confirmed` cluster) are affirmative past-participle result flags, conformant per R-1. The success-criteria grep-parity (05-implementation-analysis.md §Corpus-Conformance Targets) targets exactly these I/O ids and the `{lens-name}` defect.  
**Risk if wrong:** Over-counting would inflate the migration and risk mechanically re-prefixing result flags; refuted — the I/O deviation set is the bounded pair, result flags excluded per R-1.

#### IA-2: Rule-slug deviation candidates are the 22 negation-shaped slugs; 275 is a superset
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The 22 negation-shaped slugs are the positive-assertion deviation set; 275 kebab `### ` headings is a superset, not the denominator.  
**Evidence:** `grep -rhoE '^### [a-z][a-z0-9-]+$'` over technique files returns 275 unique kebab headings, which includes protocol-phase and section headings, not only `## Rules` slugs. The negation-prefix filter (`no-`/`not-`/`do-not-`/`never-`) narrows to 22 (`no-cargo-here`, `never-resume`, `do-not-mask-flaky`, …). The gap table G4 commits only to "the agreed rule-slug subset," not the full 275.  
**Risk if wrong:** Treating 275 as the migration target would wildly over-scope; refuted — only the negation/bare-noun subset is a candidate, and that subset is judgement-bounded (Cleanup item).

#### IA-3: Exactly one live binding defect
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** `{lens-name}` vs `lens_name` is the sole concrete interpolation failure; everything else runs correctly.  
**Evidence:** `{lens-name}` (kebab) appears at `prism/activities/01-structural-pass.toon:14,118` while the symbol is declared `lens_name` (snake) at `portfolio-analysis.md:71` and referenced `orchestrate-prism.md:80` — an exact-string mismatch that fails to interpolate (a live AP-55 case defect, comprehension Q10). No other `{kebab-token}`-vs-`snake_symbol` mismatch surfaced in the census. All other deviations are stylistic and bind correctly (the corpus "runs correctly with the non-conforming names").  
**Risk if wrong:** A missed second defect would be an un-migrated silent failure; refuted within the surveyed surfaces — the defect count is 1, isolated to a low-traffic prism path.

#### IA-4: Naming grammar is enforced only at audit-time, never at load/test time
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** The loader validates structure but not naming grammar; the only enforcement is the `workflow-design` step-8 audit walk, so a botched rename is a silent transition mis-fire.  
**Evidence:** `TechniqueSchema` (zod) validates field *structure/shape*, not identifier grammar — no naming-pattern assertion exists in the schema layer. `getVariableValue` resolves state vars by exact-string match (`src/schema/condition.schema.ts:49`) with no normalization/alias layer (comprehension Q1), so a partial rename resolves to `undefined` and silently takes the wrong branch rather than erroring. The step-8 walk in `workflow-design.md` is the sole naming-grammar gate, and it is run manually.  
**Risk if wrong:** If a load/test guard existed, grep-parity would be redundant; refuted — there is no mechanical guard, which is exactly why G3 (audit heuristic) and per-surface grep-parity are load-bearing.

#### IA-5: AP-60 single-entry placement is the working position; final call deferred to planning
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** A single new AP-60 entry is the coherent home; placement is the analysis's working position, decided in planning.  
**Evidence:** `grep -roE 'AP-[0-9]+' anti-patterns.md` confirms AP-59 is the highest entry, so AP-60 is the next free, coherent slot (comprehension Q9). The analysis frames this as the favored option (Quick-Win 2) while G1 and R-5 explicitly hedge "(or AP-42/55 extension)" and defer the catalog-organization judgement to planning — consistent, not contradictory.  
**Risk if wrong:** Committing placement now would pre-empt a planning decision; refuted — the analysis records it as a working position with the decision correctly deferred.

#### IA-6: Boolean state-var rename = 5–6-file, 3-surface edit; `planning_folder_path` highest blast radius
**Status:** Validated  
**Resolvability:** Code-analyzable  
**Assumption:** A boolean state-var rename touches ~5–6 files across 3 binding surfaces; `planning_folder_path` is the highest-reference hoisted rename.  
**Evidence:** The `squash_merge_available` reference graph (DP-4) spans `work-package/workflow.toon:296` (declaration), `activities/01-start-work-package.toon:87` and `activities/12-submit-for-review.toon:156` (`set`/condition references) — confirming a multi-file, multi-surface (declaration + `set`-action + condition/transition) edit, matching comprehension Q2's 5–6-file blast radius. `planning_folder_path` is referenced pervasively (declared once, hoisted, read across nearly every activity's protocol) making it the highest-fan-out id — flagged for most-care/deferral (comprehension rejected-paths lens).  
**Risk if wrong:** Under-estimating blast radius would risk partial renames; refuted — the graph confirms the multi-surface coordination cost, and `planning_folder_path` is correctly identified as highest-risk.

### Open Questions (carried to user review)

None. All six analysis-phase assumptions classify as code-analyzable and resolved to Validated in a single reconciliation pass. No stakeholder-dependent assumptions surfaced, so `has_open_assumptions` is false for this phase and the analysis-assumption interview is non-interactive.

---

### User Response (Implementation Analysis)

**Review Status:** ✅ Resolved by code analysis — IA-1 through IA-6 are all Validated against the corpus census, the loader schemas, and the reference graph; none requires user re-confirmation. No open assumptions remain (`has_open_assumptions = false`).

### Outcome (Implementation Analysis)

| ID | Original Assumption | Outcome | Changes Made |
|----|---------------------|---------|--------------|
| IA-1 | Boolean I/O deviations = exactly 2 ids | ✅ Validated (code) | None — result flags excluded per R-1 |
| IA-2 | 22 negation slugs are candidates; 275 is superset | ✅ Validated (code) | None — subset, not full census |
| IA-3 | Exactly one live binding defect (`{lens-name}`) | ✅ Validated (code) | None — isolated AP-55 case defect |
| IA-4 | Naming grammar enforced only at audit-time | ✅ Validated (code) | None — no loader/test guard; grep-parity primary |
| IA-5 | AP-60 single-entry placement (working position) | ✅ Validated (code) | None — final placement deferred to planning |
| IA-6 | State-var rename = 5–6-file/3-surface; `planning_folder_path` highest | ✅ Validated (code) | None — reference graph confirms blast radius |
