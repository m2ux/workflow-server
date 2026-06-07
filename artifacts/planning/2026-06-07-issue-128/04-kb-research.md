# Knowledge Base & Web Research — Canonical Naming Convention for Technique I/O and Rules

**Date:** 2026-06-07
**Work Package:** Canonical Naming Convention for Technique Inputs/Outputs and Rules
**Issue:** [#128](https://github.com/m2ux/workflow-server/issues/128)
**Status:** Complete
**Context scope:** web-retrieval (external naming-guideline sources) cross-referenced against the repo-local corpus

---

## Research Goal

The user selected the **research-only** path to *validate and extend* the naming-structure convention against current external sources **before** it is committed — the issue already gathered the source set (Microsoft Framework Design Guidelines, collection pluralization, DDD ubiquitous language, OPA/Rego style), and this activity re-validates them at their current form and resolves the four open edge cases the design philosophy flagged:

1. **Predicate-prefix choice for booleans** — is an `is_`/`has_`/`can_`/`should_` prefix mandatory on every boolean, including non-availability state-completion flags (`worktree_created`, `review_passed`)?
2. **Plural-vs-singular for collection / map-shaped values** — when is plural required, and what about key-accessed map/record values?
3. **Qualified noun-phrase shape** — how qualifiers attach to the head noun, and the one-concept-one-name discipline.
4. **Rule positive-assertion slug grammar** — what shape a rule name (a `kebab-case` dotted-address symbol) should take.

The convention layers **on top of** the already-landed case/reference layer (AP-49/50/54/55/57/58/59). It governs identifier *grammar*, not casing or backticking.

---

## Research Approach

| Activity | Technique / Tool | Results Summary |
|----------|------------------|-----------------|
| identify-best-practices (matched) | concept-rag `concept-rag://activities` index | **KB gap** — the concept-rag knowledge base is a literature/document-corpus RAG (book-style concept exploration: understand-topic, explore-concept, analyze-document). It carries no software identifier-naming-convention content; sub-activity fetch (`identify-best-practices.md`) returned *Resource not found*. Per the research-knowledge-base protocol ("if the knowledge base has no relevant content, rely on web research and note the gap"), findings rest on web sources cross-referenced against the repo corpus. |
| Web research | `WebSearch`, `WebFetch` | Four targeted searches + one authoritative fetch (Microsoft FDG). Each open edge case validated against ≥2 sources. |
| Corpus grounding | repo-local grep of `workflows/**` | Real deviation inventory across all three surfaces (technique I/O ids, workflow-state booleans, rule slugs) — anchors every external finding to a concrete migration target. |

---

## Corpus Grounding — the real deviation inventory

The convention's edge cases were validated against the *actual* identifiers in the corpus, not hypotheticals.

**Boolean-shaped workflow-state variables** (`workflows/**/*.toon`, `set`/`variable:`/`target:`):

| Shape | Examples (live) | Conformance |
|-------|-----------------|-------------|
| Affirmative-predicate prefixed | `is_review_mode`, `is_update_mode`, `has_resolvable_assumptions`, `has_open_assumptions`, `needs_research`, `needs_elicitation`, `has_issues`, `has_failures`, `needs_code_fixes` | Already conformant — reads as a flag on sight |
| State-completion / result (suffix-shaped, **no** prefix) | `worktree_created`, `squash_merge_available`, `elicitation_complete`, `review_passed`, `validation_passed`, `scope_confirmed`, the `*_confirmed` cluster (`rationale_confirmed`, `dimensions_confirmed`, `format_literacy_confirmed`, …), `gitnexus_available`, `ensemble_enabled` | The decision target — these are the booleans the prefix question is about |
| Enum / mode (not boolean) | `pipeline_mode`, `analysis_type`, `analysis_focus`, `is_sec_vuln_mode` | Name the *kind*; must NOT be forced into a boolean prefix |

**Technique I/O ids** (`### <id>`): overwhelmingly snake noun/noun-phrase already (`session_index`, `planning_folder_path`, `changed_files`, `comprehension_artifact`, `target_path`); the open question is collection pluralization (`changed_files` plural ✓ vs. singular collections) and representation suffixes (`_path` per AP-42/57).

**Rule slugs** (`### <rule-name>`, `kebab-case`): two live shapes — **positive-assertion / declarative invariant** (`alternatives-required`, `evidence-required`, `diagrams-required`, `committed-to-parent`, `commit-after-activity`, `apply-effects-immediately`, `foreground-always`) and **grouped-key + qualifier** (`checkpoint-discipline-workers-yield-only`, `attribution-prohibition-no-process-in-comments`, `communication-no-hyperbole`, `file-sensitivity-cicd-approval`).

---

## Findings by Edge Case

### Edge case 1 — Boolean predicate prefix is *value-gated*, not mandatory

**Sources:** [Microsoft Framework Design Guidelines — Names of Type Members](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members) (canonical, fetched verbatim); [Dave Warnock — Boolean Naming Conventions](https://davewarnock.com/tech/boolean-naming-conventions/); [SamanthaMing — Better Boolean Variable Names](https://www.samanthaming.com/tidbits/34-better-boolean-variable-names/).

**Decisive quote (Microsoft FDG, verbatim):**
> "DO name Boolean properties with an **affirmative phrase** (`CanSeek` instead of `CantSeek`). **Optionally**, you can also prefix Boolean properties with `Is`, `Can`, or `Has`, **but only where it adds value**."

**Key insight:** The canonical guideline makes the predicate prefix **optional and value-gated**, and elevates the *affirmative-phrase* requirement above it. The hard requirement is: a boolean reads as an affirmative assertion that is true-when-set. The `is_`/`has_`/`can_`/`should_` prefix is the *normal way* to achieve that for a present-state adjective/possession (`is_review_mode`, `has_open_assumptions`), but it is not mandatory where the name is already an unambiguous affirmative predicate.

**Past-tense state-completion is legitimate.** [Dave Warnock](https://davewarnock.com/tech/boolean-naming-conventions/) and [SamanthaMing](https://www.samanthaming.com/tidbits/34-better-boolean-variable-names/): present tense is the default, but **past-tense affirmative forms are correct "when you're reasoning about the result or state of a procedure"** — `wasSuccessful`, `hasCompleted`. This validates treating `worktree_created`, `review_passed`, `validation_passed` as **affirmative state predicates that are already conformant** (a past-participle stating an accomplished result reads as a flag), rather than mechanically rewriting them to `is_worktree_created`/`is_review_passed` (which reads worse — a copular `is_` in front of a past participle is awkward and adds no value, exactly the case the FDG "only where it adds value" caveat excludes).

**Avoid generic / negative names** (corroborated across all three): never `flag`, `status`, `check` as a boolean; never a negated stem (`CantSeek`, `not_ready`) — the affirmative form avoids double-negative reads at the call site (`if (!isNotReady)`).

**Convention implication:** The boolean rule is **"affirmative predicate"**, not **"must carry an `is_`/`has_`/`can_`/`should_` prefix."** Prefix the present-state adjective/possession/capability/obligation booleans (the `is_`/`has_`/`can_`/`should_` family — and the corpus's established `needs_` for required-action obligation reads as a `should_`-class affirmative); accept a past-participle state-completion predicate (`worktree_created`) as already affirmative. The audit heuristic flags **non-affirmative** booleans (negated stems, `flag`/`status`/`check`, ambiguous nouns that give no clue they are boolean), not the *absence of a prefix on an already-affirmative result flag*.

### Edge case 2 — Collections plural; map/lookup-shaped values singular

**Sources:** [Microsoft FDG](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members); [John D. Cook — Rules for naming collections](https://www.johndcook.com/blog/2013/09/03/naming-collections/); [DEV — A Grammar-Based Naming Convention](https://dev.to/somedood/a-grammar-based-naming-convention-13jf).

**Decisive quote (Microsoft FDG, verbatim):**
> "DO name collection properties with a **plural phrase** describing the items in the collection **instead of using a singular phrase followed by `List` or `Collection`**."

**Key insight:** Two findings, both directly actionable:
1. **Plural for collectively-processed collections** (arrays, lists, sets) — the plural noun *is* the representation marker, so `changed_files`, `open_assumptions`, `candidates` are right and `_list`/`_array`/`_collection` suffixes are wrong. This **dovetails exactly with the already-landed AP-42/AP-57** (no representation suffix): "plural noun, not singular+`List`" is the same rule AP-42 states for `_path`. The naming-structure convention and the representation-suffix anti-pattern reinforce each other here.
2. **Singular for key-accessed map / lookup-table / record values** ([John D. Cook](https://www.johndcook.com/blog/2013/09/03/naming-collections/)): "Because hash entries are typically accessed individually, it makes sense for the hash itself to be named in the singular." A map-shaped value (accessed by key, one entry at a time) is named in the **singular**, optionally with a `domainToRange` shape (`name_to_index`). This answers the user's explicit "plural-vs-singular for map-shaped values" question: **shape, not container, decides** — iterated-collectively ⇒ plural; addressed-by-key ⇒ singular.

**Convention implication:** Collection → plural item noun (no `_list`/`_collection`/`_array` suffix; defers to AP-42/57). Map/record accessed by key → singular noun (the thing one entry is), `domain_to_range` when the key→value relation matters. The audit heuristic flags a singular id whose value is an iterated collection, and a representation-suffixed collection.

### Edge case 3 — Qualified noun-phrase shape & one-concept-one-name

**Sources:** [DDD Practitioners — Ubiquitous Language](https://ddd-practitioners.com/home/glossary/ubiquitous-language/); [UNC Writing Center — Qualifiers](https://writingcenter.unc.edu/tips-and-tools/qualifiers/); Microsoft FDG ("noun, noun phrase, or adjective" + "give a property the same name as its type").

**Key insight:**
- **One concept, one name** (DDD ubiquitous language): a domain concept is referred to by the *same term consistently* throughout — "the concept of `order` should be consistently referred to as `order`, rather than `purchase` or `transaction`." This is the anti-drift core of the convention: the same value must not be `planning_folder` here and `planning_folder_path`/`planning-folder` there (precisely the drift AP-52 already records and hoists). Naming-structure consistency *is* ubiquitous-language discipline applied to the I/O contract.
- **Qualifier order / attachment** ([UNC](https://writingcenter.unc.edu/tips-and-tools/qualifiers/)): a qualifier "bumps up next to the noun with nothing between them" and stacked modifiers follow a stable order. In snake ids this is `qualifier_head-noun` read left-to-right with the **head noun last** — `open_assumptions` (head: `assumptions`, qualifier: `open`), `reference_report`, `target_path`, `comprehension_artifact`. The convention's qualified-noun-phrase shape is: **adjectival/role qualifiers precede the head noun; the rightmost token is the thing the value IS.**
- **Name-the-kind for enum/mode values** (FDG "give a property the same name as its type"): a mode/enum value names its kind — `pipeline_mode`, `analysis_type` are correct *as enums* and must not be coerced into a boolean prefix (resolves the cross-contamination risk between edge case 1 and mode variables).

**Convention implication:** I/O and variable ids are qualified noun phrases with the **head noun last**; qualifiers are adjectival/role words attached directly (no filler). One value = one canonical id corpus-wide (the inheritance/hoist mechanism of AP-52 is the enforcement vehicle). Enum/mode values name the kind (`_mode`/`_type` is a legitimate *kind* suffix, distinct from a representation suffix).

### Edge case 4 — Rule slugs are positive declarative assertions

**Sources:** [OPA Rego Style Guide](https://www.openpolicyagent.org/docs/style-guide); [OPA Policy Language](https://www.openpolicyagent.org/docs/policy-language); [Styra — rego-style-guide](https://github.com/StyraInc/rego-style-guide).

**Key insight:** Rego models **each rule as a declarative assertion of the desired state** — "expressions in the rule … represent assertions about what states *should* exist," and the style guide optimizes for "readability and obviousness." A policy rule names *the state that must hold*, not the procedure to reach it and not the prohibited state. Mapped to our `kebab-case` rule slugs (which are cited by dotted symbol address `[workflow.]technique.rule-name`, AP-50/55), this validates the **positive-assertion slug grammar** already dominant in the corpus: `evidence-required`, `committed-to-parent`, `alternatives-required`, `apply-effects-immediately`, `foreground-always` — each names the invariant that must hold.

**Convention implication:** A rule slug states the invariant affirmatively (`<subject>-<required-state>` / `<imperative-state>`), not a negation or a process narration. The **grouped-key + qualifier** shape (`checkpoint-discipline-workers-yield-only`) remains correct under AP-26 (shared-prefix rules → grouped array under a descriptive key); the qualifier after the group key still reads as a positive assertion of the constrained behaviour. The audit heuristic flags a rule slug that is a bare negation, a process-narration, or names a prohibited state rather than the required one.

---

## Applicable Patterns

| Pattern | Source | How It Applies | Confidence |
|---------|--------|----------------|------------|
| Boolean = affirmative predicate; prefix optional/value-gated | MS FDG (verbatim) | Boolean rule is "affirmative", not "must-prefix"; accept past-participle result flags | HIGH |
| Past-tense affirmative for procedure results | Warnock, SamanthaMing | `worktree_created`/`review_passed` conformant as-is | HIGH |
| Collection → plural item noun, no `List`/`Collection` suffix | MS FDG (verbatim) | Reinforces AP-42/57; plural is the representation marker | HIGH |
| Map/lookup value → singular (`domain_to_range`) | John D. Cook | Shape-not-container decides pluralization | MEDIUM-HIGH |
| One concept = one name (ubiquitous language) | DDD Practitioners | Anti-drift core; enforced via AP-52 hoist/inheritance | HIGH |
| Qualified noun phrase, head noun last, qualifiers attached | UNC, MS FDG | I/O id grammar; `_mode`/`_type` is a legitimate kind suffix | MEDIUM-HIGH |
| Rule slug = positive declarative assertion | OPA/Rego style guide | Validates positive-assertion slug grammar; grouped-key qualifier stays positive | HIGH |

---

## Synthesis — convention shape, validated and extended

The external sources **confirm** the issue's gathered direction and **sharpen** it on the four open edges:

1. **Boolean rule is "affirmative predicate," prefix value-gated** — *not* "every boolean carries `is_`/`has_`/`can_`/`should_`." Prefix the present-state adjective/possession/capability/obligation booleans (where it adds value); accept a past-participle result flag (`worktree_created`) as already affirmative. This is a meaningful refinement of the design-philosophy's "adopt the affirmative-predicate set" decision — the prefix is the *common case*, not the *universal requirement*, and forcing it onto result flags would harm readability against the canonical guideline.
2. **Collections plural, maps singular** — shape decides; the plural-collection rule is the *same rule* as AP-42/57's no-representation-suffix, so the two layers compose rather than conflict.
3. **Qualified noun phrase, head noun last, one-concept-one-name** — enforced corpus-wide via the existing AP-52 hoist/inheritance mechanism; `_mode`/`_type` kind suffixes are legitimate and distinct from representation suffixes.
4. **Rule slugs are positive declarative assertions** — codifies the dominant corpus shape; grouped-key + qualifier (AP-26) remains the form for shared-prefix rules.

**Catalog-placement signal (carried to planning, not decided here):** every external finding maps onto, or directly reinforces, the existing AP-42/AP-52/AP-55/AP-57 family (representation suffixes, hoist/one-name, structural direction, path factoring). The naming-structure rules read naturally as **extensions of that family** rather than a free-standing new entry — but the AP-60-vs-extension call remains the planning decision recorded in design philosophy.

---

## Risks & Anti-Patterns to Avoid

| Risk / Anti-Pattern | Source | Mitigation |
|---------------------|--------|------------|
| Over-prefixing — mechanically rewriting result flags to `is_<past-participle>` | MS FDG "only where it adds value" | Audit heuristic checks for *affirmative*, not *prefixed*; result flags conformant as-is |
| Coercing enum/mode values into boolean prefixes | MS FDG "same name as type" | `_mode`/`_type` recognised as kind suffixes, exempt from the boolean rule |
| Treating the new rule as *contradicting* AP-42/57 (suffix vs plural) | corpus cross-ref | Frame plural-collection as the *same* no-representation-suffix rule; they compose |
| Renames breaking exact-string binding / declare-once / `{designator}` refs | AP-52, AP-55, spec §3.2 | Migration tracks every reference; covered in comprehension/plan (not research) |
| Generic boolean names (`flag`, `status`, `check`) slipping through | Warnock, SamanthaMing | Heuristic flags ambiguous-noun booleans |
| KB-source absence misread as "no guidance" | research protocol | Web sources are authoritative here; KB gap explicitly recorded |

---

## Sources Referenced

| Source | URL | Relevance |
|--------|-----|-----------|
| Microsoft Framework Design Guidelines — Names of Type Members | https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/names-of-type-members | Canonical; verbatim boolean affirmative-phrase + collection-plural rules |
| Dave Warnock — Boolean Naming Conventions | https://davewarnock.com/tech/boolean-naming-conventions/ | Past-tense affirmative for procedure-result state |
| SamanthaMing — Better Boolean Variable Names | https://www.samanthaming.com/tidbits/34-better-boolean-variable-names/ | Avoid generic `flag`/`status`/`check`; affirmative forms |
| John D. Cook — Rules for naming collections | https://www.johndcook.com/blog/2013/09/03/naming-collections/ | Plural collections, singular maps, `domainToRange` |
| DEV — A Grammar-Based Naming Convention | https://dev.to/somedood/a-grammar-based-naming-convention-13jf | Grammar-based plural/singular collection rules |
| DDD Practitioners — Ubiquitous Language | https://ddd-practitioners.com/home/glossary/ubiquitous-language/ | One concept = one name (anti-drift) |
| UNC Writing Center — Qualifiers | https://writingcenter.unc.edu/tips-and-tools/qualifiers/ | Qualifier attachment / ordering for noun phrases |
| OPA Rego Style Guide | https://www.openpolicyagent.org/docs/style-guide | Rule-as-declarative-assertion; positive-assertion slug grammar |
| OPA Policy Language | https://www.openpolicyagent.org/docs/policy-language | Rules express desired state ("what should exist") |

> **Source freshness:** the Microsoft FDG page reprints the 2008 2nd-edition text (a 3rd edition exists); the boolean/collection rules quoted are stable, foundational, and unchanged across editions and corroborated by the 2023–2025 community sources above. The OPA/Rego and DDD sources are current.

**Status:** Ready for plan-prepare activity.
