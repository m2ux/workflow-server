---
metadata:
  version: 1.5.0
---

## Capability

(Re)build the GitNexus index for a repository — before the first answer a run takes from its graph, after the tree it was built from has moved, and to recover from `index_not_found` / `index_stale` conditions.

## Inputs

### repo_path

Filesystem path of the tree to index. GitNexus walks the working tree from here and indexes every source file it encounters, including content that physically lives inside submodule directories.

The build keys its index under the basename of the git checkout holding this path, which is this path only where it is a checkout's own root. A directory inside a checkout resolves upward to that checkout: the whole of it is walked, the graph is keyed under its name, and nothing is registered under the name of the directory given — the build reporting success either way. Name a checkout root here, and settle which name a graph landed under by reading the inventory rather than by reading the exit status.

### force_rebuild

*(optional)* Whether the rebuild starts from scratch rather than updating what the index already holds.

#### default

`false`

### pdg_layers

*(optional)* Whether the build records the program-dependence layers — control flow, reaching definitions, control dependence and taint — that the taint findings and the dependence query answer from. A graph built without them answers those with a note naming the missing layer.

#### default

`false`

## Outputs

### stats

Post-analyze symbol / relationship / process counts emitted by the CLI

## Protocol

### 1. Lock and Check Freshness

- Resolve the checkout root holding `{repo_path}` — `git -C {repo_path} rev-parse --show-toplevel` — and hold the lock and the freshness signal there. That root is the tree the build walks and the name the graph lands under, and it is the only path of the two with a `.git` directory to hold either file: a `{repo_path}` inside a checkout has none, and this phase reaches for one exactly when the tree carries no graph yet, which is when a component path is most likely what was named.
- Coordinate concurrent invocations from sibling runs against one tree: serialize via an exclusive flock on `<root>/.git/.workflow-gitnexus-refresh.lock` (blocking). Concrete form: `flock <root>/.git/.workflow-gitnexus-refresh.lock -c <command>`. The lock prevents two parallel analyze invocations from racing on the shared GitNexus index for this repo.
- Skip-if-recent (under the lock): check the mtime of `<root>/.git/.workflow-gitnexus-refresh`. If it exists, was modified within the last 300 seconds, AND `{force_rebuild}` is not true, skip the analyze entirely — a sibling run already (re)built the index and another rebuild adds no value. Release the lock and return cached `{stats}`.

### 2. Run Analyze

- Otherwise run `node .gitnexus/run.cjs analyze --index-only` inside `{repo_path}`, adding `--force` when `{force_rebuild}` is true and `--pdg` when `{pdg_layers}` is true. The CLI exits non-zero on failure; surface its stderr.
  > - `--index-only` writes the graph and nothing else; the agent context files and skills the CLI can drop into the tree are outside this operation.
  > - The runner at `.gitnexus/run.cjs` is written by a build and ignored by git, so a fresh clone carries none. Where `node` reports it missing, run `npx gitnexus analyze` with the same flags, which regenerates it.
  > - If the analyze CLI returns non-zero — typically a parser error inside the target codebase or an unsupported language — read the stderr; if it identifies a single offending file, exclude or fix it. For corrupted index state, retry with `force_rebuild=true`.

### 3. Signal

- On success, `touch <root>/.git/.workflow-gitnexus-refresh` so subsequent invocations see the freshness signal. Release the lock. On a fresh repo with no prior index, the first analyze can take minutes — do not retry until exit. Subsequent incremental runs are seconds.

## Rules

### a-rebuilt-index-reaches-a-reader-on-reload

A completed rebuild publishes the graph to disk, and a running server reopens a published replacement at its next check, which runs at most once every five seconds. A read taken inside that window still answers from the previous graph and reports it stale, so every answer drawn from it describes the tree as it was — the rebuild succeeded and the reader has not met it. Treat the second read rather than the exit status as what says the graph is current.

### index-every-addressed-tree

Index each tree whose answers a caller will ask for by name. A component folded only into a containing tree's index is reachable under that tree's name alone, so an operation addressing the component by its own name finds nothing.

A component a checkout holds as a plain directory is reachable only that way, whatever path a build is handed: the build resolves to the checkout and keys one graph under it. A component earns a name of its own by being a checkout of its own — a submodule or a separate clone — so a build aimed at a plain subdirectory answers the question "does this component have a graph" with no, however many times it is run.

A member of a repository group carries an index of its own for the same reason: the group addresses its members by their registry names, and a group's freshness report marks a member with no graph as `missing`. Where a component is indexed both on its own and as part of a containing tree, both names resolve and answer at different scope — `address-a-named-graph` governs which to address.
