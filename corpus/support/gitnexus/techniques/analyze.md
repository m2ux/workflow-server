---
metadata:
  version: 2.1.0
---

## Capability

(Re)build the GitNexus index for a repository — before the first answer a run takes from its graph, after the tree it was built from has moved, and to recover from `index_not_found` / `index_stale` conditions.

## Inputs

### repo_path

Filesystem path of the tree to index. GitNexus walks the working tree from here and indexes every source file it encounters, including content that physically lives inside submodule directories.

The build keys its index under the basename of the git checkout holding this path. A directory inside a checkout resolves upward to it: the whole checkout is walked and keyed under its name, nothing under the directory given, and the build reports success either way.

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

- Resolve the checkout root holding `{repo_path}` — `git -C {repo_path} rev-parse --show-toplevel` — and hold the lock and the freshness signal there: a `{repo_path}` inside a checkout has no `.git` directory to hold either file.
- Serialize sibling runs against one tree on a blocking exclusive flock: `flock <root>/.git/.workflow-gitnexus-refresh.lock -c <command>`.
- Under the lock, check the mtime of `<root>/.git/.workflow-gitnexus-refresh`: where it is under 300 seconds old and `{force_rebuild}` is not true, release the lock and return cached `{stats}` without analyzing.

### 2. Run Analyze

- Otherwise run `node .gitnexus/run.cjs analyze --index-only` inside `{repo_path}`, adding `--force` when `{force_rebuild}` is true and `--pdg` when `{pdg_layers}` is true. The CLI exits non-zero on failure; surface its stderr.
  > - `--index-only` writes the graph and nothing else; the agent context files and skills the CLI can drop into the tree are outside this operation.
  > - The runner at `.gitnexus/run.cjs` is written by a build and ignored by git, so a fresh clone carries none. Where `node` reports it missing, run `npx gitnexus analyze` with the same flags, which regenerates it.
  > - If the analyze CLI returns non-zero — typically a parser error inside the target codebase or an unsupported language — read the stderr; if it identifies a single offending file, exclude or fix it. For corrupted index state, retry with `force_rebuild=true`.

### 3. Signal

- On success, `touch <root>/.git/.workflow-gitnexus-refresh` and release the lock. A first analyze on a repo with no prior index can take minutes — do not retry until exit; incremental runs are seconds.

### 4. Confirm the Graph's Name

- Read the inventory of indexed graphs for the name this build landed under, which the exit status does not give.

## Rules

### a-rebuilt-index-reaches-a-reader-on-reload

A completed rebuild publishes the graph to disk, and a running server reopens the replacement at its next check, at most once every five seconds. A read inside that window answers from the previous graph and reports it stale, so what says the graph is current is the second read rather than the exit status.

### a-graph-carries-the-layers-of-its-last-build

A graph carries the program-dependence layers of the build that wrote it last, so `{pdg_layers}` is the state a build leaves behind rather than a request added to what is already there. A build that omits it rebuilds the graph without those layers, and the taint findings and the dependence query go from answering to reporting a missing layer — including where the build is one a refresh run performs on a caller's behalf.

### a-settings-file-beside-a-tree-sets-its-build-defaults

A build reads a settings file sitting beside the tree it walks and takes what that file holds as the settings for that build. A tree whose answers depend on the program-dependence layers carries the pin there, so every build over it records them — including one a run performs on a caller's behalf, which is where no flag the caller passes reaches. The file is JSON, so the layers are pinned with a quoted key set true; a key written unquoted is read as nothing and the build proceeds without it.

### a-graph-answers-only-under-its-own-name

A tree's answers are reachable under the name its own index is keyed under and no other. A component folded only into a containing tree's index is reachable under that tree's name alone, so an operation addressing the component by its own name finds nothing.

### a-component-carries-a-name-where-it-is-a-checkout

A component a checkout holds as a plain directory is reachable under that checkout's name, whatever path a build is handed: the build resolves to the checkout and keys one graph under it. A component carries a name of its own where it is a checkout of its own — a submodule or a separate clone.

### a-group-member-carries-an-index-of-its-own

A repository group addresses its members by their registry names, so a member with no graph of its own is one the group's freshness report marks `missing`. Where a component is indexed both on its own and inside a containing tree, both names resolve at different scope — `an-answer-carries-the-graph-it-came-from` governs which to address.
