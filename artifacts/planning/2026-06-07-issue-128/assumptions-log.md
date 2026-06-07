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
| **Total** | **12** | **—** | **1** | **—** |

> "Confirmed/Corrected/Deferred" track the user-review outcome. **Design Philosophy:** after reconciliation, 5 of the 6 are resolved by code analysis (4 Validated, 1 Partially Validated) and 1 (DP-7, path selection) was resolved by the user at the `workflow-path-selected` checkpoint — the user chose **research-only**, correcting the agent's skip-optional recommendation. **Research:** all 6 research-phase assumptions (R-1…R-6) classify as code-analyzable and were resolved through targeted corpus analysis in reconciliation (6 Validated) — no open stakeholder-dependent assumptions remain, so the research-assumption interview is non-interactive.

**Reconciliation scorecard:**

```
Design Philosophy — Total: 6 | Validated: 4 | Invalidated: 0 | Partially Validated: 1 | Resolved-by-user: 1 | Open: 0
Research          — Total: 6 | Validated: 6 | Invalidated: 0 | Partially Validated: 0 | Open: 0
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
