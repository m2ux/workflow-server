# Integration drift

The review captured the corpus at `e70b4477`, the tip of a branch whose pull request had merged on 25 September. `origin/workflows` had moved 343 commits past it, so the recommendations were written against a canon two weeks stale and this implementation first applied them there. Measured by [drift.py](drift.py) on 2026-10-11.

The branch is now rebased onto `origin/workflows` at `d5e2ace11c66`: 0 behind, 9 ahead. Every item below is settled, and the record of how is in [Settled](#settled).

## Why the base was wrong

`e70b4477` is an ancestor of `origin/workflows` — history the target already contains. Pull request #931 merged this branch on 25 September and nothing touched it afterwards, so its tip was a finished branch rather than the live canon. The capture verified its bytes against the review's own hashes, which establishes consistency with the review and says nothing about currency. No fetch compared it with `origin/workflows` until after the corrections were applied and pushed.

## What moved upstream

| Change | Effect |
| --- | --- |
| Fires-on index (I09) | Every `###` entry, every principle and every convention section gained a `**Fires on:**` line between its prose and **Detect**, under a new `### Fires-on line` creation rule. Additive, and the reason a whole-body comparison reports all 161 entries as changed. |
| Manual-review entries promoted | The four `MR-` entries are now `AP-` entries and the `MR-` designator note is gone, so upstream renumbered the catalog as this work did. |
| One entry added | `inherited-input-never-spent`: a container input a descendant never spends. |
| `decision` retired for `exits` | An activity declares `exits`, each bound in the workflow `graph`, in place of an activity-level `decision` with `branches`/`conditions`. |
| Carve-outs added | `hoist-universal-techniques` (a technique the worker contract delivers, `variable-binding` among them), `backtick-code-tokens` (a heading token a guard parses by pattern), `runtime-rules-only` (an authoring technique's rules for the definitions it drafts), `pass-orchestration-in-technique` (a borrowed activity file), `technique-ref-in-io-contract`. |

Operative text — the intro sentence and the Detect / Do not flag / Fix triad, with the Fires-on line discounted — moved on 8 anti-patterns and 2 principles. Seven of those anti-patterns and both principles are entries this work also rewrote.

## What a merge has to reconcile

- **The retired construct.** Five sentences on this branch name an activity-level `decision`: `decision-not-prose` intro, Detect and Fix; the `no-activity-prose-rules` Fix; and the `structure-backed-constraints` Detect. Upstream states each as an exit `when` bound in the `graph`. Left as they are past a merge, they describe a construct the schema no longer carries, which reads as current fact. `Encode Constraints as Structure` needs the same mechanism list, where this work's rewrite dropped it.
- **Upstream carve-outs inside rewritten blocks.** The `hoist-universal-techniques` Do not flag was replaced here, so upstream's worker-contract exemption has no landing place and must be folded back. `runtime-rules-only` is the same shape, and its upstream carve-out says what AE-21 says, so one sentence covers both.
- **The Fires-on line.** The three retired entries take their lines with them; `validate-committed-bytes` needs one, and `verify-format-literacy` keeps its own.
- **The renumbering.** Both sides renumbered independently, so the merged file is renumbered once more. [renumber.py](renumber.py) keys on the stable entry name rather than the old number, so it re-runs against the merged file without change.

## Settled

The nine commits are rebased onto `origin/workflows`, and [#1297](https://github.com/m2ux/workflow-server/pull/1297) carries them. Conflicts fell into two kinds. The Fires-on index put its line directly above **Detect**, so a commit rewriting Detect conflicted on adjacency alone; [resolve_fires_on.py](resolve_fires_on.py) resolved those by taking the line and this branch's text, and left any hunk whose upstream side differed from the base otherwise. Fifty-three resolved that way. The rest were decisions:

| Entry | Settled as |
| --- | --- |
| `decision-not-prose` | Upstream's Detect. It already names exits bound in the graph and is subject-scoped, so the review's rewrite would only have reintroduced the retired construct. The review's exception merged cleanly and stands. |
| `structure-backed-constraints` | Upstream's construct list, including the exit `when`, inside the review's criticality test. The review's Fix names no construct, so it stands. |
| `hoist-universal-techniques` | Both carve-outs. The review generalised the proper-subset test; upstream exempted a technique the worker contract delivers. |
| `runtime-rules-only` | One sentence carrying both, since upstream's carve-out and AE-21's say the same thing from different angles. |
| `Encode Constraints as Structure` | The review's boundary framing with upstream's full mechanism list restored, which is the item this record flagged as missing. |
| `A Workflow Borrows Activities` | Upstream's narrowed statement and retitling, with the citation to `Prefer Shared Capability` that PD-18 asked for. |
| `unproducible-declared-value` | The review's Fix, with upstream's newly appended `inherited-input-never-spent` kept after it. |

The renumbering was regenerated rather than merged: `renumber.py` keys on entry name, so it ran once over the rebased file. Upstream had already moved the citing files off `#ap-NN-name` anchors onto bare kebab names, so no citation needed repointing and the change touches two files rather than four.

## Limits

This measures the two canon homes and the files citing them. It does not measure whether the 343 upstream commits changed definitions that the rewritten criteria judge, and it does not establish that a merge resolves cleanly — only which entries both sides touched.
