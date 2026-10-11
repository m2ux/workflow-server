# GitNexus API Change Gate Conformance

A specimen of one form: one library run held to a positive, a negative and a multi-verb case, so the measurement, the promised fallback and the set-shaped answer are evidenced side by side.

The run is `gitnexus::api-change-gate`, which measures what a route handler's change reaches — the consumers, the response keys each reads, the middleware wrapping the handler and the flows it opens — and stops for a decision where a consumer reads a key the route does not return. The gate arrives spliced from the run: it is declared in the library and materialised into each activity under that activity's prefix, where it is presented, answered and recorded like one written in the activity file. It carries a `when` on the measured mismatches, so a route whose consumers all read keys it returns passes without asking.

The positive case names `/ready`, a route the graph holds under one verb and nothing in the tree fetches, so the measurement lands one report rather than a set, that report names no consumer and no mismatch, the gate is not presented and `api_change_approved` keeps its seeded value. The mark the report names is the one-report shape over a route the graph holds. The negative case names a route no graph holds, so the measurement names no consumer — an error or an empty set — and no mismatch arrives; the gate is never presented and `api_change_approved` keeps its seeded value. That is the fallback the run promises for a route outside the index, and the report names it as such rather than as a route measured and found consistent. A seeded default and an accepted gate leave the same value behind, so the report states which of the two each case was.

The multi-verb case names `/mcp`, a URL the graph serves under POST, GET and DELETE. One URL serving several verbs is several routes, so the measurement answers with the set form — `routes` with a `total` of three — rather than one report. No consumer reads a key those routes do not return, so no mismatch arrives, the gate is not presented and `api_change_approved` keeps its seeded value. The mark the report names is the shape and the count: three routes under one URL and no gate, which tells a seed kept over a consistent set from the negative case's seed kept over an absent route.

What the walk evidences is the reference under three bindings: the same run resolves under `gitnexus::api-change-gate` three times, its steps and its checkpoint splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. The closing activity reports all three against the shared [case report](/conformance/resources/case-report.md) guide.

The walk presents no gate. Every route it binds either has no consumer or has consumers reading only keys the route returns, so the mismatch branch — the checkpoint, the answer it takes and the value it records — goes unexercised, and a pass over these three cases is not coverage of it.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `api-change-gate` | a route the graph holds under one verb with no consumer |
| `negative-case` | `api-change-gate` | a route no graph holds |
| `multi-verb-case` | `api-change-gate` | a URL the graph serves under three verbs |
| `report-cases` | nothing — states what the three bindings landed | |
