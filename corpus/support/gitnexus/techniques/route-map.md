---
metadata:
  version: 1.0.0
---

## Capability

Map the API routes a tree serves — which file handles each, what middleware wraps it, and which components fetch it.

## Inputs

### route_path

*(optional)* Restricts the answer to one route, such as `/api/grants`. Absent, the answer is every route the graph holds.

## Outputs

### route_inventory

Each route with the file handling it, the middleware chain wrapping that handler, and the components and hooks that fetch it.

## Protocol

### 1. Take the Route Inventory

- Call `gitnexus_route_map { route: route_path, repo: repo_name }` and record the `{route_inventory}`.

### 2. Read a Route with No Consumer

- Read a route with no consumer as one nothing in this tree fetches, which is an orphan where the tree holds its own clients and ordinary where the clients live elsewhere — the graph walks one tree, and a consumer outside it leaves no edge.

### 3. Read the Middleware Chain

- Read the middleware chain as what every request to the handler passes through, so a guard the chain omits is absent for that route whatever the handler assumes.
