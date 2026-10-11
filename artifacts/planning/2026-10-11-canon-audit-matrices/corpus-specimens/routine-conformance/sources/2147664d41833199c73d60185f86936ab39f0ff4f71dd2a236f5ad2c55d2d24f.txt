---
metadata:
  version: 1.0.0
---

## Capability

Stand up a throwaway checkout carrying source and no graph, so a case gated on an unindexed tree enters the build it exists to evidence and no repository anyone works in is touched.

## Outputs

### unbuilt_fixture_path

Filesystem path of the prepared checkout: `/tmp/conformance-unbuilt-fixture`. One path serves every walk, so the fixture is reused where it stands and a second tree never accumulates beside the first.

### unbuilt_fixture_graph_name

Name a build keys this checkout's graph under, which is the basename of its root: `conformance-unbuilt-fixture`.

## Protocol

### 1. Stand the Tree Up

- Make `{unbuilt_fixture_path}` a git checkout of its own: `git init` there, write a `.gitignore` holding `.gitnexus/`, write `src/greeting.js` carrying a pair of functions one of which calls the other, write `src/main.js` whose entry function calls into `src/greeting.js`, and commit all of it.
   > A tree already standing at that path is the tree this phase wants, and its files and its history stay as they are.
   > The call across the two files gives the graph a flow to hold beside its symbols, so counts and ranked reads taken off this fixture carry something.
   > `.gitnexus/` is the graph's own storage, written inside the checkout by the build the case runs. Holding it out of the history keeps the next phase's removal off the working tree's status.

### 2. Clear the Graph

- Remove `{unbuilt_fixture_path}/.gitnexus` and `{unbuilt_fixture_path}/.git/.workflow-gitnexus-refresh`, so the tree carries no graph and no signal standing against a build.
   > A graph is in the inventory while its storage is on disk. With the directory gone, `{unbuilt_fixture_graph_name}` is absent from the inventory, and a read addressed at it answers with an error naming the repository and listing the graphs that exist.

### 3. Land the Address

- Land the checkout root as `{unbuilt_fixture_path}` and its basename as `{unbuilt_fixture_graph_name}`, which the case binds as the tree its build walks and the graph its reads address.

## Rules

### the-fixture-is-its-own-checkout

`{unbuilt_fixture_path}` carries a `.git` directory of its own and sits outside every other checkout. A build resolves the path it is handed upward to the checkout root holding it, so a fixture sitting inside a working tree is walked and keyed as that working tree: one graph lands under the parent's name, `{unbuilt_fixture_graph_name}` stays absent from the inventory, and the build reports success. The case then measures another repository, and the read that confirms its build draws the same not-found error its first read drew.

### an-unindexed-tree-is-one-whose-storage-is-cleared

A build is what a tree with no graph provokes, and a graph the last walk built is a graph this walk finds. Clearing the storage is therefore what holds the fixture unindexed on the hundredth walk as on the first, and what keeps the case's build a build from nothing rather than a refresh of what stands.

### a-freshness-marker-outlives-the-graph-it-describes

A build touches `{unbuilt_fixture_path}/.git/.workflow-gitnexus-refresh` on success, and a build reaching a marker under 300 seconds old returns cached counts without walking the tree. Clearing the graph makes that marker's claim false, so the marker goes with it: a stale signal left standing suppresses the build the case exists to evidence, leaving the case to report a build that walked nothing.

### a-later-walk-meets-the-tree-already-there

A walk after the first finds the checkout standing and the graph an earlier walk's build landed. The preparation runs every phase regardless: the tree and its history stay as they are, the graph and its marker go, and the case's build is the first build over this tree again. The fixture is disposable at any moment — remove the directory and the next walk stands it up from the first phase.
