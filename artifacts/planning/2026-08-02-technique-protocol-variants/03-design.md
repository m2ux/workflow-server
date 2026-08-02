# Design: protocol variants under `## Protocol`

The agreed interpretation model (final iteration of the session's design discussion), the
qualification contract, the wire shape, and the alternatives considered and rejected.

## Interpretation rule

`## Protocol` remains the **only** site. Its internal shape modulates its meaning — a three-way
parse-time test on a **leaf** technique:

| Shape of `## Protocol` | Meaning | Corpus today |
|---|---|---|
| No `###` sections (flat list or prose) | Single anonymous protocol | 161 files |
| All sections numbered `### N. Title` | Phases of one protocol (AP-108 / principle 15, unchanged) | 300 files |
| All sections unnumbered `### <slug>` | **Variant set** — each section is one caller-selectable sub-protocol | 0 files (new) |
| Mixed numbered + unnumbered | **Parse error** | 0 files |

Variant bodies are op-shaped: a slug title over an ordered (typically numbered) step list —
`bodyAsList` already parses this. A variant needing multiple *phase sections* of its own is the
signal that it is really a sibling op; the flat `###` syntax structurally cannot express it, and
that constraint is kept deliberately.

Containers (`TECHNIQUE.md`) are **excluded** from variants: their unnumbered titles are already
reserved (`Initial`/`Final` wrap; other blocks parent-only). Container validation tightens to
wrap-only blocks (plus numbered, if ever used), which forces the one existing stray
(`update-pr::template-selection`) into Rules — a refile AP-124 already demands.

## Resolution contract (fail-closed in both directions)

1. A technique with **no variants resolves at the filename**, exactly as today. All 554 current
   files keep byte-identical resolution behaviour.
2. A technique **with variants must have a variant selected, or resolution fails**. No default
   variant, no "deliver all" fallback.
3. A slug passed to a **non-variant** technique fails. A slug naming **no variant** fails.
4. Every selection failure lists the available slugs in the error (error-as-teacher).

Mandatory selection is what makes the in-section discriminator safe. The prior objection to
numbered-vs-unnumbered was the silent flip: drop a digit and phases quietly become variants. Under
fail-closed resolution plus the mixed-shape parse error, every mistake path fails loudly at parse
time or at first use — no silent path remains.

## Qualification contract for variants (what makes sections *variants* and not ops)

A variant set is legal only when the sections are true alternates of one operation surface:

- **Inputs** — each variant may require a **clean subset** of the technique's declared `## Inputs`.
  Lintable: every brace reference in a variant body ⊆ declared inputs (own ∪ inherited).
- **Outputs** — every variant must produce **all** declared `## Outputs`. This is the load-bearing
  invariant: `variables_changed`, finalize-activity, and downstream binds assume one output set per
  invocation regardless of which path ran. Lintable (textually): every declared output `{id}` is
  referenced in every variant body.
- **Rules** — every variant obeys **all** `## Rules`. Structurally free: rules are
  technique-scoped and auto-included in every bundle/composition; there is no per-variant opt-out
  surface.
- **Selection cardinality** — a caller selects exactly one variant per invocation. If a caller ever
  *sequences* two of them, they are sibling ops to be bound as consecutive activity steps
  (*Bind Sibling Operations as Steps*), not variants.

Variants whose I/O diverges beyond input-subsetting do not qualify — they are separate ops (the
existing container + `<op>.md` construct).

## Parser and wire shape

- The parser keeps stripping ordinals from titles (composition renumbering stays honest — position
  is the number) but **records the block kind**, deriving the technique-level discriminator
  (`sequence` vs `variants`) from the homogeneity rule. The ordinal regex widens from `\d+\.` to
  `\d+[.)]` so a `1)` form cannot masquerade as an unnumbered slug.
- Because delivery only happens post-selection, the delivered `protocol[]` keeps its exact current
  shape — the selected variant's blocks, positional. Non-variant techniques are wire-identical to
  today. A variant technique's composition adds provenance:

  ```yaml
  protocol_variant: resume                              # what was selected
  protocol_variants_available: [spawn, resume, concurrent]
  protocol: [...]                                       # selected variant's blocks only
  ```

  The agent never receives an ambiguous multi-variant sequence — the
  `alternate-ops-as-protocol-sequence` failure mode (walking alternates as if sequenced) becomes
  unrepresentable on the wire.
- `Initial`/`Final` ancestor wrap composes **around the selected variant**.

## Selection channel

A dedicated field, not the `::` grammar:

- **Step bind**: `technique: {name: <ref>, protocol: <slug>}` on the activity step (the object form
  already exists for input/output deviations). Primary channel; statically guard-checkable.
- **Standalone paths** (`get_technique` without a step bind, whole-technique refs in bundles,
  workflow `techniques[]` lists): equivalent selector parameter/field; unselected references to a
  variant technique surface through the existing `unresolved` channel.

`::` is kept out deliberately: its sub-segment already resolves nested-op → rule → rule-group in
order, and a variant slug joining that chain could shadow or be shadowed by a rule name or op
filename. Fail-closed resolution also needs an unambiguous "no slug was given" signal, which a
dedicated field provides and an overloaded path cannot.

## Validation set (parse-time + guards)

Parse-time (loud, `MarkdownTechniqueParseError`, same pattern as the banned `## Output(s)` headers):

1. Mixed numbered/unnumbered sections under one `## Protocol` — error.
2. Variant set with fewer than two variants — error (a one-variant set is just the protocol, and a
   lone unnumbered section is the likeliest authoring accident).
3. Variant titles must be valid kebab slugs, unique within the technique.
4. `Initial`/`Final` (case-insensitive) reserved — never variant slugs; on leaves, an error.
5. Containers: variant sets illegal; blocks restricted to wrap titles (+ migration note for
   parent-only blocks).

Guards (new registry entries; nothing existing touches protocol structure):

6. Bind-site completeness: every reference to a variant technique carries a slug; every carried slug
   exists (extends the binding-fidelity class).
7. Variant input-subset lint: brace refs ⊆ declared inputs.
8. Variant output-completeness lint: every declared output `{id}` referenced in every variant body.

## Alternatives considered and rejected

1. **"Any named section = variant"** — unworkable: numbered phase blocks *are* named sections
   (300 files). Rejected in-session.
2. **Separate H2 section (`## Protocols` / `## Variants`)** — clean discriminator (section title
   carries the semantics; zero reinterpretation of `## Protocol`), but rejected: two sites for one
   concept; `## Protocol` should remain the only protocol home, with the variant strategy modulating
   its meaning. The trade accepted with the in-section discriminator: a human reading a *raw* file
   must apply the numbered/unnumbered test to know what they are reading, and workflow-canonical
   must teach both readings of one heading. Mandatory selection plus parse-time homogeneity keeps
   the ambiguity out of every runtime path; it survives only as a raw-file reading burden.
3. **Numbered/unnumbered without mandatory selection** (the round-1 shape) — rejected: silent
   semantic flip on a missing digit; "deliver all variants" recreates the AP-124 failure mode.
4. **Formalising the incumbent Rules-slice pattern instead** — the ~80% capability that already
   exists (`technique::rule-name` is addressable today). Rejected as the end-state because it keeps
   procedures in Rules with contract-invisible input references (see `claude-code.md`); it remains
   the correct home for *standing policy* (that half of AP-124 is unchanged).

## Open decisions

- Wire field names (`protocol_variant` / `protocol_variants_available` vs alternatives).
- Whether `record_usage` / trace / delivery-ledger keys include the selected slug (recommended:
  yes, as `technique::…#slug` or a separate field — decide with the implementation).
- Variant-aware binding provenance: step-bound `source:` annotations should cover only the selected
  variant's input subset, so unused declared inputs do not surface as `UNRESOLVED` noise.
- Whether unselected variant techniques may appear in `techniques.workflow[]` / `techniques.activity`
  strategy lists at all, or only via slug-carrying step binds (recommended: the latter).
