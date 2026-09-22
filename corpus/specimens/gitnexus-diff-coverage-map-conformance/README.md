# GitNexus Diff Coverage Map Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::diff-coverage-map`, which takes the symbols a diff changed, reads each one's callers out of the graph across a per-symbol pass, and separates the symbols a test reaches from the ones no test reaches and the ones whose tests the change outran. The positive case takes the changed-symbol set from the whole working tree, so the pass reads a caller report per changed symbol and the classification lands its two lists over them. The negative case takes it from the index, where nothing is staged, so the change set is empty, the pass runs zero times and both `coverage_gaps` and `update_candidates` land empty — which is the fallback the run promises for a diff that moved nothing, and which the report names as such rather than as a change classified and found covered.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::diff-coverage-map` twice, its steps — a detection, a per-symbol pass and a classification — splice into each activity under that activity's prefix, and its two outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `diff-coverage-map` | the whole working tree |
| `negative-case` | `diff-coverage-map` | an index holding nothing staged |
| `report-cases` | nothing — states what the two bindings landed | |
