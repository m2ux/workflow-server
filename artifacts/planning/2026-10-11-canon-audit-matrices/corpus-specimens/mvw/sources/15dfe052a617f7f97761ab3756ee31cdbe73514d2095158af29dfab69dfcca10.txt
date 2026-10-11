# GitNexus Doc Heading Lookup Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::doc-heading-lookup`, which names the graph covering a documentation tree and then finds the sections whose whole heading text matches a pattern. The positive case binds the midnight-docs tree with a pattern its headings match, so the run names the graph and lands the matching headings with the files they sit in. The negative case binds the same tree with a pattern no heading matches, so the run names the same graph and lands an empty `heading_matches` — which is the fallback the run promises for a pattern matching no whole heading, and which the report names as such rather than as a tree the graph does not cover.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::doc-heading-lookup` twice, its nested `graph-for-tree` reference and its heading search splice into each activity under that activity's prefix, and its outputs land under the names the reference sites bind — the matches under a name per case, the graph under `repo_name` in both. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `doc-heading-lookup` | a pattern whole headings match |
| `negative-case` | `doc-heading-lookup` | a pattern no heading matches |
| `report-cases` | nothing — states what the two bindings landed | |
