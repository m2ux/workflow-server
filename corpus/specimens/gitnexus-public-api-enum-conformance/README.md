# GitNexus Public API Enumeration Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::public-api-enum`, which takes the symbols a diff changed, composes the visibility filter over them, and returns the exported surface among them — the symbols a consumer outside the module can reach. The positive case takes the changed symbols from the whole diff, so the filter is composed over a populated set and the run lands the exported symbols among them. The negative case takes them from the index, where nothing is staged, so the change set is empty, the filter names no symbol, and the run lands an empty set — which is the fallback the run promises for a change with no symbols, and which the report names as such rather than as changed symbols none of which is exported.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::public-api-enum` twice, its steps splice into each activity under that activity's prefix, its composed filter passes from one step to the graph query in the next, and its one output lands under the two names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `public-api-enum` | the whole diff |
| `negative-case` | `public-api-enum` | the index, with nothing staged |
| `report-cases` | nothing — states what the two bindings landed | |
