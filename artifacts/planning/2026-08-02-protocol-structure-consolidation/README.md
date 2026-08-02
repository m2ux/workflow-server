# Protocol structure — consolidation record

This folder is the investigation-detail home for the protocol-structure epic, which consolidates two issues about the same underlying gap: things authors already write inside a technique's `## Protocol` section that the server treats as plain prose — alternative sub-protocols, and inline calls to other techniques.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation folder |
|---|---|---|---|
| W1 — protocol variants | #395 | [issue-395-protocol-variants.md](./issue-395-protocol-variants.md) | [2026-08-02-technique-protocol-variants](../2026-08-02-technique-protocol-variants/) — machinery trace, 554-file corpus survey, agreed design with rejected alternatives, change inventory |
| W2 + W3 — inline technique folds | #394 | [issue-394-technique-folding.md](./issue-394-technique-folding.md) | [2026-08-02-inline-technique-fold-investigation](../2026-08-02-inline-technique-fold-investigation/) — composition pipeline trace, guard/canon/schema coverage survey, corpus survey with drift instances |

Each capture is the issue body verbatim at consolidation time, so the evidence, tables, and acceptance detail stay reachable after the issue closes.

## Why these two consolidate

- Both change the same loader path: how `## Protocol` sub-structure is parsed and preserved through to delivery.
- Both add guard checks over the same corpus surface (protocol text in the 554 technique files), measured against the same corpus head.
- Both end in a canon amendment (the anti-pattern catalog and the construct inventory must say the same thing the loader enforces).
- The fold doctrine decision (enforce the prohibition vs sanction declared folds) and the variant qualification rules are two halves of one question: what may a protocol delegate, and how is that delegation declared.

## Key numbers carried into the epic

- 554 technique files surveyed; zero mix numbered and unnumbered protocol sections, so variant validation lands with no migration; exactly one file needs a refile.
- 118 distinct inline call edges between techniques; 99 of them (84%) invisible to the activity layer; 56 call sites omit at least one required input of the technique they call; every link target exists — the rot is entirely in the contracts.
- Roughly 80% of the fold machinery already exists in the server, pointed at other targets.
