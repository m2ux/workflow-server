# A route's response shape is taken from its handler file, so routes sharing a file report each other's shapes

**Repository:** abhigyanpatwari/GitNexus
**Version:** 1.6.12

## What happens

Several routes served from one handler file are all reported with the same `responseShape`. The shape is whichever one the extractor found in that file, and it is attached to every route the file serves, including routes that return nothing like it.

The answer is well formed and carries no marker saying the shape may not be this route's.

## Reproduction

An Express server where one module registers a health endpoint and a protocol endpoint:

```js
app.get('/ready', (req, res) => res.status(200).json({ status, checks, corpus }));
app.post('/mcp', mcpHandler);
app.get('/mcp', mcpHandler);
app.delete('/mcp', mcpHandler);
```

`mcpHandler` returns a protocol response and never returns `status`, `checks` or `corpus`.

```
api_impact({ repo: "<name>", route: "/mcp", method: "DELETE" })
→ responseShape: { success: ["status", "ready", "checks", "corpus"], error: [...] }
```

That is the `/ready` payload, reported for a DELETE that tears down a session. `route_map` shows the same file-level attribution in its `flows` list: all five routes carry an identical thirteen-entry list.

## Why it matters

`api_impact` exists to be consulted before changing a route, and the mismatch detection it offers is the comparison of a route's response keys against the keys its consumers read. That comparison rests on the shape. Where the shape belongs to a sibling route, a mismatch is computed against keys the route under change never returned — so the check can report a mismatch that is not real, and miss one that is.

Routes sharing a handler module is the normal shape of an Express or Hono application, so this is not an edge case; it is most applications with more than one endpoint in a file.

## Suggested resolution

Attribute the shape to the route's own handler rather than to the file: the registration call names the handler, and the extraction can follow that function rather than scanning the module. Where the handler cannot be resolved to a single function, reporting no shape is more useful than reporting a sibling's.

Failing that, marking the shape's provenance — the function it was extracted from, or a flag saying it is file-level — would let a caller tell an attributed shape from an inferred one. `runtimeEvidence.confirmed` already establishes that pattern for a different field on the same answer.
