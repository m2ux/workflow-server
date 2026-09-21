---
metadata:
  version: 1.0.0
---

## Capability

The names by which a concern in one graph can be reached from another: the concern itself, the symbols at the edge of its within-graph radius, and the routes and tools its files serve.

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

## Protocol

### 1. Open With the Concern

- Open `{boundary_symbols}` with `{concern_symbol}` as a `symbol`, its file taken from `{context_report}`.

### 2. Take the Radius Edge

- Walk the depth-1 entries of `{impact_report}` and take each function or file name that sits in a file the home tree exports — an entry module, a public index, a file another package would import — as a `symbol` entry. A dependent buried in an internal file stays out: nothing outside the tree can name it.

### 3. Take the Served Routes

- Take each route in `{route_inventory}` whose handler file is the concern's file or a depth-1 file as a `route` entry, named by its path.
  > An empty inventory adds no entry and is recorded as such: the tree serves no route the parser recognised, which is a fact about the parser as much as the tree.

### 4. Take the Declared Tools

- Take each tool in `{tool_inventory}` whose handler file is the concern's file or a depth-1 file as a `tool` entry, named by the tool name.
  > An empty inventory adds no entry and is recorded as such, for the same reason.
