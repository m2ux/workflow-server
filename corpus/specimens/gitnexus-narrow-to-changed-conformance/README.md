# GitNexus Narrow To Changed Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::narrow-to-changed`, which puts a change's file list into a graph query as a path predicate and runs the constrained query, so the rows that come back already sit in the files the change touched. Both cases carry the same query, for every function's name and file. The positive case names a file the graph holds, so the predicate keeps rows and the run lands the functions the graph records in that file. The negative case names a file no graph holds, so the predicate keeps no row and the run lands an empty set — which is the fallback the run promises for a file outside the index, and which the report names as such rather than as a held file with nothing in it.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::narrow-to-changed` twice, its steps splice into each activity under that activity's prefix, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `narrow-to-changed` | the function query over a file the graph holds |
| `negative-case` | `narrow-to-changed` | the function query over a file no graph holds |
| `report-cases` | nothing — states what the two bindings landed | |
