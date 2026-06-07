# Design Philosophy

**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules  
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128) - Adopt a canonical naming convention for technique inputs/outputs and rules  
**Created:** 2026-06-07

---

## Problem Statement

The workflow corpus declares named identifiers for technique **inputs**, **outputs**, and **rules** across many small definition files. A prior round of work (the technique-protocol convention passes — AP-49, AP-50, AP-54, AP-55, AP-58, AP-59) standardized the **case** and **reference syntax** of these symbols: `snake_case` for inputs/outputs, `kebab-case` for names and rules, backtick every code-like token, brace-and-declare-once for protocol variables, dotted-address citation for rules. That work deliberately stopped short of agreeing on how the identifiers should be **grammatically structured**.

The result is that identifiers are stylistically tidy but structurally inconsistent. A boolean may be named `squash_merge_available` in one technique and `is_squash_merge_available` in another; a collection may be singular or plural; a rule slug may be a positive assertion or an arbitrary phrase. Two authors writing analogous definitions still arrive at divergent names, and a reviewer cannot infer a symbol's kind (flag, scalar, collection) from its shape — they must read the surrounding description every time.

This work package settles the missing **naming-structure convention**, writes it into the specification, supplies an audit heuristic so the convention is mechanically checkable, and migrates the existing corpus into conformance.

### System Context

The relevant components, all within the `workflow-server` repository (target path `.`):

| Component | Role | Location |
|-----------|------|----------|
| Technique definition files | Declare `### <input-id>`, `### <output-id>`, `### <rule-name>` | `workflows/**/techniques/*.md`, group/root `TECHNIQUE.md` |
| Anti-patterns catalog | Enumerated authoring defects (currently 59 entries); home of the case/reference conventions | `workflows/workflow-design/resources/anti-patterns.md` |
| Technique-protocol specification | Authoritative spec; §3.2 (Inputs and Output), §3.4 (Rules), §8 (Authoring rules) | `docs/technique-protocol-specification.md` |
| `workflow-design` technique | The authoring/audit technique whose protocol detects non-conforming definitions | `workflows/workflow-design/techniques/workflow-design.md` |

The convention sits **on top of** the already-landed case and reference layer — it governs identifier *grammar* (noun-phrase shape, affirmative predicate prefixes, pluralization, positive-assertion rule slugs), not casing or backticking.

### Impact Assessment

| Aspect | Description |
|--------|-------------|
| Severity | Medium — authoring friction and review back-and-forth; no runtime or correctness defect. Quality/maintainability of the definition corpus. |
| Scope | The technique-definition corpus (inputs, outputs, rules across all workflows), the anti-patterns catalog, the spec, and the `workflow-design` audit technique. No server source (`src/`, `schemas/`) or runtime behavior. |
| Business Impact | If unaddressed: identifier names continue to drift, authoring stays slower and more error-prone, reviews carry avoidable noise, and there is no automated guard against non-conforming ids. The inconsistency compounds as the corpus grows. |

---

## Problem Classification

**Type:** Inventive Goal

**Subtype:**
- [ ] Cause Known (direct fix)
- [ ] Cause Unknown (investigate first)
- [x] Improvement goal
- [ ] Prevention goal

**Complexity:** Moderate

**Rationale:**

This is an **inventive-improvement** problem, not a specific defect. Nothing is broken or failing — the corpus is functional and the case/reference conventions already hold. The work *enhances* the existing convention layer by adding a naming-structure tier, improving predictability, authorability, and auditability. The focus is enhancement/optimization of an existing capability, which is the defining mark of an improvement goal rather than a fix-or-restore problem.

Complexity is **moderate**, not simple or complex:

- It is more than a simple change: the deliverable spans four coordinated artifacts (a new/extended anti-pattern, a spec section, an audit heuristic in the `workflow-design` technique, and a corpus-wide migration), and the convention itself requires definitional judgement (which predicate prefix, when a noun is genuinely a collection, what the canonical rule-slug grammar is, how to avoid representation suffixes per AP-42/AP-57). The migration touches many files and must avoid breaking declare-once/inheritance and existing `{designator}` references.
- It is **not** complex: there are no architectural contradictions, no competing parameters that degrade one another, and no inventive-principle/contradiction-resolution required. The pattern is well-precedented — it directly extends the established AP-42/AP-55 family and is backed by external research already gathered in the issue (Microsoft Framework Design Guidelines, collection pluralization, DDD ubiquitous language, OPA/Rego rule-naming style). The decision space is bounded; the risk is breadth of mechanical edits, not depth of unknowns.

A complexity-signal pass via gitnexus was considered. The GitNexus index covers the repository's **code symbols** (TypeScript `src/`, 7510 nodes), but this work targets **definition files** (TOON/markdown technique declarations and the spec), which are not the symbol graph this index models. There is therefore no meaningful target symbol whose caller fan-out would inform complexity — the objective signal here is the breadth of the corpus migration (many definition files), already accounted for in the moderate rating.

The classification was confirmed by the user at the `classification-confirmed` checkpoint (option `confirmed`).

---

## Workflow Path Decision

**Selected Path:** Research-only — selected by the user at the `workflow-path-selected` checkpoint (option `research-only`).

**Effect applied:** `complexity: moderate`, `needs_elicitation: false`, `needs_research: true`, `skip_optional_activities: false`.

**Recommendation (for the record):** The agent's recommendation was **skip optional activities** — the issue already carries the necessary external research (Framework Design Guidelines, collection pluralization, DDD, OPA/Rego style) gathered in the originating session, the requirements are clear and well-scoped, and the dominant unknowns are codebase-internal (how many ids deviate, where declare-once/inheritance constrains renames), resolvable through comprehension and reconciliation.

**User's selection:** The user chose **research-only** over the recommendation. Research will run to validate and extend the gathered convention against current external naming-guideline sources before the convention is committed — accepting the additional time cost in exchange for lower risk of an under-specified convention (e.g. predicate-prefix choice for non-availability booleans, plural-vs-singular for map/record-shaped values). Elicitation is skipped: requirements are explicit. Comprehension remains mandatory.

**Activities Included (under the selected path):**
- [ ] Requirements Elicitation — skipped; requirements are clear and itemized in the issue (`needs_elicitation = false`)
- [x] Research — runs; the user elected to validate/extend the convention against external sources (`needs_research = true`)
- [x] Codebase Comprehension — mandatory; needed to scope the corpus migration (`needs_comprehension = true`)
- [x] Plan & Prepare

**Rationale:** With research-only, the convention's external grounding is re-validated and any edge rules are surfaced up front, while internal scoping (inventory the deviating identifiers, confirm the migration respects declare-once/inheritance and existing references) proceeds through comprehension. Elicitation is not needed because the deliverables (anti-pattern, spec section, audit heuristic, corpus migration) are explicit in the issue. The path is easily-reversible — research can be deepened or trimmed later without foreclosing the implementation.

---

## Constraints

| Constraint Type | Description |
|-----------------|-------------|
| Time | Agentic implementation 1-4h plus separate human review; the migration breadth dominates. |
| Technical | Must build *on top of* the landed case/reference conventions, not re-litigate them. Renames must preserve declare-once/inheritance (AP-52) and every existing `{designator}` reference in protocols. A producer/consumer (input∩output) value keeps one direction-free noun (AP-55). Representation suffixes such as `_path` are avoided where the noun suffices (AP-42/AP-57). |
| Dependencies | Depends on the already-merged AP-49/50/54/55/58/59 conventions as the substrate. No external system dependencies. |
| Resources | Single-author agentic work package; no cross-team coordination. |
| Boundaries | Do not modify server source (`src/`, `schemas/`) or runtime behavior — this is a definition-corpus and documentation change only. |

---

## Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| Convention defined | Anti-pattern (new AP or extension of AP-42/AP-55) covers boolean affirmative-predicate prefix, collection pluralization, qualified-noun-phrase shape, and rule positive-assertion slug | Present and self-consistent with existing AP family |
| Spec captures convention | A section in `docs/technique-protocol-specification.md` (naturally §3.2 / §3.4 / §8) states the naming-structure convention | Section present and cross-referenced from the anti-pattern |
| Audit heuristic exists | `workflow-design` technique protocol gains a check that flags non-conforming ids (boolean without affirmative prefix, singular collection, direction-encoded I/O, representation-suffixed id, non-assertive rule slug) | Heuristic documented in the technique and mechanically applicable |
| Corpus conforms | Existing input/output/rule identifiers across `workflows/**` migrated to the convention | No remaining non-conforming ids; references and inheritance intact |
| No regressions | `npm run typecheck` and `npm test` pass; workflow definitions still validate | Green |

---

## Design Decisions (preliminary — refined in later activities)

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Where the convention lives in the catalog | (a) New anti-pattern AP-60; (b) extend AP-42 and/or AP-55 | Deferred to planning | Issue permits either; the call depends on whether the naming-structure rules read more naturally as a distinct entry or as extensions to the representation/duplication entries. Reconciliation and planning will settle this. |
| Boolean prefix vocabulary | `is_` / `has_` / `can_` / `should_` | Adopt the affirmative-predicate set (per issue + Framework Design Guidelines) | Directly cited in the issue and external research; affirmative predicates read unambiguously as flags. |
| Migration scope | Whole corpus vs. incrementally on-touch | Whole corpus | Issue lists corpus migration as an explicit deliverable; partial migration leaves the inconsistency the work package exists to remove. |

---

## Notes

- The binding path selection was made by the user at the `workflow-path-selected` checkpoint (option `research-only`); its effects — `complexity: moderate`, `needs_elicitation: false`, `needs_research: true`, `skip_optional_activities: false` — are applied from that checkpoint's option, per the variable-mutation-source rule. The agent's recorded recommendation was skip-optional; the user chose research-only.
- `needs_comprehension` is set `true` here unconditionally — codebase comprehension is mandatory before planning regardless of path.
- The GitNexus index for `workflow-server` is present and fresh (indexed 2026-06-07 at the current HEAD commit `42eba95a`); `gitnexus_indexed` is re-verified as **true**. The caveat is scope, not freshness: the index models code symbols, while this work targets definition files.
- Open questions deferred to comprehension/reconciliation: exact count and location of non-conforming identifiers; whether any deviating id is referenced by a `{designator}` that a rename would have to track; whether to land as AP-60 vs. an AP-42/AP-55 extension.
