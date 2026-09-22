---
metadata:
  version: 1.0.0
---

## Capability

Stand up a throwaway checkout whose graph trails its working tree by a commit, so a case gated on a stale index enters the rebuild it exists to evidence and no repository anyone works in is touched.

## Outputs

### stale_fixture_path

Filesystem path of the prepared checkout: `/tmp/conformance-stale-fixture`. One path serves every walk, so the fixture is reused where it stands and a second tree never accumulates beside the first.

### stale_fixture_graph_name

Name the fixture's graph is keyed under, which is the basename of that checkout root: `conformance-stale-fixture`.

## Protocol

### 1. Stand the Tree Up

- Make `{stale_fixture_path}` a git checkout of its own: `git init` there, write a `.gitignore` holding `.gitnexus/`, write `src/greeting.js` carrying a `REVISION` string constant and a pair of functions one of which calls the other, write `src/main.js` whose entry function calls into `src/greeting.js`, and commit all of it.
   > A tree already standing at that path is the tree this phase wants, and its files and its history stay as they are.
   > The call between the two files is what gives the graph an execution flow, which is what a ranked search over this fixture answers from. One file whose functions call nothing leaves the graph holding symbols and no flow, so a case reading ranked flows off it lands empty for a reason that has nothing to do with the binding under test.
   > `.gitnexus/` is the graph's own storage, written inside the checkout by the build below. Holding it out of the history keeps the commit the next phase makes down to the marker it rewrites.

### 2. Build the Graph From the Tree as It Stands

- Run `node .gitnexus/run.cjs analyze --index-only` inside `{stale_fixture_path}`, which walks the tree and lands a graph under `{stale_fixture_graph_name}` at the commit `HEAD` names.
   > A checkout carrying no runner at `.gitnexus/run.cjs` — which is every fixture on its first walk — takes `npx gitnexus analyze --index-only` instead, and that run writes the runner as it builds.
   > The build reports the counts it landed, and a tree this size takes seconds. An invocation still running past that is walking something larger than the fixture, which is what a path inside another checkout gives it.

### 3. Move the Tree Past the Graph

- Rewrite the `REVISION` constant in `src/greeting.js` to a string the file does not already carry, and commit that one file, so `HEAD` stands one commit past the commit the graph holds.
   > A marker the file already carries leaves the working tree clean and the commit refused, and `HEAD` where the build left it. A value taken from the clock, or from the count of commits the tree holds, differs on every walk.
   > Reading the distance back settles it: the graph inventory marks the fixture as behind by one commit, and the context resource for `{stale_fixture_graph_name}` carries the sentence naming that distance.

### 4. Land the Address

- Land the checkout root as `{stale_fixture_path}` and its basename as `{stale_fixture_graph_name}`, which the case binds as the tree its run walks and the graph its reads address.

## Rules

### staleness-is-a-commit-the-graph-has-not-met

A graph stands current when it holds the commit its tree's `HEAD` names, however recently it was built and however small the tree is. What puts it behind is a commit landing after the build. So the build comes first and the marker commit second, in that order, on every walk: the other order leaves the graph standing at `HEAD`, the gate reading false, and the case reporting a recovery nothing performed.

### the-fixture-is-its-own-checkout

`{stale_fixture_path}` holds a `.git` directory of its own and sits outside every other checkout. A build aimed at a directory that lives inside a checkout resolves upward to that checkout: the whole of the parent is walked, one graph is keyed under the parent's name, nothing is registered under the name of the directory given, and the build reports success either way. A fixture placed inside a working tree therefore hands the case a graph describing that working tree, and every answer the case reports is about another repository.

### a-later-walk-meets-the-tree-already-there

A walk after the first finds the checkout standing and its graph built at the commit that walk's rebuild reached. The preparation runs every phase regardless: the build brings the graph to the tree as it stands, and the marker commit moves the tree one past it, so the distance is one commit again and the gate reads true. The fixture is disposable at any moment — remove the directory and the next walk stands it up from the first phase.
