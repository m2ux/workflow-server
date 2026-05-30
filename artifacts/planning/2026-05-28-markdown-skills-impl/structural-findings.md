# Structural Findings — Markdown Skills Migration (L12)

**Activity:** `post-impl-review` (session `SUQLKL`)
**Date:** 2026-05-29
**Pipeline:** single-pass inline (complexity ≠ complex)
**Target:** all source-side and content-side changes in commits `e2a5988` through `3dbf648` (source) and `f9a673c` through `a8907bc` (content).

## 1. Initial claim (falsifiable)

> **The migration's deepest structural problem is that it ships TWO independent identity systems for skills/resources — folder slug (canonical) and frontmatter `name` (canonical) — but enforces no constraint that they agree. The loader code accepts either as the lookup key, masking divergence as feature, and the only enforcement is in human-written content.**

This claim is falsifiable: it predicts that a content drift between folder slug and frontmatter `name` will load successfully and be silently inconsistent, with no test catching it.

## 2. Adversarial pass — defend, attack, probe

### 2a. Defender

The dual-key resolution is intentional. `findResourceSkillMd` (lines 67-90) and `tryLoadMarkdownSkill` both fall back to frontmatter-`name` match after the slug match fails. This accommodates:
- Renames in flight (slug renamed, frontmatter not yet updated, or vice versa).
- Folder collisions where a slug must be aliased (e.g. `readme` vs the merged `readme-02`).
- The op-as-child-files shape where the SKILL.md `name` may differ from the parent folder name (cargo-operations vs cargo, etc.).
The flexibility is a deliberate carrying capacity for messy content reality.

### 2b. Attacker

The flexibility *is* the problem. Once you accept slug ≠ name as a valid state, every consumer of "the canonical id" must decide which one to trust. `listResources` uses frontmatter-`name` first, falls back to folder-`entry.name`. `parseResourceRef` does no validation — whatever slug is in the ref gets used. `ResourceEntry.id` and `ResourceEntry.name` are stored as separate fields *that are sometimes equal and sometimes not*. The contract is "id is the slug, which is also the frontmatter `name`" — but nothing forces them to coincide, and the `readme-02` artefact already demonstrates the divergence pattern in production. The numbering-deprecation fix removed one signal (numeric prefixes) but planted a new ambiguity: the slug is now expected to *be* the id, but the validation that proves so is human-eyeballs.

### 2c. Probe — what do both take for granted?

Both stances assume the agent (worker, orchestrator, migration script, etc.) is the *consumer* of resource refs. But the new model also makes the agent the *author* of resource refs (inline `[slug](../../resources/slug/SKILL.md)` hyperlinks emitted by the translator). The author-consumer split was previously enforced by the numeric prefix — only the migration script wrote prefixes; only the loader consumed them. Now the same kebab-case slug is the on-disk path, the lookup key, the hyperlink target, and the rendered display text. The category boundary is gone.

## 3. Claim transformation

The transformed claim is **NOT** "the migration ships two identity systems"; it is:

> **The migration removed the category boundary between content-author and content-consumer, replacing it with a single identifier (the slug) that must simultaneously satisfy path-safety, human-readability, hyperlink-stability, and lookup-uniqueness. The loader's flexibility (slug-or-name resolution) is a symptom — it exists because no single identifier choice can satisfy all four constraints, so the implementation defers the conflict to runtime.**

The gap between (1) and (3) is diagnostic: I started looking for "two identifiers that don't agree" and the analysis exposed "one identifier loaded with four roles that conflict."

## 4. Concealment mechanism

The mechanism is **slug-as-coincidence**: the migration encodes a tacit assumption that a single kebab-case string can be the folder name, the frontmatter `name`, the hyperlink target, the lookup key, AND the display label. For most content this holds *by coincidence* — the migration team chose slugs that satisfy all five roles. The implementation hides the *requirement* that they coincide by silently treating them as substitutable.

The concealment surfaces when role conflicts arise:
- `readme-02` (lookup-uniqueness vs human-readability — picked uniqueness).
- The translator's `bodyContainsResourceRef` (`body.includes(slug)`) false-positively matches any word containing the slug as a substring at non-word boundaries (path-safety vs natural-text-stability).
- `parseResourceRef`'s split on the first `/` (cross-workflow form vs slugs that contain `/` — fortunately none do today).

## 5. Engineered "improvement" that deepens concealment

**Improvement-1:** add an `idEquality` invariant test that scans every workflow folder and asserts `folder-name === frontmatter.name`. Run it in CI. This *looks* like it closes the loop.

But it deepens concealment because:
- It enforces the slug=name equation, removing the loader's flexibility — but the loader keeps its flexibility, so production still resolves either, only CI catches divergence. CI becomes the single arbiter of meaning, and the runtime semantics stay underspecified.
- It encodes "kebab-case alphanumeric+hyphen" as the universal contract by fiat. Any future need for a slug that names a thing CI's regex won't accept (e.g. a workflow named "f#" or a slug with a Unicode word like "résumé") triggers a CI failure, not a designed escape valve. The constraint is buried in a regex inside a test, not in a schema.
- It makes the dual-identifier API surface *more* misleading: callers see `ResourceEntry.id` and `ResourceEntry.name` as separate fields but learn from a test that they're never independent. The test legitimises the redundancy.

## 6. Three properties visible only after Improvement-1

1. **Path-safety and lookup-uniqueness are filesystem constraints; human-readability and display-label are presentation constraints. They live at different layers.** The slug is forced to span both layers — there's no projection step.
2. **The translator emits `slug` as the markdown link *text* (`[slug](../../resources/slug/SKILL.md)`).** That conflates the lookup key with reader-facing label. A reader who sees `[gitnexus-reference]` in prose has no semantic context — the kebab-case is naked.
3. **`getResourceDir` retains a `guides/` fallback (assumption A-013).** That's *another* identifier scope (resources-vs-guides as folder name) outside the slug system, kept for backward compatibility. The single-identifier story has at least one hidden seam.

## 7. Apply diagnostic to Improvement-1

What does Improvement-1 conceal? It conceals that **even with slug=name enforced, the slug is still serving four roles**. The test pins the equation but not the *responsibility split*.

The property of the original problem made visible by this recreation is: **the migration needs a presentation layer**. The slug being the link-text in prose, the file-path, and the lookup key simultaneously is the underlying tension; Improvement-1's "force them equal" makes the tension load-bearing.

## 8. Improvement-2 (addressing the recreated property)

**Improvement-2:** introduce a `title:` frontmatter field (separate from `name:` and from the slug), and have the translator emit `[<title>](../../resources/<slug>/SKILL.md)` for in-body hyperlinks. The slug stays as the lookup key; the title is presentation.

Apply the diagnostic: what does Improvement-2 conceal? **It conceals that the link-text choice is context-dependent.** A reference to `gitnexus-reference` from within a debugging skill might want "GitNexus reference guide" as the link text, while the same resource referenced from a checklist might want "GitNexus tools". A single `title:` field forces context-free naming. The conflict is now between *one* canonical title and *N* contextual call sites.

## 9. Structural invariant

The invariant that persists through every improvement is:

> **A single piece of content participates in K consumption contexts (filesystem, lookup, hyperlink-target, hyperlink-text, display label, search), and the migration provides a single identifier surface to address them. The cardinality mismatch (1 identifier vs K contexts) is the structural property.**

Improvements 1 and 2 both add identifiers (Improvement-1 adds a CI-enforced equality, Improvement-2 adds a `title`), reducing the cardinality mismatch but never eliminating it.

## 10. Invert the invariant

Inverted design: **every consumption context gets its own identifier; identifiers are linked by a content-addressed UID.**

- Folder name: filesystem path, kebab-case, mutable.
- Frontmatter `id`: stable UID (e.g. UUID or content-hash), immutable across renames.
- Frontmatter `name`: human-readable canonical name, the default display label.
- Inline `{{resource:<uid>:as <text>}}` template form for hyperlinks — chooses display text per call site, links by UID.

Under this design, the property "slug must equal name must equal link text" is trivially satisfiable: it just doesn't apply. Renames are local to the filesystem; hyperlinks survive moves; display text floats with context.

## 11. New impossibility created by the inversion

**The UID becomes a synchronisation problem.** Every content move must update an index that maps UID → current path. Concurrent edits to different files in the same workflow can both reassign UIDs (collision under naive generation). The migration step itself must generate UIDs for ~170 existing files in a way that survives later renames without re-derivation. The agent authoring prose with `{{resource:<uid>:...}}` must look up UIDs from somewhere — a directory, a tool call, a build-step. The simple "see the file, link to its path" affordance is gone.

## 12. Conservation law (the finding)

> **Identifier cardinality is conserved between problem and solution: K consumption contexts × 1 identifier (current design) ≡ K identifiers × 1 synchronisation point (inverted design). The total amount of cross-context "what-refers-to-what" coupling does not decrease; it changes form. The current design couples *content meaning* (a slug must mean its folder, its title, its lookup); the inverted design couples *content infrastructure* (a UID must mean the same content across moves, edits, and renames, mediated by an index).**

This is the L11 finding.

## 13. Apply the diagnostic to the conservation law

What does the conservation law conceal about *this specific migration*?

It conceals that **the team can choose which kind of coupling to take on**. The conservation law sounds like a "you can't have it all" trade-off, but in this concrete migration, the meaningful question is *which coupling does the agent ecosystem already pay for?* Agents (LLMs and tools) traffic in semantic slugs — `gitnexus-reference` is human-readable, embeddable in plain prose, copy-pasteable. Agents do *not* maintain a UID index. So the current design's coupling (meaning-coupling) is the coupling the agent ecosystem can absorb cheaply, while the inverted design's coupling (infrastructure-coupling) is *not* something the agent ecosystem currently has machinery for.

The conservation law's structural invariant when improving it: **every improvement assumes the consumer environment is fixed.** Improve the schema, improve the indexer, improve the renderer — the consumer agent is treated as a constant.

Invert that invariant: **let the consumer environment vary**. Then the question is not "which coupling do we take on?" but "which coupling does *this consumer* pay for, and how do we deliver content to *each* consumer in its native coupling shape?" That is the meta-law.

## 14. Meta-law (the deeper finding)

> **The migration's content shape is implicitly biased toward one consumer (an LLM agent operating on prose), with adapters for other consumers (the loader, the tools layer) papering over the bias. The deeper finding is not "identifier coupling is conserved" but "the medium-of-delivery picks the coupling form, and the markdown migration ships exactly one medium with no projection." The testable consequence: any non-LLM consumer (a static site generator, an editor with autocomplete, a search index) will need either (a) a parallel index that the migration has not provided, or (b) a runtime parse of every SKILL.md to recover structure that the wire-form TOON used to expose declaratively. The TOON-projection delivery pass that this migration preserves is the strongest evidence — it exists *precisely because* one non-LLM consumer (the existing tool-protocol consumer) cannot eat raw markdown. The migration trades a single declarative shape (TOON) for `markdown + projection`, betting that LLM-agent ergonomics dominate. The bet is correct for the current consumer set but encodes a single-consumer assumption into the on-disk shape.**

Concrete testable consequence: **adding a second non-LLM consumer (e.g. a Confluence-export pipeline, an offline embedding store, an editor with structured autocomplete) will require either a new projection function or a brittle markdown re-parse — there is no neutral intermediate form available on disk anymore.** The first time this requirement lands, the projection inversions will surface as bugs that look local but trace back to this design choice.

## 15. Concrete bugs / edge cases / silent failures

Bugs found by walking the analysis at any stage:

| Location | What breaks | Severity | Predicted as |
|---|---|---|---|
| `workflows/work-package/resources/readme-02/SKILL.md` | Canonical id `readme-02` contains a numeric tail — violates the F1 contract that numeric prefixes are deprecated. | Minor | **Fixable** (rename or delete; not structural). Conservation-law prediction: identifier-cardinality coupling — pick a non-numeric slug. |
| `scripts/migrate-skills/translate.ts:475-482` (`bodyContainsResourceRef`) | `body.includes(slug)` triggers a false positive on substring matches inside larger words (e.g. slug `readme` matches `readme-02` mention in prose). The regex fallback uses `\b` boundaries but `body.includes()` runs first. | Minor | **Fixable** (drop the `includes()` line, rely on the boundary regex). Conservation-law prediction: medium-of-delivery — markdown allows naked slug mentions, the migration didn't quote/escape. |
| `src/loaders/resource-loader.ts:175` (`getResourceEntry`) | Lookup uses `r.id === resourceId \|\| r.name === resourceId`. Under the contract `id===name`, the disjunction is dead code. Confuses callers who expect distinct semantics. | Nit | **Fixable** (collapse the disjunction once the slug=name invariant is enforced). Structural — same identifier serving two roles. |
| `src/loaders/markdown-skill-loader.ts:61-100` (`parseFrontmatter`) | Top-level key shadowing is silent: two `name:` lines at top level → last wins, no warning. Same for nested `metadata.*`. | Nit | **Fixable** (warn or fail on duplicate keys). Not predicted by the conservation law — generic YAML hazard. |
| `src/loaders/markdown-skill-loader.ts:482-541` (`parseOperationFile`) | An op file with no description paragraph between H1 and the first H2 produces `description: ''` silently. The schema may accept empty strings; consumers may receive blank descriptions without notice. | Nit | **Fixable** (warn on empty description). Not predicted. |
| `src/loaders/resource-loader.ts:144-160` (`listResources`) | `localeCompare` sort is locale-dependent — the deterministic-output guarantee that the test suite relies on assumes the default locale. CI runs may differ from contributor laptops. | Informational | **Fixable** (use `localeCompare(b, 'en', { sensitivity: 'base' })` or a code-point sort). Not predicted. |
| `src/tools/resource-tools.ts:54-59` (`parseResourceRef`) | A ref `a/b/c` is split on the first `/`, yielding workflow=`a`, id=`b/c`. No slug today contains `/`, so the dead-letter case never fires — but it would mis-route a hierarchical id silently. | Informational | **Fixable** (validate single-slash). Conservation-law prediction: single-identifier-K-contexts — the ref form is itself an identifier with structure. |
| Translator's `rewriteInBodyReferences` (`scripts/migrate-skills/translate.ts:173-203`) | Pattern 3 (bare `NN-slug.md` rewriter) is overlapping with pattern 2 (`resources/NN-slug.md`). A path-form match for pattern 2 also matches pattern 3 after pattern 2 has rewritten. Idempotency means it lands at a stable fixed point, but the double-pass is not commented. | Informational | **Fixable** (anchor pattern 3 with `(?<!resources/)`). Not predicted. |
| Meta-law consequence | Any second non-LLM consumer (Confluence exporter, embedding store, structured-autocomplete editor) will need a new projection or a markdown re-parse. The wire-form for the existing TOON consumer (`get_skill`) is preserved by `projectSkillToToon`; no neutral declarative shape on disk supports adding more. | Informational | **Structural** — predicted by the meta-law. Not a bug today; will manifest the first time a non-LLM consumer is added. |

## 16. Summary

- **Original claim** (two identity systems disagree) was *under-specified* — the deeper structure is one identifier loaded with four roles.
- **Concealment mechanism**: slug-as-coincidence — kebab-case strings satisfy folder, lookup, link, and label by *picking nice values*, with no enforcement.
- **Conservation law**: identifier cardinality is conserved (K contexts × 1 identifier vs K identifiers × 1 synchronisation point). The migration picks meaning-coupling because the LLM-agent consumer absorbs it cheaply.
- **Meta-law**: the migration is biased toward a single consumer medium (LLM-agent on prose) with adapters elsewhere. The bet is correct for the current consumer set; the first non-LLM consumer added will need a new projection or a brittle re-parse.

**Outcome categorisation:**

- 0 Critical bugs
- 0 Major bugs
- 2 Minor (F-CR-02 readme-02 slug, translator false-positive `includes`)
- 3 Nit (loader dead-code disjunction, frontmatter duplicate-key silence, op-file empty-description silence)
- 3 Informational/structural (locale sort, ref single-slash, meta-law non-LLM-consumer consequence)
