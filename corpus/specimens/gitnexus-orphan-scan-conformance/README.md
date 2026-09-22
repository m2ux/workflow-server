# GitNexus Orphan Scan Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::orphan-scan`, which supplies a literal graph query for every unreferenced function and method and narrows it to the files a change touched. The positive case names two files the graph holds and records unreferenced symbols in, so the narrowing keeps rows and the run lands them. The negative case names a file no graph holds, so the narrowing keeps no row and the run lands an empty set — which is the fallback the run promises for a file outside the index, and which the report names as such rather than as a clean file.

The positive case names files carrying symbols nothing calls so its rows and the negative case's empty set differ. A file of referenced symbols lands the empty set too, and the pair then evidences the run resolving twice rather than the narrowing reaching anything.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::orphan-scan` twice, its steps splice into each activity under that activity's prefix, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `orphan-scan` | files the graph records unreferenced symbols in |
| `negative-case` | `orphan-scan` | a file no graph holds |
| `report-cases` | nothing — states what the two bindings landed | |
