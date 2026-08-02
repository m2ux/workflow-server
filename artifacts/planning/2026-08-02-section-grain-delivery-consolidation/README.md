# Section-grain delivery — consolidation record

This folder is the investigation-detail home for the section-delivery epic, which consolidates three issues about one mechanism: a citation like `resource.md#anchor` makes the server deliver a single section of a resource file, and that mechanism currently fails its readers in three distinct ways — resolution, grain, and self-sufficiency.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation folder |
|---|---|---|---|
| W1 — resolution: one slugger, path-scoped anchors | #141 | [issue-141-path-scoped-section-references.md](./issue-141-path-scoped-section-references.md) | — (evidence and reproduction cases are in the capture) |
| W2 — grain: the whole-file citation tail | #358 | [issue-358-whole-file-citation-tail.md](./issue-358-whole-file-citation-tail.md) | — (ranked tail table is in the capture) |
| W3 — self-sufficiency: framing outside any section | #359 | [issue-359-section-stratification.md](./issue-359-section-stratification.md) | [2026-07-31-section-stratification-359](../2026-07-31-section-stratification-359/) — framing classification, findings register, scope manifest |

Each capture is the issue body verbatim at consolidation time, so the measurements, cost tables, and per-site dispositions stay reachable after the issue closes.

## Why these three consolidate

- All three live in the same delivery path: the reference parser that splits `slug#anchor`, the section extractor that returns a heading's span, and the guard that validates anchors.
- W1 changes what an anchor can say and guarantees it resolves; W2 changes which anchors citations use; W3 changes what a resolved section must carry. Landing them separately risks churning the same files and the same ledger hashes three times.
- The one shared hard constraint spans all three: delivered full text for existing single-segment references must stay byte-identical, because it feeds the delivery-ledger content hashes.

## Key numbers carried into the epic

- Two classes of corpus links pass the guard but return nothing at runtime (space-collapsing and duplicate-heading suffixes); one resource file carries seven identical `Grep Patterns` headings of which only the first is reachable.
- 119 technique-resource pairs cite a resource whole, totalling 590,718 eager characters; the remaining tail is roughly one hundred pairs, each under about 8,000 characters.
- 78 resources have at least one anchored citer; in 63 of them the opening framing (100–1,046 characters) is unreachable by any section-scoped read; 69 framings need classification.
- Delivery-layer options costed: prepend-on-every-fetch adds 67,045 characters across distinct pairs with 16 pathological cases at or above 100% overhead; ledger-keyed once-per-context delivery caps at 23,762 characters corpus-wide — six times cheaper for identical coverage.
