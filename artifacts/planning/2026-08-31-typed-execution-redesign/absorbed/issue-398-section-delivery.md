## Summary

A resource is a markdown file, and a citation that carries an anchor — `guide.md#template` — makes the server deliver just the section under that heading instead of the whole file. Design principle 32 makes the citation's grain a delivery decision: cite what you actually consult. Three gaps stand between that principle and the mechanism it rides on, and they compound: some section links that pass the repository's checks return nothing at runtime; a long tail of citations still delivers whole files where one section is consulted; and when a section *is* delivered on its own, the introductory framing its author wrote above the first heading is silently absent. This epic covers one work item per gap.

## The three gaps

**The checker and the server disagree about what a link means.** The guard that validates anchors implements GitHub's slug rules; the runtime resolver does not. Headings whose titles contain stripped symbols slug differently in each (the guard accepts a double-hyphen form the server returns nothing for), and duplicate headings — which GitHub disambiguates with numeric suffixes — are unreachable past the first occurrence. Both failure classes exist in the corpus today as guard-approved, runtime-null links. And because an anchor is a single flat slug, a repeated heading can never be addressed at all: one pattern-catalog resource carries seven identical Grep Patterns headings, of which only the first is reachable, so its consumer gives up on anchors and loads the whole 326-line file. The guard also has blind spots of its own — it never checks the resource lists inside activity files, and nested code fences flip it into skipping real links, one of which points at a file that does not exist.

**Citations outgrew what they consult.** 119 technique-resource pairs cite a resource whole, totalling 590,718 eagerly delivered characters. The provable-duplication class and the twenty largest pairs are already handled elsewhere; what remains is the tail — roughly one hundred pairs, each under about 8,000 characters, where each technique must be read to decide among three valid outcomes: point the citation at the sections it names, keep the whole-file citation because the technique genuinely reads most of the body, or split the resource. Recording a keep-whole verdict is as much a result as a rewrite. One of the two tells for this defect is mechanical — a bare citation in a technique that also anchors sections of the same resource — and belongs in a guard so the class cannot silently return.

**A delivered section loses its framing.** Of the 78 resources that have at least one anchored citer, 63 open with framing — 100 to 1,046 characters of text under the leading title — that no section-scoped read can reach. Measured samples show that framing is often operative, not decorative: a universal obligation to check prose against an inventory, a single-source constraint on what a document may contain, a structural rule about how an output nests. Two resources carry prose before any heading at all, two cited sections say "above" or "below" pointing at content outside their own span, and one borrows a glyph key defined in a different section. The fix is per resource, not uniform: framing that duplicates what the citing technique already states gets deleted; framing that is operative and unique gets a named section or moves to the technique; orientation-only framing stays, with the verdict recorded. A delivery-layer assist was costed in two variants, and one dominates: prepending framing to every fetch adds 67,045 characters with sixteen pathological cases where the framing outweighs the section it rides on; delivering framing once per agent context through the existing delivery ledger caps at 23,762 characters corpus-wide — six times cheaper for identical coverage. Whether that assist is worth building at all turns on classifying all 69 framings first: mostly operative argues for the ledger variant, mostly duplicate argues for deletions and no server change.

## The work

**W1 — Make resolution honest, then make it expressive.** One slug computation shared by the guard and the runtime (GitHub semantics: no space collapsing, numeric dedup suffixes), a regression test pinning parity, and the guard's blind spots closed — resource-list entries checked, nested fences handled. Then path-scoped anchors: a section reference may name a path of headings (`#parent/child`), resolved hierarchically, so repeated leaf headings become addressable through their parents. Single-segment references behave exactly as today, and their delivered text — which feeds the delivery-ledger content hashes — stays byte-identical. The protocol-structure epic works the neighbouring half of this surface: its reference guard (#397 W2) resolves the link kinds that carry no anchor — inline technique calls, dotted rule citations, bare resource links. Anchor semantics stay here, in the shared slugger, and whichever work item lands second builds on the first's shared module rather than introducing a parallel one.

**W2 — Disposition the citation tail.** Work the ranked tail of whole-file citations, recording one of the three outcomes per pair with the reasoning. Add the mechanical guard for the bare-plus-anchored tell. Two sites stay excluded by design: their consulted sections total more than the file, so whole-file is the economical delivery.

**W3 — Classify the framings, then fix per class.** A read-and-decide pass over all 69 framings, then: deletions where the technique already carries the content, named sections or relocation where the framing is operative and unique, recorded leave-verdicts for orientation. The three genuine cross-section dependencies become anchored links regardless. Decide the ledger-keyed delivery variant on the measured distribution. The canon gains the missing clause — content a section-scoped reader depends on lives in a section — and the anti-pattern catalog gains its mechanical detection.

## Why now is cheap

Every measurement is fresh and reproducible by script against the current corpus. The runtime-null links are a live correctness bug — the longer they stand, the more citations are written against slugs that resolve nowhere. The grain principle and its anti-pattern entry landed recently, so the tail is bounded: the guard from W2 stops it regrowing, and the framing clause from W3 stops new resources being written with unreachable openings. And no path-style anchor exists anywhere in the corpus yet, so W1's extension is greenfield — adopted at leisure, breaking nothing.

## Acceptance criteria

- [ ] One slugger for guard and runtime; the known guard-approved, runtime-null corpus links resolve; a regression test pins parity.
- [ ] Path-scoped section references resolve hierarchically, fence-aware, with clear errors naming the failing segment; single-segment references are byte-identical to today, ledger hashes unchanged.
- [ ] The anchor guard covers resource-list entries and nested fences; the mechanical whole-file tell is guarded so the class cannot return.
- [ ] Every pair in the citation tail carries a recorded disposition (cite-section, keep-whole, or split), and the two oversized exclusions are documented as deliberate.
- [ ] All 69 framings are classified with per-resource verdicts; the deletions, new sections, and relocations implied by the classification are applied; the three cross-section dependencies are anchored links.
- [ ] A written decision on the ledger-keyed framing delivery, made after the classification, with the cost numbers carried into it.
- [ ] The canon clause and the new anti-pattern entry land with the corpus changes, so the rule and the corpus agree.

## Non-goals

- No refactoring of specific resource files beyond what the dispositions call for — merging or splitting referencers onto per-pattern anchors stays optional follow-up work.
- No changes to eager-bundling budgets or to which steps are gated; the two delivery-economics sites already routed to server-side ledger work stay there.
- No new delivery semantics beyond the single framing decision — the prepend-on-every-fetch variant is rejected on its measured cost, not deferred.

## Tracking

Each work item is delivered as its own pull request when picked up:

- [ ] W1 — shared slugger, guard reach, path-scoped anchors
- [ ] W2 — citation-tail dispositions plus the mechanical guard
- [ ] W3 — framing classification, per-class fixes, delivery decision, canon clause

Consolidates #141 (W1), #358 (W2), and #359 (W3); all three bodies are captured verbatim in the planning folder.

## Investigation detail

Full record — grouping rationale, verbatim issue captures with the reproduction cases and cost tables, and the link to the prior framing-classification session folder:
**[engineering/artifacts/planning/2026-08-02-section-grain-delivery-consolidation](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-08-02-section-grain-delivery-consolidation)**



