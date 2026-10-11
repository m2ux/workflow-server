# Integration drift

The review captured the corpus at `e70b4477` and this implementation applied its recommendations there. `workflow/technique-vocabulary` is 343 commits behind `origin/workflows` and 9 ahead, so the applied wording is not yet expressed against the canon the integration target carries. Measured by [drift.py](drift.py) on 2026-10-11.

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

## Proposed

[#1297](https://github.com/m2ux/workflow-server/pull/1297) carries the nine commits onto `workflows`. It does not merge cleanly — GitHub reports it dirty, which is what the Fires-on index touching every entry comes to while this branch rewrites and renumbers them. The reconciliation above is review's to settle, because whose wording survives on the overlapping entries is a judgment call rather than a mechanical merge.

## Limits

This measures the two canon homes and the files citing them. It does not measure whether the 343 upstream commits changed definitions that the rewritten criteria judge, and it does not establish that a merge resolves cleanly — only which entries both sides touched.
