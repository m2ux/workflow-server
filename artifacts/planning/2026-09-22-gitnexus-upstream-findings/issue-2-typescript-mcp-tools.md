# Tool nodes are not recorded for servers built on the TypeScript MCP SDK

**Repository:** abhigyanpatwari/GitNexus
**Version:** 1.6.12

## What happens

A server written with the official TypeScript MCP SDK registers its tools with `server.tool(name, schema, handler)` or `server.registerTool(...)`. No `Tool` node and no `HANDLES_TOOL` edge is created for any of them, so `tool_map` answers `{ "tools": [], "total": 0, "message": "No tool definitions found." }` for a codebase that defines many.

The answer is indistinguishable from the correct answer for a codebase that defines none.

## Reproduction

Index any TypeScript MCP server built on `@modelcontextprotocol/sdk`, then:

```
tool_map({ repo: "<name>" })
→ { "tools": [], "total": 0, "message": "No tool definitions found." }
```

A direct count confirms it is the graph rather than the reader:

```
MATCH (t:Tool) RETURN count(t)      → 0
MATCH ()-[r:CodeRelation {type: 'HANDLES_TOOL'}]->() RETURN count(r)   → 0
```

We saw this on two separate TypeScript MCP servers, one with 16 `server.tool(` call sites and 4 `server.registerTool(` sites, on indexes built the same day and reporting current.

## Where it comes from

There are two paths that create a `Tool` node, and a TypeScript SDK server matches neither.

The parser path, in `src/core/ingestion/workers/parse-worker.ts`, emits a tool definition when a **decorator** named `tool` sits on a function. The comment above it names the shapes it targets: `@mcp.tool()`, `@app.tool()`, `@server.tool()`. These are the Python SDK's idiom. A TypeScript SDK server calls a method rather than applying a decorator, so nothing matches.

The fallback path, in `src/core/ingestion/pipeline-phases/tools.ts`, scans TypeScript and JavaScript files whose path contains `tool`, requires the file to mention `inputSchema`, and matches a `name:` string literal followed by a `description:`. A TypeScript SDK server passes a zod schema rather than a literal `inputSchema` key, and its tool name is an argument rather than an object property, so nothing matches there either.

## Why it matters

Python MCP servers are covered and TypeScript ones are not, which is invisible from the outside: both answer with a well-formed empty inventory. Anything built on `tool_map` — an inventory, a diff of the tool surface between versions, a check that a handler is reachable — silently reports nothing rather than failing, so the gap is most likely to be discovered by someone trusting the empty answer.

## Suggested resolution

Recognise the SDK's call form directly: a call to `.tool(...)` or `.registerTool(...)` on a server object, taking the tool name from the first string argument and the handler from the function argument. That is the same information the decorator path already extracts, from the shape TypeScript uses to express it.

Failing that, having `tool_map` distinguish "this codebase declares no tools" from "no tool declaration shape was recognised here" would at least make the gap visible to a caller.
