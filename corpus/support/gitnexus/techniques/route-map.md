---
metadata:
  version: 1.2.0
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
   > The answer reads a route's verb from a property the graph records, and a graph built before that property existed fails the whole read with a binder error naming it rather than answering empty. That is a graph too old to serve this operation, not a tree without routes, and a rebuild is what makes it answerable. A direct index read does not report it either, an index trailing its tree by commits being a different fault from one predating the shape the operation asks for.

### 2. Read a Route with No Consumer

- Read a route with no consumer as one nothing in this tree fetches, which is an orphan where the tree holds its own clients and ordinary where the clients live elsewhere — the graph walks one tree, and a consumer outside it leaves no edge.

### 3. Read the Middleware Chain

- Read the middleware chain as what every request to the handler passes through, so a guard the chain omits is absent for that route whatever the handler assumes.
