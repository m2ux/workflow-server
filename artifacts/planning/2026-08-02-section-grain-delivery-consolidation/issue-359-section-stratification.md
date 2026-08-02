# Issue #359: Section stratification: the prose around a section is lost when only the section is delivered

Captured verbatim on 2026-08-02 when the issue was consolidated into the section-grain-delivery epic.

---

## Summary

The server can deliver a resource file either whole or one section at a time: a citation that carries an anchor, like `foo.md#bar`, fetches just the span under that heading. Design principle **32. Cite Resources at Section Grain** (#351) makes a citation's grain a delivery decision, and #358 registers the corpus written before that principle existed. Both rest on the assumption they are asking readers to rely on: that a `##` heading boundary is a **concern** boundary, so a section-scoped read is self-sufficient.

This issue records the audit of that assumption. It does not hold for most of the corpus, in one specific and measurable way: the introductory text a resource opens with — its **framing** — is unreachable by any section-scoped read.

## What a section fetch actually returns

When the server is asked for a section, it returns exactly the matched heading's span — from that heading to the next heading of the same or higher level. Nothing else. So anything a reader of that span still needs, but which lives outside it, is silently absent where a whole-file read would have supplied it.

Measured over the **78 resources that have at least one anchored citer** (of 191 resources total, 130 cited at all):

| Mode | Count | What it means |
|---|---|---|
| Framing reachable only by a whole-file span | **63** | The resource opens with an H1 carrying 100–1,046 characters of framing. The only anchor that reaches it (`#overview`, `#<resource>-guide`) spans to the end of the file or the next H1 — the whole file. Framing is all-or-nothing. |
| Prose before any heading | **2** | `prism/definitive-findings-template`, `prism/final-output-template`. No anchor's span contains it. |
| Cited section points outside itself | **2** | Wording like "above" or "below" that resolves to nothing under section delivery. |
| Cited section borrows a glyph key | **1** | `pr-description#link-row-forms` uses 🐛📐, defined in `#templates`. |

Reproduce by stripping frontmatter, indexing the headings that sit outside fenced code blocks, and measuring the prose before the first `##` against the span of the leading H1.

## The framing is operative, not decorative

This is what makes the 63 a defect rather than a curiosity. Four of them, quoted:

- **`schema-construct-inventory`** — "Every piece of prose must be checked against this inventory — if a formal construct exists, it must be used", plus the five-row authoritative-schema table with paths. A consumer fetching a mapping section gets the mappings without the obligation or the schema locations.
- **`planning-readme`** — "Each linked artifact is the single home of its own content; the README links to it (single-source-and-link)." A constraint on what may go in the README at all.
- **`complete-wp-guide`** — "It is the **canonical home** for exactly one fact category: known limitations", and a Review-mode header rule.
- **`workflow-retrospective`** — "an `##`-level section, so it nests inside a host close-out document rather than standing alone." A structural constraint on the output that a consumer of `#output-section-template` would not learn.

## The two confirmed outward references

- `planning-readme#progress-status-call-sites` — "routes it to the cancelled/N/A row **above**", where that row is in `## Status`, a different section.
- `architecture-summary#diagram-selection` — "the artifact template **below** embeds examples for the other types", naming `## Architecture Summary Artifact Template`.

Four further hits of this kind were checked and rejected: two in `codebase-comprehension#comprehension-techniques` are domain prose about a previous block value, and two in `test-suite-review#report-template` and `scope-manifest#template` refer to a table inside their own span.

## Disposition is per resource, and the diagnostic is cheap

The fix is not uniformly "make the framing deliverable". Three outcomes, and asking which applies is most of the work:

1. **The framing duplicates what the citing technique already states → delete it from the resource.** This is commoner than it looks. `complete-wp-guide`'s canonical-home claim and its review-mode header rule are *both* already in `create-complete-doc`'s Protocol — step 3 and a step-2 note. That is why narrowing that citation to `#template` in #351 stranded nothing, and it means the preamble was a second home, not the only one. Every one of the 63 needs this checked first, because where it holds the answer is a deletion under [One Authoritative Home](https://github.com/m2ux/workflow-server/blob/workflows/workflow-design/resources/design-principles.md).
2. **The framing is operative and unique → it needs a named `##` section** so it can be delivered and cited, or it moves to the technique that depends on it. `schema-construct-inventory`'s universal obligation is the clearest instance.
3. **The framing is orientation only → leave it**, and record that verdict rather than assuming it. Whole-file consumers get it; section consumers demonstrably do not need it.

Outward references become anchored links in all cases — that one has no judgement in it.

## Canon gap this exposes

Principle 30 tells an author to split a multi-part resource into per-category sections and to give the whole-document skeleton its own section. It says nothing about the resource's **own framing**, so the leading H1 span sits outside the stratification rule entirely. That is why 63 resources have this shape and none of them is wrong by any current rule.

Principle 30 or 32 needs the clause: content a section-scoped reader depends on lives in a section. And the anti-pattern catalog needs a sibling to AP-134 — `framing-outside-any-section` — whose detection is mechanical: operative prose in a span no `##` anchor reaches, in a resource that has anchored citers.

## The delivery-layer alternative, costed

Every section fetch resolves through one function in the server's resource-delivery module, which splits the `slug#anchor` reference and returns the heading's span. Both the eager bundle assembled for `get_activity` and an explicit `get_resource` call go through it, so a change there covers both. Returning the framing span concatenated with the requested section is roughly ten lines, and closes 65 of the 68 findings above without touching a single resource.

Two variants, and they are not close.

### Variant B — prepend on every fetch

Framing measured against the section it would ride on, per real citation site, because the same 1,046 characters are 8% of a 13k template and 406% of a 266-character icon key:

| Framing as a share of the section it rides on | Distinct (resource, section) pairs |
|---|---|
| Under 25% | 79 |
| 25–100% | 60 |
| **At or above 100%** | **16** |

Cost: **+67,045ch** across distinct pairs (+18% on section bytes), or **+147,351ch** counted per citation site, since a section cited by three techniques pays three times.

The 16 are the objection, and they cluster in the resources principle 30 already told us to split finely:

```
406%   1080ch framing on a  266ch section   planning-readme#icon-key
376%    982ch framing on a  261ch section   review-mode#review-type-selection
331%    982ch framing on a  297ch section   review-mode#validation
309%    513ch framing on a  166ch section   design-principles#9-encode-constraints-as-structure
```

A technique asking for the icon key would receive four times as much roadmap prose as key. The better a resource is stratified, the worse the ratio — a bad property for a mechanism meant to reward stratification.

### Variant C — framing as its own ledger-keyed delivery unit

Charge framing once per resource per agent context, rather than once per fetch. The delivery ledger — the server's record of what each context has already received, keyed by id with a content hash — already supports this: give framing its own ledger key, ship it alongside the first section of that resource a context requests, and collapse it to an unchanged marker thereafter.

Ceiling for the whole corpus: **23,762ch** across 69 resources, median framing 303ch — and per context, only the resources actually cited. Six times cheaper than B for identical coverage.

C strictly dominates B, so that part needs no decision.

### What neither variant fixes

The two outward references and the glyph key. Those are genuine cross-section dependencies rather than framing, and need anchored links either way.

### Blast radius of either variant

- The content hash changes for every section id, so every ledger entry invalidates once and re-delivers.
- Corpus snapshots and the `corpus-sha` stamp need re-stamping.
- `get_resource { resource_id: "x#y" }` begins returning more than section `y` — a semantic change to a documented tool, needing a further clause in `resource-section-or-whole` (extended in #355 to state that a bundled whole resource covers its own sections).

## Sequencing: classify before choosing

The real question is whether the delivery change replaces the corpus work, and that turns on a distribution not yet measured. Each of the 69 framings is one of three things, and they want opposite treatments:

| Classification | Treatment | What a delivery fix does to it |
|---|---|---|
| Duplicates what the citing technique already states | Delete from the resource | Cements the duplication permanently |
| Operative and unique | Deliver it, or move it to the technique | Correct |
| Orientation only | Nothing | Pays to ship what nobody reads |

The sample so far is four resources, chosen by size, so it is both small and biased toward substantial content: `complete-wp-guide` proved a duplicate (its canonical-home claim and review-mode header rule are both already in `create-complete-doc`'s Protocol, which is why narrowing that citation to `#template` in #351 stranded nothing), while `schema-construct-inventory`, `planning-readme` and `workflow-retrospective` were operative. Three-in-four operative does not extrapolate from four.

Classifying all 69 is a read-and-decide pass, it is a prerequisite for the corpus route regardless, and it turns this from a judgement call into arithmetic: mostly operative-and-unique argues for variant C, mostly duplicates argues for deletions and no delivery change at all.

Decided either way, independent of the choice: the three cross-section dependencies become anchored links, and principle 30 or 32 gains the clause that content a section-scoped reader depends on lives in a section.

## References

- `src/utils/resource-delivery.ts` — `loadResourceDelivery`, the single function every section fetch resolves through; it splits `slug#anchor` via `parseResourceRef` and returns the heading's span via `extractMarkdownSection`.
- The delivery ledger's existing machinery for variant C: `newDeliveries['resource:<id>'] = hash` with `deliveredHash(state, ledgerKey, scope)`.

Refs #358

