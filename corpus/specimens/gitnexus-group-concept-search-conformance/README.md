# GitNexus Group Concept Search Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::group-concept-search`, which reads the inventory naming the repository groups configured over the indexed graphs, then ranks one group's members against a concept and merges what they return into a single ranking. The positive case binds the `mcp-servers` group with a concept its members carry, so the run lands a `group_query_report` with results, each carrying the member it came from. The negative case binds the same group with a concept no member carries, so the run reads the same inventory and lands a `group_query_report` whose results are empty across every member — which is the fallback the run promises for a concept the group does not hold, and which the report names as such rather than as a member missing from the group's status, a distinction the inventory the run also lands settles.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::group-concept-search` twice, its inventory read and its ranking splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `group-concept-search` | a concept the group's members carry |
| `negative-case` | `group-concept-search` | a concept no member carries |
| `report-cases` | nothing — states what the two bindings landed | |
