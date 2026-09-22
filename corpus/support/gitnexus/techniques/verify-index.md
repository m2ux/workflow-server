---
metadata:
  version: 3.6.0
---

## Capability

Read the GitNexus index context resource for the target repo: what the graph holds, and whether it still describes the tree it was built from.

## Outputs

### stats

File, symbol and process counts — three integers. Relationship counts sit outside this resource, in the indexed-graph inventory.

### index_commit

The commit the graph was built at, which names the tree state every answer from this graph describes.

### index_stale

Whether the graph is behind the tree it was built from, derived from the resource rather than reported by it: true where the read carries a `staleness` string, and true where the read returns an error instead of a document.

## Protocol

### 1. Read the Graph's Context

- Read the MCP resource `gitnexus://repo/{repo_name}/context` and record its `stats` mapping as `{stats}` and the `commit` of its `index` mapping as `{index_commit}`.
   > The `index` mapping also carries `indexed_at`, the `content_retention` the graph was built with, `source_available` and `incomplete_reasons`; a non-empty `incomplete_reasons` is a graph whose build stopped short, and names where.

### 2. Derive the Freshness Verdict

- Derive `{index_stale}` from the same read: a `staleness` string — `"⚠️ Index is 176 commits behind HEAD. Run analyze tool to update."` — names how far the graph trails HEAD, and the key is absent where it stands at HEAD, so `{index_stale}` is false exactly where nothing was carried. Carry the string where the distance matters.
   > The graph inventory shapes the same reading as a mapping of `status`, `commitsBehind` and a `hint`, so a binding reading one shape against the other finds nothing.

### 3. Read an Error as No Graph

- Read an error arriving in place of a document as no graph under this name: `{index_stale}` is true and `{stats}` is empty. It names the graphs that do exist, so settle from that list whether the name is misspelt — read again under the spelling it gives — or unindexed, which needs a build.

### 4. Carry the Verdict Forward

- Carry `{index_stale}` and `{index_commit}` as the age of every answer taken from this graph afterwards.
