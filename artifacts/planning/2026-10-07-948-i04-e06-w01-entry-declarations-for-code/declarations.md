# The Operations, Their Responses, and the Direction Each Was Settled In

Every list-returning code-graph operation, the response an indexed graph gave it, and whether the settlement was a declaration or a statement that the answer has no entry to name.

## How the subject was derived

A hand count is not the enumeration. Two scans produce it, both over `corpus/support/gitnexus/techniques/` at `origin/i04/workflows` `860e107b`.

**Which techniques are operations.** A technique whose protocol reaches the graph — a `gitnexus_*` tool call or a `gitnexus://` resource read:

```text
grep -oH -E 'gitnexus_[a-z_]+|gitnexus://[A-Za-z0-9_{}/.*-]+' *.md | sort -u
→ 28 technique files name one or the other
```

Four of the twenty-eight name a resource in prose while producing their answer from a reading rather than from a call — `compose-visibility-filter` and `constrain-to-changed-files` compose a query string, `select-affected-clusters` and `weigh-change-risk` settle a judgement over what an operation returned. The namespace's own [`README`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/README.md) draws the same line, under *Composing a query* and *Settling a judgement*.

**Which of those return a list.** The `## Outputs` section of each, read the way [the guard reads it](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-binding-fidelity.ts#L140-L207) — `###` for an output, `####` for a component or a reserved block, `#####` for an entry field:

```text
grep -nH -E '^#{2,5} ' *.md
→ twelve operations declare an output that is the collection the caller walks
```

Twelve, of which three already declare `#### entry`. The other sixteen operations declare a report: an output whose components the answer's parts land in, which is a different notation and a different claim.

## What the responses showed

Every response below was taken from a live GitNexus server, version 1.6.12, on 2026-10-07. Where the harness does not serve a tool, the call went through the server's own stdio transport:

```text
tail -n +1 -f requests.jsonl | gitnexus mcp
```

| Operation | Output | Graph | Call | What one entry carried |
| --- | --- | --- | --- | --- |
| `read-cluster` | `cluster_members` | `tradingview-mcp` | resource `gitnexus://repo/tradingview-mcp/cluster/Tools` | `name`, `type`, `file` |
| `read-clusters` | `cluster_inventory` | `tradingview-mcp` | resource `gitnexus://repo/tradingview-mcp/clusters` | `name`, `symbols`, `cohesion` |
| `read-processes` | `process_inventory` | `tradingview-mcp` | resource `gitnexus://repo/tradingview-mcp/processes` | `name`, `type`, `steps` |
| `read-process` | `process_trace` | `tradingview-mcp` | resource `gitnexus://repo/tradingview-mcp/process/RegisterChartTools → ToolError` | a `trace` keyed `1:`, `2:`, … over strings |
| `rename` | `changes` | `tradingview-mcp` | `gitnexus_rename { symbol_name: gitDeps, new_name: gitDependencies, dry_run: true }` | `file_path`, `edits` |
| `heading-search` | `heading_matches` | `tradingview-mcp` | `gitnexus_cypher` over the technique's own statement | the statement's own column names |
| `reference-lookup` | `referencing_files` | `tradingview-mcp` | `gitnexus_cypher` over the technique's own statement | one column of paths |
| `route-map` | `route_inventory` | `midnight-agent-eng` | `gitnexus_route_map { route: '/develop/how-to' }` | `routes`, `total` — the entry sits under `routes` |
| `tool-map` | `tool_inventory` | all eighteen | `gitnexus_tool_map` | `tools`, `total`, `message` — `tools` empty everywhere |
| `resolve-graph` | `graph_inventory` | all eighteen | `gitnexus_list_repos` and `gitnexus_group_list` | two collections, of different shapes |
| `list-group-members` | `group_members` | the `midnight` group | `gitnexus_group_list { name }` and `gitnexus_list_repos` | composed from both, under names of its own |
| `cypher` | `result_rows` | `tradingview-mcp` | `gitnexus_cypher` over a caller's statement | whatever the statement returned |

## The declarations

**`read-cluster` — `cluster_members` declares `name`, `type`, `file`.**
The resource answers `module`, `symbols` and `cohesion` for the area and then a `members:` list, each member carrying exactly those three keys. The output is the member list, so the fields sit in its own `#### entry` block.

**`rename` — `changes` declares `file_path`, `edits`.**
The answer is a report whose `changes` is a list, one entry per file, each carrying `file_path` and the `edits` under it; the protocol records that list as `{changes}`. The edits one entry holds carry `line`, `old_text`, `new_text` and `confidence`, which the entry's own prose names — a second level the notation does not reach and the description does.

**`heading-search` — `heading_matches` declares `name`, `filePath`, and the statement is aliased to spell them.**
The answer is the result set of the technique's own statement, and a column is named by what the `RETURN` names. `RETURN s.name, s.filePath` gives columns `s.name` and `s.filePath`, which no read can address; `RETURN s.name AS name, s.filePath AS filePath` gives `name` and `filePath`, confirmed against the graph. The operation composes the statement, so the column names are its to settle, and settling them is what makes the declaration true of the response rather than true of a sentence.

**`route-map` — `route_inventory` declares `routes`, `total` and `message`, and the entry's fields under `routes`.**
The answer is a report, not a list: `{"routes": [ … ], "total": 1}` where a route matched, `{"routes": [], "total": 0, "message": …}` where none did. One route carries `route`, `method`, `handler`, `runtimeEvidence`, `middleware`, `consumers` and `flows`. The output therefore declares components, and the entry's fields sit under the component holding the list — [the one grain the schema admits for a wrapped list](https://github.com/m2ux/workflow-server/blob/1caa9ff5/src/schema/technique.schema.ts#L68-L81), an output declaring `components` or `entry` and never both.

**`tool-map` — `tool_inventory` declares `tools`, `total` and `message`, and no entry fields.**
The same report shape: `{"tools": [], "total": 0, "message": "No tool definitions found."}`. Every one of the eighteen indexed graphs answers with an empty `tools`, so what one tool entry carries cannot be read off any response available here. The report's shape is settled and declared; the entry's is not, and a component declaring no entry fields is [unmeasured rather than wrong](https://github.com/m2ux/workflow-server/blob/1caa9ff5/guards/check-binding-fidelity.ts#L1189-L1191). It is named in the coverage report.

## The statements

Three outputs are named as the collection the caller walks and have no entry a read can address. Each says so, as [`group-freshness` already says it](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/group-freshness.md#L22-L24) of the members it reports.

**`read-process` — the trace is keyed by step number over strings.**
The resource answers `name`, `type`, `step_count` and then `trace:` as a mapping — `1: registerChartTools (src/tools/chart.js)`, `2: getState (src/core/chart.js)` — so an entry is one string and the collection is a numbered map. A step iterating it as a list of entries with fields iterates nothing.

**`reference-lookup` — an entry is a path.**
The statement returns one column, `a.filePath`, so a row carries a path and nothing beside it. Aliasing the column would name a field on a value that has one part, which is a shape the answer does not have; the output says the entry is a path instead.

**`resolve-graph` — one name holds two collections.**
`gitnexus_list_repos` answers `repositories`, each with `name`, `path`, `indexedAt`, `lastCommit`, `stats` and the rest; `gitnexus_group_list` answers `groups`, which are names. The protocol records the two together, so the output holds entries of two shapes and has no one entry shape to declare.

**`cypher` — the rows are the caller's statement's.**
Already stated: the answer is a markdown table of whatever the statement returned. No change.

## Where a declaration is settled by something other than a response

**`list-group-members` composes its entry.**
`group_members` declares `name`, `tree_path` and `is_home`. No response carries an entry with those three keys: `name` is a key of the `repos` mapping `gitnexus_group_list` answers, `tree_path` is the `path` of the matching entry of `gitnexus_list_repos`, and `is_home` is the technique's own comparison against its `{home_repo}` input. The protocol says exactly that, and the entry is the technique's construction rather than a response's shape. It is named in the coverage report as the one declared entry settled against a composition.

**Four declared entries belong to judgements, not operations.**
[`extract-boundary-symbols`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/extract-boundary-symbols.md), [`judge-group-reach`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/judge-group-reach.md), [`select-affected-clusters`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/select-affected-clusters.md) and [`select-stale-members`](https://github.com/m2ux/workflow-server/blob/860e107b/corpus/support/gitnexus/techniques/select-stale-members.md) each declare `#### entry` over a list they assemble from what an operation returned. Their entries are authored, so there is no response to settle them against and they are outside this subject.

## What the edit touched

Eight definition files, each with its version bumped:

| File | Change |
| --- | --- |
| `corpus/support/gitnexus/techniques/read-cluster.md` | `cluster_members` gains `#### entry` with `name`, `type`, `file` |
| `corpus/support/gitnexus/techniques/rename.md` | `changes` gains `#### entry` with `file_path`, `edits` |
| `corpus/support/gitnexus/techniques/heading-search.md` | the statement aliases its columns; `heading_matches` gains `#### entry` with `name`, `filePath` |
| `corpus/support/gitnexus/techniques/route-map.md` | `route_inventory` gains `#### routes` with seven entry fields, and `#### total`, `#### message` |
| `corpus/support/gitnexus/techniques/tool-map.md` | `tool_inventory` gains `#### tools`, `#### total`, `#### message`, with no entry fields under `tools` |
| `corpus/support/gitnexus/techniques/read-process.md` | `process_trace` states the trace is keyed by step number over strings |
| `corpus/support/gitnexus/techniques/reference-lookup.md` | `referencing_files` states an entry is a path |
| `corpus/support/gitnexus/techniques/resolve-graph.md` | `graph_inventory` states it holds two collections of different shapes |

## Where the two trees meet

The declarations are definitions, on the `workflows` lineage; the fixture of captured responses and the runs that hold the declarations to them are code, on `main`. One task, two trees, so two pull requests — the declarations against `i04/workflows`, the fixture and the runs against `i04/main`. The runs that need a corpus skip where none is present, which is how the other corpus-reading tests cross the same split, and `WORKFLOWS_DIR` points them at a corpus worktree to verify ahead of the merge.
