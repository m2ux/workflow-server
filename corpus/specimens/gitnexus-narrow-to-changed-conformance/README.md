# GitNexus Narrow To Changed Conformance

A specimen of one form: one library run held to a positive, a negative and a union case, so the measurement, the promised fallback and the two-arm query shape are evidenced side by side.

The run is `gitnexus::narrow-to-changed`, which puts a change's file list into a graph query as a path predicate and runs the constrained query, so the rows that come back already sit in the files the change touched. The positive and negative cases carry the same query, for every function's name and file. The positive case names a file the graph holds, so the predicate keeps rows and the run lands the functions the graph records in that file. The negative case names a file no graph holds, so the predicate keeps no row and the run lands an empty set — which is the fallback the run promises for a file outside the index, and which the report names as such rather than as a held file with nothing in it.

The union case carries a two-arm `UNION ALL` query — one arm for every function, one for every method, each returning the symbol's name and file — over two files the graph holds. The run's composition step names this shape: each arm is its own `MATCH`, and each arm takes its own path predicate, so the rows that land are functions from the first arm and methods from the second, drawn from both files and from nothing outside them. The report names that mark as the two-arm shape, so a predicate riding two arms reads apart from the positive case's predicate on one.

What the walk evidences is the reference under three bindings: the same run resolves under `gitnexus::narrow-to-changed` three times, its steps splice into each activity under that activity's prefix, and its one output lands under the three names the reference sites bind. The closing activity reports all three against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `narrow-to-changed` | the function query over a file the graph holds |
| `negative-case` | `narrow-to-changed` | the function query over a file no graph holds |
| `union-case` | `narrow-to-changed` | a two-arm function-and-method query over two files the graph holds |
| `report-cases` | nothing — states what the three bindings landed | |
