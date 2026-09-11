---
metadata:
  version: 1.2.0
---

## Capability

(Re)build the GitNexus index for a repository. Used at the start of a work package after the reference monorepo's submodules have been bumped to HEAD, and to recover from `index_not_found` / `index_stale` conditions.

## Inputs

### repo_path

Filesystem path of the tree to index. GitNexus walks the working tree from here and indexes every source file it encounters, including content that physically lives inside submodule directories, and keys the resulting index under this tree's basename — the name every later operation addresses its answers by.

### force_rebuild

Optional. Boolean. When true, rebuilds the index from scratch instead of incrementally updating. Defaults to false.

## Outputs

### stats

Post-analyze symbol / relationship / process counts emitted by the CLI

## Protocol

### 1. Lock and Check Freshness

- Coordinate concurrent invocations from sibling work packages: serialize via an exclusive flock on `{repo_path}/.git/.workflow-gitnexus-refresh.lock` (blocking). Concrete form: `flock {repo_path}/.git/.workflow-gitnexus-refresh.lock -c <command>`. The lock prevents two parallel analyze invocations from racing on the shared GitNexus index for this repo.
- Skip-if-recent (under the lock): check the mtime of `{repo_path}/.git/.workflow-gitnexus-refresh`. If it exists, was modified within the last 300 seconds, AND `{force_rebuild}` is not true, skip the analyze entirely — a sibling work package already (re)built the index and another rebuild adds no value. Release the lock and return cached `{stats}`.

### 2. Run Analyze

- Otherwise run `npx gitnexus analyze` (or `npx gitnexus analyze --force` when `{force_rebuild}` is true) inside `{repo_path}`. The CLI exits non-zero on failure; surface its stderr.  
  > - If `npx gitnexus` resolves to no binary (the gitnexus package is not installed), install it via `npm install -g gitnexus` (or the project-local equivalent), then retry.
  > - If the analyze CLI returns non-zero — typically a parser error inside the target codebase or an unsupported language — read the stderr; if it identifies a single offending file, exclude or fix it. For corrupted index state, retry with `force_rebuild=true`.

### 3. Signal and Verify

- On success, `touch {repo_path}/.git/.workflow-gitnexus-refresh` so subsequent invocations see the freshness signal. Release the lock. On a fresh repo with no prior index, the first analyze can take minutes — do not retry until exit. Subsequent incremental runs are seconds.
- After exit, optionally apply [verify-index](./verify-index.md) to confirm freshness — useful when chained immediately into a downstream comprehension or impact step.

## Rules

### index-every-addressed-tree

Index each tree whose answers a caller will ask for by name. A component folded only into a containing tree's index is reachable under that tree's name alone, so an operation addressing the component by its own name finds nothing.

A member of a repository group carries an index of its own for the same reason: the group addresses its members by their registry names, and [group-freshness](./group-freshness.md) reports a member that has none. Where a component is indexed both on its own and as part of a containing tree, both names resolve and answer at different scope — `address-a-named-graph` governs which to address.
