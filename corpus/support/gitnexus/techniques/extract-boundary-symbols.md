---
metadata:
  version: 1.1.0
---

## Capability

The names by which a concern in one graph can be reached from another: the concern itself, the symbols at the edge of its within-graph radius, the routes and tools its files serve, and the packages under which its tree is consumed as a library.

## Inputs

### concern_symbol

The symbol the concern was raised against, in its home graph.

### context_report

The concern's callers, callees and flow membership in its home graph.

### impact_report

What depends on the concern within its home graph, by depth.

### route_inventory

Each route the home tree serves with the file handling it.

### tool_inventory

Each tool the home tree declares with the file handling it.

### group_members

The group's members, each with its graph name, its tree, and whether it is the concern's home.

### contract_report

Each contract the group's registry holds with the member publishing it, its kind, and the member it cross-links to.

## Outputs

### boundary_symbols

The names another member could hold a reference to, each with where it came from. Never empty: the concern itself is always the first entry.

#### entry

##### name

The name a probe searches for — a symbol name, a route path, or a tool name.

##### kind

`symbol`, `route` or `tool`.

##### home_file

The file in the home tree that declares or serves it.

### boundary_packages

The names under which another member consumes the home tree as a library, each with where the name was read. Empty where the home tree holds no package manifest above the concern and the registry holds no library contract for it, and recorded as such.

#### entry

##### name

The package or crate name a consumer's manifest and imports carry.

##### source

The manifest file in the home tree that declares the name, or `registry` where a library contract of the home's carries it.

## Protocol

### 1. Open With the Concern

- Open `{boundary_symbols}` with `{concern_symbol}` as a `symbol`, its file taken from `{context_report}`.

### 2. Take the Radius Edge

- Record the file `{impact_report}` names for its target beside the concern's own. The radius read resolves a name to the first symbol carrying it, so where the two files differ the radius is a namesake's — a wrapper or a mirror of the concern in another crate of the same tree — and its edge is taken with that file recorded.
- Walk the depth-1 entries of `{impact_report}` and take each function or file name that sits in a file the home tree exports — an entry module, a public index, a file another package would import — as a `symbol` entry. A dependent buried in an internal file stays out: nothing outside the tree can name it.
- A dependent that is a member of the concern itself — its id qualified by the concern's name, as `LedgerParameters.deserialize` is — adds no entry: a consumer reaches it through the concern's own name, and its bare name is one every tree defines somewhere, so a probe for it answers with a namesake.

### 3. Take the Served Routes

- Take each route in `{route_inventory}` whose handler file is the concern's file or a depth-1 file as a `route` entry, named by its path.
  > An empty inventory adds no entry and is recorded as such: the tree serves no route the parser recognised, which is a fact about the parser as much as the tree.

### 4. Take the Declared Tools

- Take each tool in `{tool_inventory}` whose handler file is the concern's file or a depth-1 file as a `tool` entry, named by the tool name.
  > An empty inventory adds no entry and is recorded as such, for the same reason.

### 5. Take the Published Packages

- Take the home member's tree from `{group_members}` and walk from the concern's file up to the tree's root, reading the `name` of each `package.json` and the `[package] name` of each `Cargo.toml` met on the way; each is an entry of `{boundary_packages}` with that manifest as its source.
- Take each `lib` contract in `{contract_report}` that the home member publishes and add its contract name as an entry with source `registry`. A registry name that differs from a manifest's is kept beside it: consumers import the name the package was published under, and the manifest carries the name it was built under, and `edges-the-parser-cannot-see` is why a search needs both.
