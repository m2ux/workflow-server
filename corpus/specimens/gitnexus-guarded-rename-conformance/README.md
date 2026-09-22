# GitNexus Guarded Rename Conformance

A specimen of one form: one library run held to a positive and a negative case, so the measurement and the promised fallback are evidenced side by side.

The run is `gitnexus::guarded-rename`, which previews the edits a rename would make, stops at a gate for a decision on them, applies them where the decision says so, and reads the result back off the diff. The gate is declared in the run and arrives in each activity spliced from it, under the reference site's prefix, and is presented, answered and recorded like one written in the activity file. The positive case binds `walkArtifactPath`, a symbol the graph holds, so the preview lands an edit list with rows; the gate is answered with the applying option, the rename writes the edits and `change_report` reads back what moved. The negative case binds `no_such_symbol_zz`, a symbol the graph does not hold, so the preview lands an empty `changes` list; the gate is answered with the refusing option, so `rename_approved` lands false and `change_report` stays absent because the steps after the gate did not run. That combination — an empty list, a refused gate, an absent report — is the fallback the run promises for a symbol outside the graph, and the report names it as such rather than as an accepted rename that moved nothing.

The positive case writes a rename into the checkout the graph covers and leaves a diff behind. Point this at a scratch checkout, not at work you care about.

What the walk evidences is the reference under two bindings: the same run resolves under `gitnexus::guarded-rename` twice, its preview, its gate and its two gated steps splice into each activity under that activity's prefix, and its three outputs land under the names the reference sites bind. The closing activity reports both against the shared [case report](/conformance/resources/case-report.md) guide.

| Activity | Refers to | Binding |
|---|---|---|
| `positive-case` | `guarded-rename` | a symbol the graph holds, the gate accepting |
| `negative-case` | `guarded-rename` | a symbol the graph does not hold, the gate refusing |
| `report-cases` | nothing — states what the two bindings landed | |
