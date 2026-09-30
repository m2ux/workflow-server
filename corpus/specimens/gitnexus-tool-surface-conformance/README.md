# GitNexus Tool Surface Conformance

A specimen of one form: one library run held to a positive and a negative case, so the two bindings of the one reference are evidenced side by side.

The run is `gitnexus::tool-surface`, which names the graph covering a tree — building one where the inventory covers it with none — then maps the MCP and RPC tools the tree declares to the file handling each and the description it registers. A tool node comes from a `tool` decorator on a handler, or from a TypeScript or JavaScript file whose path carries `tool` and whose declarations pair a name with a description beside an `inputSchema`. The positive case names the checkout under work, the session's `host_repo_path`, a tree that registers MCP tools by calling a method, a shape outside those two, so the run names its graph and lands an empty inventory. The negative case names a markdown tree with no tool declarations by the registry name of the graph built from it, `docs_graph_name`, and reads the tree's path from the index through the shared [`locate-indexed-tree`](/conformance/techniques/locate-indexed-tree.md) technique — where the index holds no graph by that name, the case says so and binds no tree. Over that tree the run names that graph and lands an empty inventory too — the fallback the run promises, which the run's own note reads as registrations the walk did not recognise rather than as a tree defining none. The report names the binding each case took beside the one answer both landed, and the note as the mark rather than the emptiness alone.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::tool-surface` twice, its nested graph-naming run splices inside it under each activity's prefix, its inventory lands under the two names the reference sites bind, and its graph name lands under `repo_name` from both cases, so the header of the report names the graph the run last addressed. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

The walk evidences no mapped inventory. No graph it addresses holds a tool node, so the row-per-tool answer goes unexercised, and a pass over these two cases is not coverage of it.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `tool-surface` | a tree registering MCP tools by calling a method |
| `negative-case` | `tool-surface` | a markdown tree with no tool declarations |
| `report-cases` | nothing — states what the two bindings landed | |
