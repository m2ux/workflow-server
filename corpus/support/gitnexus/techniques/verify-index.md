---
metadata:
  version: 3.3.0
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

The two surfaces carrying that reading shape it differently. This resource carries a sentence naming the distance; the graph inventory carries a mapping of `status`, `commitsBehind` and a `hint`. A binding reading one shape against the other finds nothing, and the verdict is the same on both: the reading rides a graph that trails its tree and is absent from one standing at the commit it was built at.

## Protocol

### 1. Read the Graph's Context

- Read the MCP resource `gitnexus://repo/{repo_name}/context` and record its `stats` mapping as `{stats}` and the `commit` of its `index` mapping as `{index_commit}`.
   > The `index` mapping also carries `indexed_at`, the `content_retention` the graph was built with, `source_available` and `incomplete_reasons`; a non-empty `incomplete_reasons` is a graph whose build stopped short, and names where.

### 2. Derive the Freshness Verdict

- Derive `{index_stale}` from the same read: the resource carries a `staleness` string — `"⚠️ Index is 176 commits behind HEAD. Run analyze tool to update."` — naming how far the graph trails HEAD, and omits the key altogether where the graph is current. An absent key is the freshness verdict, so `{index_stale}` is false exactly where nothing was carried. Carry the string itself into the answer where the distance matters, the count of commits being the age of the evidence.

### 3. Read an Error as No Graph

- Read an error naming the repository, which arrives in place of a document and lists the graphs that do exist, as no graph covering this name: `{index_stale}` is true and `{stats}` is empty. Settle from that list whether the name is unindexed or misspelt: a misspelt name is read again under the spelling the list gives, and an unindexed tree has no graph to read until one is built.

### 4. Carry the Verdict Forward

- Carry `{index_stale}` and `{index_commit}` as the age of every answer taken from this graph afterwards.
