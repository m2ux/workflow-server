# Resource Section Addressing — Comprehension Artifact

> 2026-07-27 · work packages: [2026-07-27-issue-141](../planning/2026-07-27-issue-141/) (#141 hierarchical path-scoped resource section references + anchor validation) · every corpus measurement below was taken against `workflows` submodule commit **d9b30234** (2026-07-27, clean tree) and is corpus-state-dependent — re-measure after a submodule bump · coverage: the end-to-end path by which a `#section` anchor is authored, projected, discovered, resolved, delivered and validated — `resource-ref.ts`, `rewriteResourceLinks`, `resource-loader.ts`, `resource-delivery.ts`, the `get_resource` tool, the eager-bundle path, and `check-resource-anchors.ts` · related: [utils-layer.md](utils-layer.md) (rest of `src/utils/`, which excludes `resource-ref.ts`), [delivery-ledger.md](delivery-ledger.md) (`resource:<id>` ledger channel), [workflow-server.md](workflow-server.md) (cross-cutting `src/` behaviour), [documentation-system.md](documentation-system.md) (two-layer docs the resolution contract is published in)

## Architecture Overview

### Project Structure

TypeScript / Node ESM MCP server. `npm test` is vitest; `tsc` builds to `dist/`. Five runtime dependencies (`@modelcontextprotocol/sdk`, `express`, `yaml`, `zod`, `zod-to-json-schema`) — no `github-slugger`, no markdown library; every markdown parse in the codebase is hand-rolled regex.

The workflow corpus is a **separate git submodule** (`workflows/`, branch `workflows`), so the code and the content it resolves version independently. Corpus-touching guards accept `--root <path>` / `WORKFLOWS_DIR` via [`scripts/workflows-root.ts`](../../../scripts/workflows-root.ts) precisely because a feature worktree's `workflows/` is usually empty.

Structural invariants are enforced by 14 `check:*` scripts in `scripts/`, each exporting a collector function that a sibling vitest test asserts to be empty ("hard-zero" pattern). Anchor validity is one of them: [`scripts/check-resource-anchors.ts`](../../../scripts/check-resource-anchors.ts) + [`tests/resource-anchors.test.ts`](../../../tests/resource-anchors.test.ts#L12).

### Module Map

Seven numbered participants, in pipeline order. Only the last is a guard; the rest are runtime, and stage 6 has two variants that differ only in how they handle a failed section lookup.

| # | Participant | Responsibility | Depends on |
|---|---|---|---|
| 1 | [`rewriteResourceLinks`](../../../src/loaders/markdown-technique-loader.ts#L226) | **Producer of every agent-facing ref.** At technique load, rewrites authored relative links (`../resources/foo.md#bar`) into `get_resource`-callable ids (`foo#bar`). Only paths containing a `resources/` segment are rewritten. | — (regex over technique body) |
| 2 | [`extractResourceIds`](../../../src/utils/resource-ref.ts#L72) | Scrapes ids back out of *already-rewritten* projected technique text, for eager-bundle discovery. | the projection from (1) |
| 3 | [`parseResourceRef`](../../../src/utils/resource-ref.ts#L8) | Splits a ref into `{workflowId, id, section}`. Splits on `#` **first**, then on the first `/`, then strips `.md`. | — |
| 4 | [`readResourceStructured`](../../../src/loaders/resource-loader.ts#L129) | Loads `workflows/<workflow>/resources/<id>.md`, strips YAML frontmatter, returns `{id, version, content}` where `content` is the **trimmed body**. | (3) |
| 5 | [`extractMarkdownSection`](../../../src/utils/resource-ref.ts#L33) | Resolves the anchor against the body: first heading whose slug matches, down to the next heading of equal-or-higher level. Returns `null` on no match. | (3), (4) |
| 6a | [`get_resource`](../../../src/tools/resource-tools.ts#L757) | Agent-facing lazy fetch. **Throws** when (5) returns `null`. | (3), (4), (5) |
| 6b | [`loadResourceDelivery`](../../../src/utils/resource-delivery.ts#L24) → [eager bundle](../../../src/tools/workflow-tools.ts#L802) | Eager bundling on `get_activity`. Reproduces `get_resource`'s exact `fullText` so the two share `resource:<id>` ledger keys. **Silently skips** on failure ([`continue`](../../../src/tools/workflow-tools.ts#L805)). | (2), (3), (4), (5) |
| 7 | [`check-resource-anchors.ts`](../../../scripts/check-resource-anchors.ts) | CI guard over the corpus: every relative `.md#anchor` link must resolve to a rendered heading. Its own [slugger](../../../scripts/check-resource-anchors.ts#L42) and its own [anchor collector](../../../scripts/check-resource-anchors.ts#L51) with GitHub `-N` dedupe. | nothing in `src/` |

Two additional consumers of `extractResourceIds` exist outside the resolution path: [`workflow-tools.ts#L787`](../../../src/tools/workflow-tools.ts#L787) (the live one) and [`scripts/run-token-benchmark.ts#L345`](../../../scripts/run-token-benchmark.ts#L345) (benchmark harness).

### Design Patterns

**Author-time rewrite, not runtime path resolution.** The corpus is authored as ordinary markdown so a raw file resolves in an editor and on GitHub; the id form agents use is *derived* at load. This dual-resolution property is stated as the rationale at [markdown-technique-loader.ts#L218](../../../src/loaders/markdown-technique-loader.ts#L218) and is the constraint most likely to bind the design of a new anchor syntax.

**Single definition site, two divergent implementations.** `resource-ref.ts` is the sole runtime resolver, but the guard deliberately does not import it — it re-implements slugging so it can model GitHub rendering (including `-N` dedupe) independently. The divergence is not accidental; it is an unreconciled duplication.

**Hand-rolled markdown, naive fence toggle.** Four independent heading parsers exist ([`extractMarkdownSection`](../../../src/utils/resource-ref.ts#L42), [`collectAnchors`](../../../scripts/check-resource-anchors.ts#L51), the guard's [link scanner](../../../scripts/check-resource-anchors.ts#L89), and [`splitSections`](../../../src/loaders/markdown-technique-loader.ts#L125)). The first three track fences with the same boolean toggle on `/^\s*(```|~~~)/`, which is not CommonMark-correct (it ignores fence character, fence length, and info strings, so a nested fence desynchronises it). `splitSections` has **no** fence awareness at all, but is insulated because it matches exact heading titles rather than slugs.

**Reference-not-repeat delivery.** `resource:<resource_id>` ledger keys are keyed on the **ref string** and compared by hash of the delivered `fullText` ([`delivery.ts#L26`](../../../src/utils/delivery.ts#L26)). Unlike `<hash>`-suffixed channels, this key is not content-keyed, so a resolution-semantics change produces a hash mismatch → full re-delivery. See [delivery-ledger.md](delivery-ledger.md).

**Progressive-descent section parsing already exists.** `splitSections(body, 2)` → `splitSections(section.body, 3)` → [`parseEntrySubsections`](../../../src/loaders/markdown-technique-loader.ts#L302) → `splitSections(body, 4)` is the codebase's established idiom for hierarchical markdown navigation: descend one heading level at a time, each segment scoped to the previous segment's body. It is the closest internal precedent for path-scoped anchor resolution.

## Key Abstractions

### Core Types

| Type | Site | Role |
|---|---|---|
| `{ workflowId?, id, section? }` | [resource-ref.ts#L8](../../../src/utils/resource-ref.ts#L8) | Anonymous return of `parseResourceRef` — the ref grammar's only reified form. Not a named exported type, so no schema, no validation, no single place to widen. |
| [`StructuredResource`](../../../src/loaders/resource-loader.ts#L98) | resource-loader.ts | `{id, version, content}`; `content` is post-frontmatter, `.trim()`-ed. |
| [`LoadedResourceDelivery`](../../../src/utils/resource-delivery.ts#L8) | resource-delivery.ts | Carries `resourceId`, `fullText`, `hash` — the contract that keeps eager bundling byte-identical to `get_resource`. |
| [`BrokenAnchor`](../../../scripts/check-resource-anchors.ts#L28) | check-resource-anchors.ts | `{source, link, reason: 'missing-file' \| 'missing-anchor'}` — the guard's only output vocabulary. A *resolves-but-to-the-wrong-heading* outcome is unrepresentable in it. |

### Data Model — the ref grammar, as four disagreeing regexes

The grammar is `[<workflow>/]<id>[#<section>]`, documented in [docs/resource_resolution_model.md](../../../docs/resource_resolution_model.md) §9–§10 as "a GitHub-style heading slug". Four surfaces encode the section's permitted characters, and they do not agree:

| Surface | Section character class | Admits `/`? | Admits `::`? |
|---|---|---|---|
| [`parseResourceRef`](../../../src/utils/resource-ref.ts#L15) | anything after the first `#` | **yes** (already) | **yes** (already) |
| [`rewriteResourceLinks`](../../../src/loaders/markdown-technique-loader.ts#L228) | `(#[A-Za-z0-9_-]+)?` | no | no |
| [`extractResourceIds`](../../../src/utils/resource-ref.ts#L77) | `#[a-z0-9][a-z0-9_-]*` | no | no |
| guard [`LINK_RE`](../../../scripts/check-resource-anchors.ts#L78) | `#([A-Za-z0-9][\w-]*)` | no | no |

`parseResourceRef` needs no change for either candidate delimiter — it splits on `#` before it touches `/`, so a path-scoped section survives it intact today. The other three reject both delimiters, and each rejects them *silently* (no match ⇒ skipped, never reported).

### The two sluggers

```
guard   (check-resource-anchors.ts#L42):  trim → toLowerCase → replace(/[^\w\s-]/g,'') → replace(/ /g,'-')   + per-file -N dedupe
runtime (resource-ref.ts#L34):            trim → toLowerCase → replace(/[^\w\s-]/g,'') → replace(/\s+/g,'-')  + first match wins
```

Three behavioural differences, in decreasing live impact:

1. **Whitespace-run collapse.** `/ /g` maps each space to one hyphen (so a stripped `&` or `—` leaves a double hyphen: `Plan & Prepare` → `plan--prepare`); `/\s+/g` collapses the run (`plan-prepare`). The guard matches GitHub; the runtime does not.
2. **Duplicate-heading dedupe.** The guard mints `slug`, `slug-1`, `slug-2` per file and accepts links to any of them. The runtime has no counter and always binds the **first** match, so a guard-approved `#slug-1` resolves to `null`, and a `#slug` ref silently binds the first of N.
3. **Tab handling.** Both keep whitespace through the strip step, but only the runtime's `\s+` converts a tab; the guard's `/ /g` leaves it, producing an anchor no link can spell.

Neither matches real `github-slugger` on two further points, both **latent** in the current corpus: `[^\w\s-]` strips Unicode letters that GitHub preserves (0 such headings in resource files), and neither reduces a heading's inline markdown to its rendered text (`## [Foo](bar)` slugs as `foobar`, GitHub gives `foo`).

### Error Handling

`Result<T, E>` (`src/result.ts`) is the loader convention; `readResourceStructured` returns `err(ResourceNotFoundError)`. Section resolution is the exception — it is a bare `string | null`, and each of the two consumers translates `null` differently:

- `get_resource` **throws** `Section '#x' not found in resource 'y'` ([resource-tools.ts#L783](../../../src/tools/resource-tools.ts#L783)) → the MCP tool call fails, aborting the agent mid-step.
- eager bundling **discards** the resource ([workflow-tools.ts#L805](../../../src/tools/workflow-tools.ts#L805)) → `get_activity` succeeds with the resource simply absent from the `resources` map, no warning in `_meta.validation`, no history event. The agent then follows `resources_note` ("call `get_resource` only for ids absent from the map") and hits the throwing path instead.

So one broken anchor manifests as a *deferred* hard failure with a token-cost detour, not as a bundling error.

## Design Rationale

### Guard re-implements slugging instead of importing the resolver

**Observation**: the guard's header comment claims GitHub semantics including `-N` dedupe, and its slugger is written to match `github-slugger` — with an explicit comment that `plan--prepare` is intentional. It imports nothing from `src/`.  
**Hypothesized rationale**: the guard's job is to model *GitHub rendering* (the corpus must also read correctly on github.com), which is a different specification from "what the resolver does". Importing the resolver would make the guard tautological — it could never catch a resolver bug.  
**Trade-offs**: buys an independent oracle; pays with two specifications that can silently drift apart, and no test anywhere asserts they agree.  
**Implications for changes**: "make them share one slugger" removes the independent oracle. The defensible target is one shared slugger *plus* a differential test that the guard's accepted-anchor set equals the resolver's resolvable-anchor set per file — the oracle then lives in the test, not in duplicated code.

### The guard validates a 26% superset of what the runtime ever resolves

**Observation**: of 527 in-corpus anchor links the guard scans, **390 target `resources/*.md`** and **137 target non-resource corpus files** (`activities/README.md`, `techniques/**/*.md`). `readResourceStructured` only ever opens `resources/`, and `rewriteResourceLinks` only rewrites paths containing a `resources/` segment.  
**Hypothesized rationale**: the guard was scoped to "the corpus renders correctly and its cross-references resolve", not to "the resolver can fetch it". Technique and activity anchors are read by agents from bundled text, never fetched by section.  
**Trade-offs**: broad coverage of authoring correctness; but "the guard and the runtime must agree" is *vacuous* for 26% of the links it checks, where GitHub rendering is the only consumer.  
**Implications for changes**: unifying semantics must not narrow the guard to resource links only — that would drop 137 links from validation. The guard keeps GitHub semantics corpus-wide; the runtime is what moves. The alternative — splitting the guard into a corpus-render check (all 527, GitHub semantics) and a resolver-resolvability check (the 390 resource links, resolver semantics) — is coherent and would make the resolver's contract independently testable, but it institutionalises two specifications, which is the condition #141 exists to end. Prefer one slugger plus a differential test; revisit the split only if the two specifications must legitimately differ.

### Anchors are authored as GitHub-resolvable links, by design

**Observation**: authoring uses real relative links so files resolve in editors and on GitHub; the id form is produced by rewrite at load ([#L218](../../../src/loaders/markdown-technique-loader.ts#L218)), and [AP-54 `anchored-protocol-references`](../../../workflows/workflow-design/resources/anti-patterns.md) requires every protocol reference to use a resolvable form — which is why 527 anchor links exist at all.  
**Hypothesized rationale**: one artifact, two audiences (human reader on GitHub, agent via `get_resource`), with no build step between them.  
**Trade-offs**: excellent authoring ergonomics; the corpus cannot express any anchor GitHub cannot resolve.  
**Implications for changes**: **any** hierarchical anchor syntax — `#parent/child` or `#parent::child` — breaks the GitHub half of that contract, because GitHub only resolves single-slug anchors. GitHub's own answer to a duplicate heading is the `-N` suffix. This is the sharpest argument bearing on whether path-scoping belongs in this package at all, and it applies equally to both candidate delimiters, so it does not by itself decide between them.

What *does* separate the two delimiters is that `::` is already occupied. It is the technique-path separator across the whole system — `[workflow::]technique[::nested…]`, plus dotted rule addressing on the same paths ([docs/resource_resolution_model.md](../../../docs/resource_resolution_model.md) §3) — and `extractResourceIds` explicitly excludes any href containing `::` from being treated as a resource id ([resource-ref.ts#L89](../../../src/utils/resource-ref.ts#L89)). Reusing `::` for section paths would make one token mean "technique path segment" and "heading path segment" depending on which side of a `#` it sits, and would require unpicking that exclusion. `/` is already inert inside the section part (`parseResourceRef` splits on `#` first) and already means "hierarchical path" everywhere else in the ref grammar.

### `resource:<id>` is ref-keyed, not content-keyed

**Observation**: `<hash>`-suffixed ledger channels are content-keyed ("the key IS the content hash, so a changed payload gets a different key and delivers in full; no invalidation logic" — [delivery.ts#L29](../../../src/utils/delivery.ts#L29)); `resource:<resource_id>` is keyed on the caller's ref string and compared by hash.  
**Hypothesized rationale**: the ref string is what the agent will re-ask for, so it is the natural slot; bare and sectioned ids must not share a slot.  
**Trade-offs**: a changed `fullText` for an unchanged ref fails to match and re-delivers in full — graceful degradation costing tokens, never staleness.  
**Implications for changes**: "keep hashes byte-identical" is a *token-cost* goal, not a correctness gate. The correctness exposure is elsewhere: a ref that currently resolves and would resolve to a **different** section under new semantics.

### Section extraction returns `string | null` while its neighbours return `Result`

**Observation**: the whole loader layer is `Result`-typed; only `extractMarkdownSection` is `null`-returning, and its two callers invent different failure semantics (throw vs. discard).  
**Hypothesized rationale**: it is a pure string function with one failure mode, written before the two consumers existed.  
**Trade-offs**: minimal signature; loses the ability to say *why* resolution failed.  
**Implications for changes**: path-scoped resolution has several distinguishable failures (segment 1 missing, segment 2 missing within segment 1, ambiguous match). Collapsing them all into `null` makes both consumers' diagnostics useless. Widening the return to a `Result`-shaped or discriminated failure is the change that makes the feature diagnosable, and it is a two-call-site edit.

## Data Flow and Operational Context

### Data Flow Map

```
author writes  ../resources/foo.md#bar   in a technique .md   (corpus, submodule)
        │
        ├─ (A) GitHub / editor renders it → anchor must be a GitHub slug
        │
        └─ (B) technique load: parseTechniqueIndex → rewriteResourceLinks
                 → projected text carries  [label](foo#bar)
                      │
                      ├─ get_activity: extractResourceIds(projected) → "foo#bar"
                      │        → loadResourceDelivery → parseResourceRef → readResourceStructured
                      │        → extractMarkdownSection(body, "bar")
                      │             null → resource silently omitted from the bundle
                      │             ok   → bundled + resource:foo#bar hash recorded
                      │
                      └─ agent reads the projected link, calls get_resource { resource_id: "foo#bar" }
                               → same parse/load/extract chain
                               → null → THROW, tool call fails
        │
        └─ (C) CI: check-resource-anchors walks the corpus, re-slugs headings
                 with its own slugger + -N dedupe, asserts hard-zero
```

Producer/consumer asymmetry to note: (C) reads the **raw file**; (B) reads the **frontmatter-stripped, trimmed body** (161 of 182 resource files carry frontmatter). Today that divergence is inert — 0 resource files contain a heading-shaped line inside their frontmatter — but it is a real latent split, since `---` is not a fence and neither parser guards against it.

### Invariant Alignment

| Invariant | Producer enforces? | Consumer assumes? | Gap |
|---|---|---|---|
| Anchor is a GitHub heading slug | Yes — guard `slugify` + `-N` dedupe models `github-slugger`; docs §10 state it | `extractMarkdownSection` assumes collapse-runs, no dedupe | **Yes.** Guard-approved anchors that the resolver returns `null` for. Live: 2. |
| Anchor identifies **one** heading | No — guard accepts `#slug` for a file with N duplicates | Resolver binds the first match and returns its whole body | **Yes.** Silent over-delivery, undetectable by CI: 10 duplicate slugs across 4 resource files. |
| Target file exists | Yes (`missing-file`) — but only for links surviving fence/inline-code stripping | Loader errors with `ResourceNotFoundError` | Partial: the guard's fence stripping hides links inside fenced blocks (1 known hidden `missing-file`). |
| Section part matches `[A-Za-z0-9][\w-]*` | Enforced by rewrite + guard `LINK_RE` | `parseResourceRef` accepts anything after `#` | Inverted: the *consumer* is the permissive one. A path-scoped anchor is dropped by the producer and by discovery, never rejected loudly. |
| Body offered to the resolver equals what CI slugged | No — frontmatter stripped, content trimmed | Assumes the same heading set | Latent (0 occurrences today). |

### Execution Context

In-process, single-threaded async MCP tool handlers; no consensus or block-production semantics. Failure blast radius is per-tool-call: `get_resource` throws and the agent's step stalls; eager bundling degrades to a lazy fetch. Session state is written after successful resolution ([`advanceSession`](../../../src/tools/resource-tools.ts#L839) + `saveSessionForTool`), so a throwing section lookup records no delivery and no `resource_fetched` event — the failure is invisible in `session.json#history` as well as in `_meta.validation`.

### Operational Scenarios

| Scenario | Effect on this code path | Risk |
|---|---|---|
| First fetch, fresh session | Full delivery; `resource:<ref>` hash recorded | — |
| `context_mode: persistent` refetch after a semantics change | Hash mismatch → full re-delivery | Low — tokens only |
| Broken anchor reached via eager bundle | Resource silently absent, then the agent's fallback `get_resource` throws | High — deferred, unattributable failure |
| Broken anchor reached directly | Tool call throws mid-step | High but legible |
| Duplicate heading, first-match binds an H1 | Whole file returned instead of the section — CI-approved, nothing errors | High — silent context cost |
| Corpus heading renamed | Guard turns red on the next CI run; runtime returns `null` immediately | Medium — CI is the safety net, and it lags the submodule pointer |
| Feature worktree with empty `workflows/` | Guards and tests must run from the main repo or via `--root` | Medium — a green local run can be vacuous |

## Domain Concept Mapping

### Glossary

| Domain term | Technical construct | Description |
|---|---|---|
| Resource | `workflows/<workflow>/resources/<slug>.md` | Large reference material (templates, rubrics, catalogs) held out of technique bodies for context economy |
| Resource ref | `[<workflow>/]<id>[#<section>]` → [`parseResourceRef`](../../../src/utils/resource-ref.ts#L8) | The agent-facing address; `::` is the *technique* path separator, `/` the workflow separator |
| Section anchor | the `#…` tail → [`extractMarkdownSection`](../../../src/utils/resource-ref.ts#L33) | A GitHub heading slug narrowing delivery to one section and its body |
| Rendered heading | heading outside a fenced block → [`collectAnchors`](../../../scripts/check-resource-anchors.ts#L51) | The only headings GitHub gives anchors to; fenced template bodies must not count |
| Eager bundling | [`workflow-tools.ts#L799`](../../../src/tools/workflow-tools.ts#L799) | `get_activity` inlines linked resource bodies in a sibling `resources` map, keyed by exact ref |
| Reference delivery | `resource:<id>` channel, [`delivery.ts#L26`](../../../src/utils/delivery.ts#L26) | Already-delivered content collapses to `{delivery:'unchanged', content_hash}` |
| Hard-zero guard | `check-*.ts` + a sibling test asserting `[]` | The repo's enforcement idiom; anchor validity is one instance |
| Dual resolution | [`rewriteResourceLinks`](../../../src/loaders/markdown-technique-loader.ts#L226) | One authored link serving both GitHub rendering and `get_resource` addressing |

### Domain Model

The subsystem exists to make **context economy** addressable: an agent should be able to name one section of a large reference file and pay for only that section. Everything else follows — the anchor grammar exists so a technique can point at a slice, the rewrite exists so the pointer works for both readers, the ledger exists so the same slice is not paid for twice, and the guard exists because the pointer's target lives in a separately versioned submodule where a heading rename is invisible to the compiler.

Two properties the model currently lacks, and which #141 addresses: an anchor is not guaranteed to be **unambiguous** (first-match-wins over duplicates), and it is not guaranteed to be **resolvable-if-valid** (the guard and the resolver grade against different specifications).

## Open Questions

| # | Question | Status | Resolution | Deep-Dive Section |
|---|---|---|---|---|
| Q1 | Which mechanism causes the live guard-approved/runtime-`null` links — whitespace-run collapse or `-N` dedupe? | Resolved | Whitespace-run collapse, both cases; zero live links fail via dedupe | [Guard-vs-runtime divergence](#guard-vs-runtime-divergence-mechanism-by-mechanism--2026-07-27) |
| Q2 | Would adopting GitHub slug semantics change what any currently-resolving ref resolves to? | Resolved | No — 0 regressions and 0 collision-splits corpus-wide, so no delivered bytes change | [Adopting GitHub semantics is provably non-regressive](#adopting-github-semantics-is-provably-non-regressive-on-this-corpus--2026-07-27) |
| Q3 | Is the guard's extra 137 non-resource links' anchor semantics load-bearing at runtime? | Resolved | No — the resolver only ever opens `resources/`; 26% of guard-checked links have no runtime consumer, so the guard must keep GitHub semantics and the runtime is what moves | [Guard validates a 26% superset](#the-guard-validates-a-26-superset-of-what-the-runtime-ever-resolves) |
| Q4 | How exposed is the corpus to the naive fence toggle today? | Resolved | Zero — 0 of 182 resource files parse differently under a CommonMark-correct tracker | [Fence-handling exposure is zero today](#fence-handling-exposure-is-zero-today--2026-07-27) |
| Q5 | Where does a path-scoped ref break first, given `parseResourceRef` already passes `/` through? | Resolved | Five silent stages before one loud one; minimum edit set is four surfaces, and `parseResourceRef` is already delimiter-agnostic | [Where a path-scoped ref actually breaks](#where-a-path-scoped-ref-actually-breaks--2026-07-27) |
| Q6 | Does GitHub semantics + `-N` fix the silent over-delivery on its own, without new syntax? | Resolved | Yes for all 10 corpus duplicates, at the cost of a one-token corpus edit per link — and unlike path scoping the link still resolves on GitHub | [The duplicate-heading case, and the syntax-free alternative](#the-duplicate-heading-case-and-the-syntax-free-alternative--2026-07-27) |
| Q7 | What does the `splitSections` descent idiom imply for a path-scoped resolver's matching rule? | Resolved | Slug-per-segment matching with level-relative *scoping* (search within the parent's window at any depth) is the only combination consistent with both existing parsers | [Precedent for path-scoped resolution](#precedent-for-path-scoped-resolution-already-in-the-codebase--2026-07-27) |
| Q8 | Does the delivery-ledger `resource:<id>` key survive a *ref-string* change (e.g. rewriting a corpus link to a path-scoped or `-N` form)? | Open → **implementation-analysis** | Mechanism is understood — the key is the ref string, so a rewritten link mints a new slot and re-delivers in full — but the token cost of a corpus-wide link rewrite is unmeasured. Closes with a `bench:token` run against the frozen A0 reference | |
| Q9 | Which of the three broken-heading links is in scope for this package, given only one targets a `resources/` file? | Open → **requirements-elicitation** | Identities and reachability established; which to fix versus descope is a user decision, since it sets whether the hard-zero guard can go green | |
| Q10 | Should the anchor guard gain a third `reason` (`ambiguous-anchor`) so first-match over-delivery becomes representable? | Open → **plan-prepare** | `BrokenAnchor` cannot express "resolves, but to the wrong heading", which is why the over-delivery class is CI-invisible. Carried forward as a design proposal, not a finding | |

Q1–Q7 were resolved by measurement against the corpus at the pinned revision. Q8–Q10 were accepted at the sufficiency gate as beyond comprehension's reach and handed to the activities named in their Status cells; no further comprehension pass will close them.

**Remaining follow-up items (out of scope)**

- Nested resource directories (`resources/<sub>/<id>.md`) are silently misresolved — `extractResourceIds` yields `sub/foo.md#bar` and `parseResourceRef` reads `sub` as a *workflow*. Zero occurrences today; the same three regexes are implicated, so it is worth fixing alongside them, but it is not part of #141's acceptance criteria.
- Neither slugger reduces a heading's inline markdown to rendered text (`## [Foo](bar)` slugs as `foobar`; GitHub gives `foo`), and both strip Unicode letters GitHub preserves. Zero occurrences in resource files today.
- `splitSections` has no fence awareness at all. It is insulated by exact-title matching, but a `## Inputs` line inside a fenced block in a technique file would split a section.
- `extractMarkdownSection` returning `string | null` in a `Result`-typed layer loses the failure reason; path-scoped resolution has several distinguishable failures that would all collapse to `null`.

## Deep-Dive Sections

### Guard-vs-runtime divergence, mechanism by mechanism — 2026-07-27

Both sluggers were run over the whole corpus and each of the 527 in-corpus anchor links graded under both. Exactly five links do not resolve, in two classes:

**Class A — genuine broken headings (3).** Both the guard and the resolver fail; these are the red baseline the hard-zero test currently trips on.

- `meta/techniques/workflow-engine/workflow-orchestrator.md` → `./dispatch-activity.md#accumulate-trace-tokens`
- `work-package/techniques/review-assumptions/interview.md` → `../../resources/assumptions-review.md#open-assumptions`
- `work-package/techniques/review-test-suite.md` → `../resources/test-suite-review.md#test-suite-review-report-template`

Only the second targets a `resources/` file, so only that one is reachable by `get_resource`; the other two are corpus navigation.

**Class B — guard-approved, resolver-`null` (2).** Both are caused by the **whitespace-run collapse** difference, and both anchors carry the tell-tale double hyphen:

- `work-package/README.md` → `./activities/README.md#06-plan--prepare` (heading `06. Plan & Prepare`)
- `workflow-design/README.md` → `./resources/README.md#planning-artifact--guide-map`

**Zero** live links fail through the `-N` dedupe difference. Dedupe divergence is real but entirely latent. Equally: both Class B links target `README.md` files, not `resources/*.md`, so **neither has a runtime consumer at all** — `readResourceStructured` only ever opens `resources/`, and `rewriteResourceLinks` only rewrites `resources/` paths. The live "CI passes but the runtime returns null" defect is a semantics bug with no live victim; the reachable-by-`get_resource` half of it is latent.

The latent surface is nonetheless broad: **75 headings** in resource files slug differently under the two implementations (nearly all from em-dash headings in `cicd-pipeline-security-audit/resources/`, e.g. `P1 — Expression Injection` → `p1--expression-injection` vs `p1-expression-injection`). Any future link to one of those, written GitHub-correctly, would be CI-green and runtime-`null`.

### Adopting GitHub semantics is provably non-regressive on this corpus — 2026-07-27

Two questions decide whether the "adopt GitHub slug semantics" and "keep delivery byte-identical" acceptance criteria actually conflict.

1. *Would any currently-resolving ref stop resolving?* No. Across all 527 links there are **zero** in the `runtime-resolves / guard-rejects` class — every anchor the resolver resolves today is also in the guard's GitHub anchor set.
2. *Would any currently-resolving ref resolve to a **different** heading?* No. That requires one file to hold two distinct headings whose runtime slugs collide while their GitHub slugs differ (runtime first-match would pick one; GitHub's exact match the other). Corpus-wide count: **zero**.

Therefore, on the current corpus, adopting GitHub semantics in the resolver changes the resolved content of **no** existing ref — so no `fullText` changes, so no `resource:<id>` hash changes, and the "byte-identical delivery" criterion is satisfied automatically rather than traded against. The apparent requirements contradiction is an artefact of reasoning about the change in the abstract; measured against the corpus it dissolves. What the change does accomplish is closing the 75-heading latent gap and making the two Class B links resolvable.

This does **not** extend to adding `-N` dedupe *addressing*: a ref written `#slug` still binds the first of N duplicates (dedupe assigns `n === 0` the bare base slug), so over-delivery is untouched by the semantics fix alone.

**The path not taken.** Because neither Class B link has a runtime consumer, a strictly cheaper option exists and should be named before it is dismissed: **edit the two links to the resolver's collapse form and change no code at all.** It costs two characters, turns the corpus green under both specifications, and carries zero regression risk. It is the right answer if the goal were only "make CI and runtime agree today". It is the wrong answer for #141 because it leaves the 75-heading latent gap open and leaves CI actively teaching authors GitHub semantics that the resolver does not honour — the next GitHub-correct link written against `cicd-pipeline-security-audit/resources/` re-creates the defect. Recording it matters: it shows that the work's justification is *preventing the next occurrence*, not repairing the current two, which is what makes the resolver (not the corpus) the correct place to change.

### Where a path-scoped ref actually breaks — 2026-07-27

Traced through the real functions (`rewriteResourceLinks`' regex, plus imported `extractResourceIds`, `parseResourceRef`, `extractMarkdownSection`). For an authored `[x](../resources/foo.md#parent/child)`, and identically for `#parent::child`:

| Stage | Behaviour | Loud? |
|---|---|---|
| CI guard `LINK_RE` | Anchor class `[A-Za-z0-9][\w-]*` does not match → **the link is not scanned at all** | silent — unvalidated, not rejected |
| `rewriteResourceLinks` | Anchor group `(#[A-Za-z0-9_-]+)?` fails, and the trailing `\)` then cannot match → **no rewrite**; the projected technique keeps a raw relative path where the agent expects an id | silent |
| `extractResourceIds` | The `resources/` branch bypasses the id regex entirely, yielding the malformed id `foo.md#parent/child` (`.md` retained) | silent |
| `parseResourceRef` | Tolerates it — strips `.md` *after* the `#` split → `{ id: 'foo', section: 'parent/child' }`. **Needs no change for either delimiter** | n/a — already correct |
| `extractMarkdownSection` | No heading slugs to `parent/child` → `null` | — |
| eager bundle | `if (!loaded.success) continue` → resource silently omitted from the `resources` map | silent |
| agent fallback `get_resource` | Throws `Section '#parent/child' not found` | **loud, finally** |

Five silent stages precede the one loud one, and the loud one is not the stage that is wrong. The practical consequence for the work package: the minimum edit set is **four** surfaces — the three anchor character classes (guard `LINK_RE`, `rewriteResourceLinks`, `extractResourceIds`) plus `extractMarkdownSection` — not the single file the issue names. `parseResourceRef` is already delimiter-agnostic.

The same trace exposes an unrelated pre-existing defect: `[x](../resources/sub/foo.md#bar)` (a nested resource directory) is also not rewritten, and `extractResourceIds` yields `sub/foo.md#bar`, which `parseResourceRef` reads as **workflow** `sub`, id `foo`. Nested resource directories are silently misresolved. The corpus has zero of them today (0 of 182 resource files sit below `resources/`), so this is latent — but it is the same class of failure and the same three regexes.

### The duplicate-heading case, and the syntax-free alternative — 2026-07-27

Run against the real resolver, `workflows/prism-evaluate/resources/evaluation-report-template.md` (88-line body after frontmatter strip, two real headings, everything from body line 12 onward inside a ```` ```markdown ```` fence):

```
extractMarkdownSection(body, 'evaluation-report-template')    -> 88 lines  (the ENTIRE body)
                                                                 first line: "# Evaluation Report Template"
extractMarkdownSection(body, 'evaluation-report-template-1')  -> null
```

The anchor looks precise, CI approves it, nothing errors, and the caller receives the whole file instead of the `## Evaluation Report Template` section — because the H1 matches first and no later H1 closes it. This is the silent over-delivery case in full.

Two fixes resolve it, and they are not equivalent in cost:

- **Path-scoped anchor** — `#evaluation-report-template/evaluation-report-template`: segment 1 binds the H1 (window = whole body), segment 2 binds the H2 inside that window. Requires the four-surface change above, and the resulting link **does not resolve on GitHub**, breaking the dual-resolution property that `rewriteResourceLinks` exists to preserve ([#L218](../../../src/loaders/markdown-technique-loader.ts#L218)).
- **GitHub `-N` addressing** — `#evaluation-report-template-1`: the GitHub dedupe table for this file is exactly `{L1: evaluation-report-template, L9: evaluation-report-template-1}` (body-relative), so `-1` binds the intended H2. Requires only the AC-1 slugger unification plus a one-token corpus edit per referencing link, needs no new syntax, no change to the rewrite or discovery regexes or the guard, and the link **still resolves on GitHub**.

All 10 duplicate slugs in the corpus sit inside single files (`injection-pattern-catalog.md` ×6 groups, `intermediate-artifact-schemas.md#field-descriptions` ×5, and the three `prism-evaluate` template self-titles), which is exactly the shape `-N` addresses. The case for path scoping therefore does not rest on the duplicate-heading defect; it rests on wanting a *stable, meaningful* address (a `-1` suffix silently re-points if a heading is inserted above), which is a different and weaker argument than the issue's framing.

### Fence-handling exposure is zero today — 2026-07-27

The naive `/^\s*(```|~~~)/` toggle ignores fence character, length, and info strings, so a nested fence desynchronises it. Measured over all 182 resource files:

- **0** files have an odd number of fence markers (the crude desync signal).
- **1** file uses the nesting idiom (`workflow-design/resources/scope-manifest.md`, outer `~~~~markdown` with inner ``` blocks). Running a CommonMark-correct tracker against the naive one over that file yields **identical** heading sets — the desynchronised window (between the inner ``` pair) happens to contain no heading lines.

So the resolver-side fence defect is entirely latent: no resource file currently parses differently under a correct tracker. This matches the guard-side finding already recorded in [design philosophy](../planning/2026-07-27-issue-141/02-design-philosophy.md) — that the guard's fence handling hides exactly one link. AC 6 is defensive hardening, not a live-bug fix, and should be scoped and tested as such (fixture-driven, since the corpus provides no failing case).

### Precedent for path-scoped resolution already in the codebase — 2026-07-27

`markdown-technique-loader.ts` already navigates markdown hierarchically: [`splitSections(body, 2)`](../../../src/loaders/markdown-technique-loader.ts#L125) for `## Inputs`, then `splitSections(section.body, 3)` per entry, then [`parseEntrySubsections`](../../../src/loaders/markdown-technique-loader.ts#L302) → `splitSections(body, 4)` per component. Each descent scopes the next match to the previous section's body, and matching is by exact case-insensitive title rather than by slug.

`extractMarkdownSection` already computes the same window — the heading line down to the next heading of equal-or-higher level. Path-scoped resolution is therefore a **fold over segments narrowing that window**, which is a small, precedent-following change to one function; the difficulty of the feature lives in the other three regexes and in the loss of GitHub resolvability, not in the resolver algorithm.

One deliberate divergence to settle if path scoping proceeds: `splitSections` matches exact titles at a *fixed* level, while `extractMarkdownSection` matches slugs at *any* level. Keeping slug matching per segment preserves the anchor grammar; adopting level-relative matching would make an address like `#parent/child` mean "child at parent's level + 1", which is stricter but breaks whenever an author changes heading depth. Slug-per-segment with level-relative *scoping* (search only within the parent's window, at any depth) is the combination consistent with both existing behaviours.

### The addressing choice underneath all of this — 2026-07-27

The subsystem could have addressed sections by **heading text**, which is what `splitSections` does internally and has done since the technique loader was written. It addresses by **GitHub slug** instead, and the reason is not resolver convenience — it is that a slug is what a GitHub anchor *is*, so one authored link serves both the human reader and the agent. Every difficulty in this artifact descends from that one choice: two implementations of a slug (because the guard must model GitHub independently), a first-match rule (because slugs are not unique and GitHub's uniqueness device is a positional counter), and a rewrite regex that constrains the anchor character class (because the id form is derived, not authored).

Seen that way, `#parent/child` is not a new idea — it is a partial retreat from slug addressing back toward the path addressing `splitSections` already performs, keeping slugs at each segment. That reframing is what makes the trade-off legible: path scoping buys stable, meaningful, unique addresses and pays by giving up the dual-resolution property that motivated slug addressing in the first place. The decision is therefore not "should anchors be hierarchical" but "is a stable address worth more than a GitHub-resolvable one" — and that question is answerable only against how the corpus is read, which is a requirements question, not a comprehension one.
