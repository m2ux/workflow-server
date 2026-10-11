---
metadata:
  version: 1.4.0
---

## Capability

Map the API routes a tree serves — which file handles each, what middleware wraps it, and which components fetch it.

## Inputs

### route_path

*(optional)* Restricts the answer to one route, such as `/api/grants`. Absent, the answer is every route the graph holds.

## Outputs

### route_inventory

Each route with the file handling it, the middleware chain wrapping that handler, the components and hooks that fetch it, its `method` — the verb, `*` for a method-agnostic route, or null for a method-less one — and its `runtimeEvidence`, authoritative only where `confirmed` is true.

## Protocol

### 1. Take the Route Inventory

- Call `gitnexus_route_map { route: route_path, repo: repo_name }` and record the `{route_inventory}`.
   > - The routes recorded are those a route decorator declares and those registered by calling a verb method on an app or router with a path literal, so a tree serving its routes another way answers empty.
   > - A graph built before the `method` property existed fails the whole read with a binder error naming it rather than answering empty: a graph too old to serve this technique, not a tree without routes, and a rebuild makes it answerable. A direct index read does not report this fault — trailing its tree by commits is a different thing from predating the shape the technique asks for.

### 2. Read a Route with No Consumer

- Read a route with no consumer as one nothing in this tree fetches: an orphan where the tree holds its own clients, ordinary where the clients live elsewhere, the graph walking one tree.

### 3. Read the Middleware Chain

- Read the middleware chain as what every request to the handler passes through, so a guard it omits is absent for that route whatever the handler assumes.
