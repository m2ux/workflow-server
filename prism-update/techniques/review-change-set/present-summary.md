---
metadata:
  version: 1.1.0
---

## Capability

Present a categorized change set to the user as a reviewable summary, with per-prism detail for new entries and the referencing files each rename or deletion breaks.

## Protocol

### 1. Present Change Summary

- Display a categorized change table from `{change_set}`: a row per entry under each of the new, modified, renamed, and deleted categories.
- For each entry in `{change_set}.new`, show its per-prism detail: family, `optimal_model`, and `quality_baseline`.

### 2. Show What Each Rename And Deletion Breaks

- Apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[resolve-graph](../../../meta/techniques/gitnexus-operations/resolve-graph.md)(tree_path: the tree holding `{resource_path}`) and take its `{repo_name}` as the graph addressed below. An empty `{repo_name}` leaves this step to the stale-name grep the verify activity runs, and the summary says the column is unmeasured rather than empty.
- For each entry in `{change_set}.renamed` and `{change_set}.deleted`, apply [gitnexus-operations](../../../meta/techniques/gitnexus-operations/TECHNIQUE.md)::[reference-lookup](../../../meta/techniques/gitnexus-operations/reference-lookup.md)(target_file_path: the entry's `resource_file`, repo_name: `{repo_name}`) and show its `{referencing_files}` against that entry's row — the files whose links resolve to a resource that is about to move or go away.
  > - The lookup runs here, while every `resource_file` still stands at the path the index records. Once the rename and the removal are applied the old paths are gone, and the same lookup answers about a file that no longer exists.
  > - A file naming a resource in prose without linking to it carries no edge, per `links-are-the-only-references`, so a short list bounds the links rather than the references.
