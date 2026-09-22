# GitNexus Index Refresh Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::index-refresh`, which reads what a graph holds and how far behind its tree it has fallen, rebuilds the tree where the read reports it behind, and reads again so what follows is measured against the tree as it stands. The positive case names a tree whose graph is current, so the first read lands a false staleness flag, the two gated steps stay unentered, and the stats describe the graph as read. The negative case sets the addressed graph to `poc-shielded` and names its tree, whose graph is behind, so the first read lands the flag true, the rebuild walks the tree, and a second read says whether the graph caught up — which is the recovery the run promises for a stale index, and which the report names as a rebuild-then-verdict rather than as a graph that was current all along.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::index-refresh` twice, its steps splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `index-refresh` | a tree whose graph is current |
| `negative-case` | `index-refresh` | a tree whose graph is behind, addressed as `poc-shielded` |
| `report-cases` | nothing — states what the two bindings landed | |
