# GitNexus Graph For Tree Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::graph-for-tree`, which names the graph covering a tree, builds one where the inventory covers the tree with none, and names it again so every answer taken afterwards addresses a graph that exists. The positive case binds the workflow-server checkout, a tree a graph covers, so the first resolve names that graph and the two gated steps after it stay unreached; the run lands the name and no build counts. The negative case opens by applying the shared [prepare-unbuilt-fixture](/conformance/techniques/prepare-unbuilt-fixture.md) operation, which stands a throwaway checkout up under `/tmp` and clears the graph storage inside it; the case binds the checkout it prepared, so the first resolve lands an empty `repo_name`, the build writes a graph over the tree and reports its counts under `index_stats`, and the second resolve names the built graph. That sequence — an empty name, a build, then a name — is the fallback the run promises for an uncovered tree, and the report names it as such rather than as a graph the inventory held from the start.

Preparing the subject is what keeps the case true on its hundredth walk. The build the case evidences is itself what gives a tree its graph, so a tree chosen for carrying none carries one from then on, and every later walk names it at the first resolve while the case still claims a build. The prepared checkout loses its graph each time the operation runs, so the first resolve lands empty every walk and no repository anyone works in is touched.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::graph-for-tree` twice, its resolve, its gated build and its gated second resolve splice into each activity under that activity's prefix, and its outputs land under the names the reference sites bind — the build counts under a name per case, the graph under `repo_name` in both. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `graph-for-tree` | a tree a graph covers |
| `negative-case` | `graph-for-tree` | a throwaway checkout the case prepares with no graph over it |
| `report-cases` | nothing — states what the two bindings landed | |
