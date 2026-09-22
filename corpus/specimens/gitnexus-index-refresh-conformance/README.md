# GitNexus Index Refresh Conformance

A specimen of one form: one library run held to a positive, a negative and an unindexed-tree case, so the measurement, the promised recovery and the build from nothing are evidenced side by side.

The run is `gitnexus::index-refresh`, which reads what a graph holds and how far behind its tree it has fallen, rebuilds the tree where the read reports it behind, and reads again so what follows is measured against the tree as it stands. The positive case names a tree whose graph is current, so the first read lands a false staleness flag, the two gated steps stay unentered, and the stats describe the graph as read. The negative case sets the addressed graph to `poc-shielded` and names its tree, whose graph is behind, so the first read lands the flag true, the rebuild walks the tree, and a second read says whether the graph caught up — which is the recovery the run promises for a stale index, and which the report names as a rebuild-then-verdict rather than as a graph that was current all along.

The unindexed-tree case sets the addressed graph to `gitnexus-test-setup` — the basename the build keys a graph under — and names that tree, which has no graph, so the first read answers with an error naming the repository, which the run reads as no graph: the flag true and the stats empty. The build walks the tree and lands a graph under that name, and the second read lands the new graph's counts with the flag false. The report names that mark as the error and the build, so a graph built from nothing reads apart from the negative case's graph rebuilt from behind. The case walks the unindexed path only while the tree carries no graph; once that build has landed, the tree has a graph, the first read finds it current or behind, and the case evidences one of the other two bindings until the graph is removed.

What the walk evidences is the reference under three bindings: the same run resolves under `gitnexus::index-refresh` three times, its steps splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. Each case addresses a graph of its own, and the workflow holds all three names as standing values beside the address the cases set. The closing activity reads those, so its report against the shared [case report](/conformance/resources/case-report.md) guide names every graph in its header and names in each row's graph column the one that answered it.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `index-refresh` | a tree whose graph is current |
| `negative-case` | `index-refresh` | a tree whose graph is behind, addressed as `poc-shielded` |
| `unindexed-tree-case` | `index-refresh` | a tree with no graph, addressed as `gitnexus-test-setup` |
| `report-cases` | nothing — states what the three bindings landed | |
