# Protocol structure — consolidation record

This folder is the investigation-detail home for the protocol-structure epic, which consolidates two issues about the same underlying gap: things authors already write inside a technique's `## Protocol` section that the server treats as plain prose — alternative sub-protocols, and inline calls to other techniques.

## Consolidated issues

| Work item | Issue | Capture in this folder | Prior investigation folder |
|---|---|---|---|
| W1 — protocol variants | #395 | [issue-395-protocol-variants.md](./issue-395-protocol-variants.md) | [2026-08-02-technique-protocol-variants](../2026-08-02-technique-protocol-variants/) — machinery trace, 554-file corpus survey, agreed design with rejected alternatives, change inventory |
| W2 + W3 — inline technique folds | #394 | [issue-394-technique-folding.md](./issue-394-technique-folding.md) | [2026-08-02-inline-technique-fold-investigation](../2026-08-02-inline-technique-fold-investigation/) — composition pipeline trace, guard/canon/schema coverage survey, corpus survey with drift instances |
| W4 — variant parity | #432 | [issue-432-variant-parity.md](./issue-432-variant-parity.md) | [2026-08-04-solid-affinity](../2026-08-04-solid-affinity/) — the search method, the three variant sets, the four arms' contracts side by side, and two originating claims that did not reproduce |

Each capture is the issue body verbatim at consolidation time, so the evidence, tables, and acceptance detail stay reachable after the issue closes.

W4 joined on 6 August 2026 and closed on joining. Its own non-goals had already made it conditional on W1: if declared protocol variants land first, the catalogue entry keys on that construct rather than growing its own way to find sibling arms. Folding it in settles the condition and puts the entry in the hands of whoever builds the construct. It also completes this epic's coverage of alternatives — W1 gives them a structural home, W4 gives the catalogue a test for the seam where they meet a common consumer.

## Doctrine decision

The fold doctrine W3 depended on is settled: **declared folds are sanctioned, bounded by the visibility rule** — a call whose outcome stays inside the caller may fold; a call whose outcome the workflow acts on must be an activity step. The full decision record — twenty-five decision rows across seven review rounds, with rejected alternatives, rationale, accepted residual risks, the #405 ancestry direction, and consequences for W2/W3 scope — is in [doctrine-decision.md](./doctrine-decision.md) (decided 2026-08-02; per-edge disposition of the 118 edges remains pending the W2 guard inventory; two rows chose differently from the recommendation: the guard lands stricter, fold reach lands broader). A closing proportionality review resequenced delivery: checker first, reference-closure delivery next (W3a), with the verified call seam (W3b) contingent on post-closure evidence and restricted to operation-grade callees — a shape grade within the one technique kind, not a new file type.

## Why these two consolidate

- Both change the same loader path: how `## Protocol` sub-structure is parsed and preserved through to delivery.
- Both add guard checks over the same corpus surface (protocol text in the 554 technique files), measured against the same corpus head.
- Both end in a canon amendment (the anti-pattern catalog and the construct inventory must say the same thing the loader enforces).
- The fold doctrine decision (enforce the prohibition vs sanction declared folds) and the variant qualification rules are two halves of one question: what may a protocol delegate, and how is that delegation declared.

## Key numbers carried into the epic

- 554 technique files surveyed; zero mix numbered and unnumbered protocol sections, so variant validation lands with no migration; exactly one file needs a refile.
- 118 distinct inline call edges between techniques; 99 of them (84%) invisible to the activity layer; 56 call sites omit at least one required input of the technique they call; every link target exists — the rot is entirely in the contracts.
- Roughly 80% of the fold machinery already exists in the server, pointed at other targets.
- Zero containers in any of the 16 workflows author an `Initial`/`Final` wrap block (2026-08-02 survey), so the fold's "rules yes, wrap no" carriage loses nothing at adoption — and W1 reserves those two titles out of variant interpretation.
- The two technique delivery paths disagree about cross-workflow container ancestry (#405); fold carriage names the callee's source ancestry explicitly.
