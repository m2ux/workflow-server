# Walk G confirmation

23 paths read, 0 unread. 18 findings. Three Highs re-derived.

| ID | Result | Why |
| --- | --- | --- |
| G1 | holds | `sec-vuln-url-input` option `provided` declares no `recordReply`. The engine stores a typed reply only on that field and refuses a reply without it. The following `set` names `sec_vuln_url` and has no `value`. The same shape is on the private-fork and short-id gates. |
| G2 | withdrawn | `count-revision-round` tells the worker to increment `revision_round`. The schema has no increment operator. Principle 5 forbids prose that restates structure the schema already holds, and this message states a derivation the schema does not hold. |
| G3 | withdrawn | `bump-scope-round` is the same worker derivation for `scope_round`. |
| G6 | holds | The remediate-vuln mermaid draws `prism-decision --> post-impl-review`. The graph's `prism-decision.done` is `code-review`, `structural-analysis`, and `test-suite-review`. |
| G8 | holds | `ingest.md` and `query.md` still `Apply` other techniques, including the cross-link call written with its arguments. AP-114. A step that passes those arguments satisfies AP-145 as well. |

The other Mediums stay as written in `walk-G.md`.
