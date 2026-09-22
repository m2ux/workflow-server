# GitNexus upstream findings

Five defects in GitNexus 1.6.12, found while writing the `gitnexus` corpus namespace against its tool surface and walking twenty-four conformance specimens against a live server. Each is drafted as an issue body ready to file at `abhigyanpatwari/GitNexus`. **None has been filed.**

| Draft | What it is |
|---|---|
| [issue-1-subdirectory-build.md](issue-1-subdirectory-build.md) | `analyze` on a subdirectory indexes the enclosing checkout and registers the graph under its name, reporting success |
| [issue-2-typescript-mcp-tools.md](issue-2-typescript-mcp-tools.md) | No `Tool` node is recorded for a server built on the TypeScript MCP SDK, so `tool_map` answers as it would for a codebase defining none |
| [issue-3-response-shape-per-file.md](issue-3-response-shape-per-file.md) | A route's `responseShape` is taken from its handler file, so routes sharing a file report each other's shapes |
| [issue-4-explain-anchor-silently-matches-nothing.md](issue-4-explain-anchor-silently-matches-nothing.md) | A taint anchor naming a file at the tree's root resolves to that file's headings, and the documented remedy matches nothing |
| [issue-5-resource-totals-disagree.md](issue-5-resource-totals-disagree.md) | A resource's trailing comment names a total that disagrees with the graph it describes |

Each was verified by reading the tool's answer directly, and where a cause is named, against the vendored checkout at `~/projects/vendor/GitNexus` — the named function and the expression it builds — rather than from a single observation.

## What they share

All five answer in a well-formed shape that a caller cannot tell from the correct answer. An indexed parent reports the counts a build reports; an unrecognised tool declaration reports an empty inventory; a sibling's response shape reports as this route's; an unmatched anchor reports an empty finding list. The suggested resolutions therefore divide into a fix and, where the fix is larger, a way for the caller to see which answer it received.

## Two corpus consequences

Two conformance specimens cannot discriminate as bound while issues 1 and 2 stand, and say so in their own READMEs: the tool-surface specimen has no tree whose graph holds a tool node, and the graph-for-tree specimen cannot build for a component inside a checkout. Both close when the upstream defects do.
