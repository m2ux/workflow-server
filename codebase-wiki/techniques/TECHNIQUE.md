---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 1.0.0
---

## Capability

Shared base contract for the codebase-wiki techniques. Any Inputs, Outputs, or Rules defined here are inherited by every technique in this workflow. A Protocol here WRAPS each descendant's own protocol: blocks titled `Initial` are placed before, blocks titled `Final` after, and the server renumbers the combined sequence; any other protocol block here is delivered only when this contract is referenced directly. The wrap is recursive — every ancestor container contributes its `Initial`/`Final`.

The wiki operations are STANDALONE top-level techniques, not a group — there is one operation cluster, so the workflow-root base carries the shared contract directly rather than a group `TECHNIQUE.md`. The technique set is implied by the folder contents; do not list techniques here. Other workflows bind these operations cross-workflow with the slash form `codebase-wiki/<op>` (for example `codebase-wiki/ingest`, `codebase-wiki/query`), exactly as a standalone technique in any other workflow is referenced. Keep this contract minimal: only genuinely cross-technique material belongs here.

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
