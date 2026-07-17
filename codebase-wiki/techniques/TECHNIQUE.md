---
metadata:
  version: 1.0.0
---

## Capability

Shared Inputs, Outputs, and Rules for every codebase-wiki technique.

## Inputs

### wiki_path

Root of the wiki tree — the directory holding `index.md`, `log.md`, `overview.md`, and the typed-page subfolders (`concepts/`, `entities/`, `sources/`, `comparisons/`). Bound as `target_dir` whenever a technique delegates a page write to `work-package::manage-artifacts::write-artifact`.

### raw_baseline_commit

The pinned source commit every citation is relative to. The raw baseline is the source tree at this commit, referenced in place — there is no physical copy. Citations are repo-relative source paths interpreted against this commit.

## Rules

### immutable-raw-baseline

The raw baseline is immutable — it is the source tree at the pinned `raw_baseline_commit` and is never edited or copied. Citations reference repo-relative source paths at that commit; reproducibility and change-tracking come from git, not from a snapshot under the wiki.

### every-claim-cites-a-source

Every wiki claim cites a raw source path. No claim is recorded without a citation to the source it rests on, in the form defined by the [citation conventions](../resources/citation-conventions.md).

### every-claim-carries-confidence

Every wiki claim carries a confidence score of `high`, `medium`, or `low`, per the confidence vocabulary in the [citation conventions](../resources/citation-conventions.md). A claim without a confidence score is not recorded.

### index-and-log-on-every-mutation

`index.md` and `log.md` are maintained on every mutation — the catalog and the append-only operation ledger never fall behind the pages. Any operation that creates or updates a page also updates the index and appends the log in the same pass.

### contradictions-surfaced-at-lint

Contradictions between pages or claims are surfaced at lint, not silently reconciled. An ingest that encounters a conflicting prior claim records both and leaves reconciliation to the lint pass and the user.

### knowledge-compounds

Knowledge compounds across operations — each ingest augments the existing wiki rather than rebuilding it. Existing pages are updated in place with new sections and deeper detail; prior content is preserved unless a cited source contradicts it.

### hierarchical-navigation

Read `index.md` and follow `[[wikilinks]]` to the relevant pages rather than loading the whole wiki. Hierarchical navigation, not brute-force context loading, is how every operation locates the pages it needs.
