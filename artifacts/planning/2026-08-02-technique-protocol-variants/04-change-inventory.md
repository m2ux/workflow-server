# Change inventory

Everything the variant model touches, by layer. Line references against the repo at 2026-08-02.

## Server

| File | Change |
|---|---|
| `src/loaders/markdown-technique-loader.ts` | `protocolBlocksFromBody` (`:358`) records block kind (numbered vs unnumbered vs reserved) and derives the technique-level discriminator under the homogeneity rule; widen `stripStepOrdinal` (`:382`) to `\d+[.)]`; new parse errors (mixed shapes, <2 variants, non-slug/duplicate variant titles, reserved `Initial`/`Final` on leaves, variant sets on containers) following the banned-headers pattern (`:267–277`) |
| `src/schema/technique.schema.ts` | Variant representation pre-selection (internal map slug → blocks) + delivery-only fields `protocol_variant`, `protocol_variants_available`; `protocol[]` block shape unchanged |
| `src/loaders/technique-loader.ts` | Selection step in `composeLoaded`/`composeTechnique` (`:499`, `:575`): fail-closed when unselected / slug-on-non-variant / unknown slug, error lists available slugs; `Initial`/`Final` wrap (`:445`) composes around the selected variant; bundle path surfaces unselected variant refs via the existing `unresolved` channel (`formatTechniqueBundle`, `:624`) |
| `src/schema/activity.schema.ts` | Step bind gains the selector: `technique: {name, protocol: <slug>}` (object form already exists for I/O deviations) |
| `src/tools/resource-tools.ts` | `get_technique` (`:602–614`): step-bound loads read the slug from the bind; standalone loads accept a selector param |
| `src/utils/binding-provenance.ts` / delivery | Variant-aware provenance: `source:` annotations cover only the selected variant's input subset so unused declared inputs do not read as `UNRESOLVED` noise |
| Trace/ledger (decide with impl) | Whether `record_usage` / fidelity events / delivery-ledger keys carry the selected slug |

## Guards (`scripts/guards.ts` registry — all additions, no existing entry touches protocol structure)

1. Protocol-shape validity is largely parse-time; a guard re-surfaces loader rejections over the
   whole corpus so `npm run check:all` fails on malformed files nobody has loaded yet.
2. Bind-site completeness: every reference to a variant technique carries a slug; every slug
   resolves (extends the binding-fidelity class).
3. Variant input-subset lint: brace refs in each variant ⊆ declared inputs (own ∪ inherited).
4. Variant output-completeness lint: every declared output `{id}` referenced in every variant body.

## Canon homes

| Home | Change |
|---|---|
| `workflows/workflow-design/resources/anti-patterns.md` — `alternate-ops-as-protocol-sequence` (AP-124, `:1598`) | Rewrite. Detect retargets *malformed* variance: alternate ops encoded as **numbered** phases; variant sets violating the qualification contract (missing outputs, non-subset inputs); variants that are secretly sequential phases. Fix redirects true variants to unnumbered Protocol sections with mandatory selection; **standing host policy → Rules stays unchanged** (that half of the entry survives verbatim) |
| Same file — `numbered-protocol-phases` (AP-108, `:1406`) | Unchanged; numbered = phases stands |
| `workflows/meta/resources/workflow-canonical.md` §Protocol (`:51–57`) | Teach both readings of `## Protocol`: the existing single-sequence text plus the variant mode (unnumbered slug sections, mandatory selection, qualification contract) |
| `workflows/workflow-design/resources/schema-construct-inventory.md` Technique-Level (`:70–71`) | New row: informal "one op surface, caller picks a mode" → formal **protocol variant set** (unnumbered `### slug` sections + step-bind `protocol:` selector) |
| `workflows/workflow-design/resources/design-principles.md` | One boundary sentence under *Bind Sibling Operations as Steps* / *Atomic Techniques; Compose at Activities*: variants a caller ever sequences are sibling ops, not variants; qualification test is "exactly one per invocation, all outputs from each" |

## Corpus

| Target | Change | Owed independently? |
|---|---|---|
| `workflows/work-package/techniques/update-pr/TECHNIQUE.md` | Refile `### template-selection` under `## Rules` | Yes — AP-124 already demands it |
| `workflows/meta/techniques/harness-compat/*` | Optional first consumer: migrate `spawn`/`resume`/`concurrent` Rules slices to protocol variants with declared input subsets (`{composed_prompt}` etc. become contract-visible); `resolve-harness-operation.md:42` re-worded; the harness dimension keeps the resolver | No — the payoff case |
| Everything else (552 files) | None | — |

## Sequencing note

Land the strict parse validation (mixed = error, container restrictions) **first and independently**
if the rest staggers: the corpus satisfies it today at zero cost, and it freezes the invariants the
variant construct depends on before any permissive-parser drift can occur.

## Risks / burdens accepted

- `## Protocol` becomes a dual-mode section: a human reading a raw file applies the
  numbered/unnumbered test to know what they are reading. Confined to raw-file reading by
  fail-closed resolution + parse-time homogeneity; the wire is never ambiguous.
- Output-completeness lint is textual (brace-reference) evidence, not semantic proof — same
  standard the existing binding-fidelity guards accept.
- Discovery ergonomics rest on the error channel (slugs listed on failure) and the static guard;
  nothing surfaces variants proactively to workflow authors beyond the technique file itself.
