# GitNexus Tool Surface Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::tool-surface`, which names the graph covering a tree — building one where the inventory covers it with none — then maps the MCP and RPC tools the tree declares to the file handling each and the description it registers. The positive case names a tree that declares MCP tools, so the run names its graph and lands an inventory with a row per tool. The negative case names a markdown tree the graph holds with no tool declarations, so the run names that graph and lands an empty inventory — which is the fallback the run promises, and which the run's own note reads as registrations the walk did not recognise rather than as a tree defining none. The report names the note as the mark, not the emptiness alone.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::tool-surface` twice, its nested graph-naming run splices inside it under each activity's prefix, its inventory lands under the two names the reference sites bind, and its graph name lands under `repo_name` from both cases, so the header of the report names the graph the run last addressed. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `tool-surface` | a tree declaring MCP tools |
| `negative-case` | `tool-surface` | a markdown tree with no tool declarations |
| `report-cases` | nothing — states what the two bindings landed | |
