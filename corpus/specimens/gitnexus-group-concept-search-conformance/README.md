# GitNexus Group Concept Search Conformance

A specimen of one form: one library run held to a positive, a negative and an unknown-group case, so the measurement, the promised fallback and the error an absent group draws are evidenced side by side.

The run is `gitnexus::group-concept-search`, which reads the inventory naming the repository groups configured over the indexed graphs, then ranks one group's members against a concept and merges what they return into a single ranking. The positive case binds the `mcp-servers` group with a concept its members carry, so the run lands a `group_query_report` with results, each carrying the member it came from. The negative case binds the same group with a concept no member carries, so the run reads the same inventory and lands a `group_query_report` whose results are empty across every member — which is the fallback the run promises for a concept the group does not hold, and which the report names as such rather than as a member missing from the group's status, a distinction the inventory the run also lands settles.

The unknown-group case binds `no-such-group` with the concept the positive case carries, so what it lands is settled by the name and not the concept. The run's own description puts the inventory first — it reads the groups configured over the indexed graphs before it ranks — and that read is where an unknown group is settled: the `graph_inventory` lists the configured groups and the name is not among them, so the ranked search answers with an error naming the missing group and the `group_query_report` carries no results. The report names that mark as the error and the inventory that explains it, so no results over an absent group reads apart from the negative case's empty results over a group every member of which was ranked.

What the walk evidences is the reference under three bindings: the same run resolves under `gitnexus::group-concept-search` three times, its inventory read and its ranking splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. The closing activity reports all three against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `group-concept-search` | a concept the group's members carry |
| `negative-case` | `group-concept-search` | a concept no member carries |
| `unknown-group-case` | `group-concept-search` | a group name the inventory does not list |
| `report-cases` | nothing — states what the three bindings landed | |
