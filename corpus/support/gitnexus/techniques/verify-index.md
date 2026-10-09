---
metadata:
  version: 4.0.0
---

## Capability

Read what the target repo's graph holds, and whether it still describes the tree it was built from.

## Outputs

### stats

What the graph holds — its file, symbol, relationship, community and flow counts.

### index_commit

The commit the graph was built at, which names the tree state every answer from this graph describes.

### index_stale

Whether the graph is behind the tree it was built from, derived from the inventory entry rather than reported by it: true where the entry carries a `staleness` mapping, and true where no entry carries `{repo_name}` at all.

## Protocol

### 1. Find the Graph in the Inventory

- Call `gitnexus_list_repos { limit, offset }` and take the entry whose `name` is `{repo_name}`; record its `stats` as the `{stats}` and its `lastCommit` as the `{index_commit}`.
   > The inventory arrives a page at a time. While a page's `pagination.hasMore` is true, call again with `offset` set to its `pagination.nextOffset`; a graph is absent only once the last page has been read. The entry also carries the tree it was built from, when it was built, the `contentRetention` it was built with, and whether its source is still available.

### 2. Derive the Freshness Verdict

- Derive `{index_stale}` from the same entry: a `staleness` mapping — `status`, `commitsBehind` and a `hint` — rides only an entry that trails its tree, and the key is absent where the graph stands at HEAD, so `{index_stale}` is false exactly where nothing was carried. Carry `commitsBehind` where the distance matters.
   > `status` separates three standings a rebuild answers differently: `behind` carries the commit count, `diverged` is a recorded commit the clone's history no longer holds, and `unknown` is a tree with no history to measure — unmeasurable rather than stale.

### 3. Read an Absent Entry as No Graph

- Read a `{repo_name}` no entry carries as no graph under this name: `{index_stale}` is true and `{stats}` is empty. The inventory names the graphs that do exist, so settle from that list whether the name is misspelt — read again under the spelling it gives — or unindexed, which needs a build.

### 4. Carry the Verdict Forward

- Carry `{index_stale}` and `{index_commit}` as the age of every answer taken from this graph afterwards.
