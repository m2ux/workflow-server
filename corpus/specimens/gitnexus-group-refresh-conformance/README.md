# GitNexus Group Refresh Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::group-refresh`, which reads how far every member of a repository group has fallen behind its code, rebuilds each member the report names, rebuilds the contract registry those members' moves left behind, and reads what the rebuilt registry holds. The positive case binds the `mcp-servers` group, both of whose members have a graph, so every stale member has a tree a rebuild can walk and the run lands an empty `unrebuildable_members` beside the rebuilt registry's counts and contracts. The negative case binds the `midnight-ledger` group, whose member `midnight-node` has no graph, so the run lands a non-empty `unrebuildable_members` naming that member while it still rebuilds the registry over the members it can read — which is the fallback the run promises for a member with no graph, and which the report names as such rather than as a member the freshness report found current or as a refresh that failed.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::group-refresh` twice, its freshness read, its inventory read, its selection, its per-member rebuild loop, its registry sync and its registry read splice into each activity under that activity's prefix, and every one of its six outputs, the optional ones included, lands under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `group-refresh` | a group every member of which has a graph |
| `negative-case` | `group-refresh` | a group with a member no graph covers |
| `report-cases` | nothing — states what the two bindings landed | |
