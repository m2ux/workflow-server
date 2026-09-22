# GitNexus Doc Reference Surface Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::doc-reference-surface`, which names the graph covering a documentation tree and then enumerates, for each file of a set, the files whose links resolve to it. The positive case binds the midnight-docs tree with a file the index records, so the run names the graph, cycles over the one target and lands the files linking to it. The negative case binds the same tree with a path the index records no file at, so the run names the same graph and lands an empty `referencing_files` — which is the fallback the run promises for a file outside the index, and which its own note says to confirm against the index before reading as no referencers. The report names it as that fallback rather than as a file nothing links to.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::doc-reference-surface` twice, its nested `graph-for-tree` reference and its per-file loop splice into each activity under that activity's prefix, and its outputs land under the names the reference sites bind — the referencers under a name per case, the graph under `repo_name` in both. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `doc-reference-surface` | a file the index records |
| `negative-case` | `doc-reference-surface` | a path the index records no file at |
| `report-cases` | nothing — states what the two bindings landed | |
